import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform, TurboModuleRegistry } from 'react-native';
import type { SttEngine } from 'react-native-sherpa-onnx/stt';

import { DEFAULT_SPEECH_MODEL } from '@/constants/speechModels';
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

    if (Platform.OS === 'web') {
      this.isNativeSupported = false;
      return false;
    }

    // Expo Go does not bundle custom C++ TurboModules
    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
      this.isNativeSupported = false;
      return false;
    }

    try {
      const hasTurboModule = TurboModuleRegistry.get('SherpaOnnx') != null;
      if (!hasTurboModule) {
        this.isNativeSupported = false;
        return false;
      }

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const sherpa = require('react-native-sherpa-onnx/stt');
      this.isNativeSupported = typeof sherpa?.createSTT === 'function';
    } catch {
      this.isNativeSupported = false;
    }

    return this.isNativeSupported ?? false;
  }

  /**
   * Initializes the native Sherpa-ONNX STT engine instance for runtime recognition.
   * Serializes concurrent initialization calls and preserves the active engine when
   * initializing the same model.
   */
  static async initialize(
    model: SpeechModelMetadata = DEFAULT_SPEECH_MODEL
  ): Promise<SttEngine> {
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

      const modelPathConfig = await ModelFileService.resolveModelPathConfig(model);

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
    if (!this.activeEngine) {
      await this.initialize();
    }

    if (!this.activeEngine) {
      throw new Error('Failed to initialize speech recognition engine.');
    }

    const cleanPath = filePath.startsWith('file://')
      ? decodeURI(filePath.replace(/^file:\/\//, ''))
      : filePath;

    return this.activeEngine.transcribeFile(cleanPath);
  }

  /**
   * Transcribes raw audio samples (PCM 16kHz float array).
   */
  static async transcribeSamples(
    samples: number[],
    sampleRate: number
  ): Promise<SttTranscriptionResult> {
    if (!this.activeEngine) {
      await this.initialize();
    }

    if (!this.activeEngine) {
      throw new Error('Failed to initialize speech recognition engine.');
    }

    return this.activeEngine.transcribeSamples(samples, sampleRate);
  }

  /**
   * Destroys active engine instance and releases native resources.
   */
  static async destroy(): Promise<void> {
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
