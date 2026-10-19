import type { SttEngine } from 'react-native-sherpa-onnx/stt';

import { DEFAULT_SPEECH_MODEL } from '@/constants/speechModels';
import { FsAdapter, RuntimeEnvironment } from '@/services/models';
import type { SpeechModelMetadata, SttTranscriptionResult } from '@/types/speech';
import { ModelFileService } from './modelFileService';

export type { SttTranscriptionResult };

export class SpeechRecognitionService {
  private static isNativeSupported: boolean | null = null;
  private static activeEngine: SttEngine | null = null;
  private static activeModelId: string | null = null;
  private static initPromise: Promise<SttEngine> | null = null;

  /**
   * Checks if native react-native-sherpa-onnx module is linked in the current runtime.
   */
  static checkNativeSupport(): boolean {
    if (this.isNativeSupported !== null) {
      return this.isNativeSupported;
    }

    this.isNativeSupported = RuntimeEnvironment.isSherpaNativeSupported();
    return this.isNativeSupported;
  }

  private static activeTranscription: Promise<unknown> | null = null;

  /**
   * Initializes the native Sherpa-ONNX STT engine instance for runtime recognition.
   * Validates physical model presence on disk before returning any cached instance or creating a new one.
   */
  static async initialize(model: SpeechModelMetadata = DEFAULT_SPEECH_MODEL): Promise<SttEngine> {
    // 1. Enforce verified model presence on disk before returning cached engine
    const { ModelReadinessService } = await import('@/services/models/modelReadinessService');
    const readiness = await ModelReadinessService.checkModelReadiness(model.id);

    if (!readiness.isReady) {
      if (this.activeEngine) {
        await this.destroy();
      }
      throw new Error(
        `Required STT model files for "${model.name}" are missing on disk. Please download the model before initializing speech recognition.`
      );
    }

    // 2. Return active cached engine only after confirming files exist
    if (this.activeEngine && this.activeModelId === model.id) {
      return this.activeEngine;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      if (!this.checkNativeSupport()) {
        throw new Error('Native Sherpa-ONNX module is not available in the current runtime.');
      }

      if (this.activeEngine) {
        await this.destroy();
      }

      let modelPathConfig: { type: 'file' | 'asset'; path: string };
      if (readiness.storageLocation === 'app_storage' && readiness.resolvedPath) {
        modelPathConfig = {
          type: 'file',
          path: readiness.resolvedPath.replace(/^file:\/\//, '').replace(/\/+$/, ''),
        };
      } else if (readiness.storageLocation === 'bundled_asset') {
        modelPathConfig = {
          type: 'asset',
          path: `models/${model.id}`,
        };
      } else {
        modelPathConfig = await ModelFileService.resolveModelPathConfig(model);
      }

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createSTT } = require('react-native-sherpa-onnx/stt');

      const engine = await createSTT({
        modelPath: modelPathConfig,
        preferInt8: true,
        modelType: model.modelType,
      });

      this.activeEngine = engine;
      this.activeModelId = model.id;
      return engine;
    })();

    try {
      return await this.initPromise;
    } finally {
      this.initPromise = null;
    }
  }

  /**
   * Transcribes a 16kHz audio file using the active engine.
   * Strips file:// URI schemes to raw filesystem paths for native File reader compatibility.
   */
  static async transcribeFile(filePath: string): Promise<SttTranscriptionResult> {
    const engine = await this.initialize();

    const cleanPath = filePath.startsWith('file://')
      ? decodeURI(filePath.replace(/^file:\/\//, ''))
      : filePath;

    const op = engine.transcribeFile(cleanPath);
    this.activeTranscription = op;
    try {
      return await op;
    } finally {
      if (this.activeTranscription === op) {
        this.activeTranscription = null;
      }
    }
  }

  /**
   * Transcribes raw audio samples (PCM 16kHz float array).
   */
  static async transcribeSamples(
    samples: number[],
    sampleRate: number
  ): Promise<SttTranscriptionResult> {
    const engine = await this.initialize();

    const op = engine.transcribeSamples(samples, sampleRate);
    this.activeTranscription = op;
    try {
      return await op;
    } finally {
      if (this.activeTranscription === op) {
        this.activeTranscription = null;
      }
    }
  }

  /**
   * Converts a recorded audio file (e.g. M4A/AAC from Expo Audio) to 16kHz WAV
   * and transcribes it using the active on-device Sherpa-ONNX model.
   * Intermediate 16kHz WAV file is cleaned up after completion.
   */
  static async transcribeRecordedAudio(recordedUri: string): Promise<SttTranscriptionResult> {
    if (!recordedUri) {
      throw new Error('No audio file URI provided for transcription.');
    }

    if (!this.activeEngine) {
      await this.initialize();
    }

    const cleanInputPath = recordedUri.startsWith('file://')
      ? decodeURI(recordedUri.replace(/^file:\/\//, ''))
      : recordedUri;

    const tempWavPath = `${FsAdapter.getCacheDirectory()}call_stt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.wav`;
    const cleanOutputPath = tempWavPath.startsWith('file://')
      ? decodeURI(tempWavPath.replace(/^file:\/\//, ''))
      : tempWavPath;

    try {
      let result: SttTranscriptionResult;

      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const sherpaAudio = require('react-native-sherpa-onnx/audio');
        if (typeof sherpaAudio?.convertAudioToWav16k === 'function') {
          await sherpaAudio.convertAudioToWav16k(cleanInputPath, cleanOutputPath);
          result = await this.transcribeFile(cleanOutputPath);
        } else {
          throw new Error('Native audio conversion unavailable.');
        }
      } catch (convErr) {
        // Fallback: try direct PCM float samples decoding
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const sherpaAudio = require('react-native-sherpa-onnx/audio');
        if (typeof sherpaAudio?.decodeAudioFileToFloatSamples === 'function') {
          const decoded = await sherpaAudio.decodeAudioFileToFloatSamples(cleanInputPath, 16000);
          result = await this.transcribeSamples(decoded.samples, decoded.sampleRate || 16000);
        } else {
          throw convErr;
        }
      }

      return result;
    } finally {
      // Ensure temp WAV is deleted
      try {
        const info = await FsAdapter.getInfoAsync(tempWavPath);
        if (info.exists) {
          await FsAdapter.deleteAsync(tempWavPath, { idempotent: true });
        }
      } catch {
        // Ignore deletion cleanup error
      }
    }
  }

  /**
   * Destroys active engine instance and releases native resources.
   */
  static async destroy(): Promise<void> {
    if (this.activeTranscription) {
      try {
        await this.activeTranscription;
      } catch {
        // Ignore in-flight transcription error
      }
    }

    if (this.activeEngine) {
      try {
        await this.activeEngine.destroy();
      } finally {
        this.activeEngine = null;
        this.activeModelId = null;
      }
    }
  }
}
