import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform, TurboModuleRegistry } from 'react-native';
import type { TtsEngine } from 'react-native-sherpa-onnx/tts';

import { DEFAULT_TTS_MODEL } from '@/constants/ttsModels';
import type { TtsModelMetadata, TtsSynthesisResult } from '@/types/tts';

export type { TtsSynthesisResult };

export class TextToSpeechService {
  private static isNativeSupported: boolean | null = null;
  private static activeEngine: TtsEngine | null = null;
  private static activeModelId: string | null = null;
  private static initPromise: Promise<TtsEngine> | null = null;
  private static synthesisQueue: Promise<unknown> = Promise.resolve();

  /**
   * Diagnostic check for native Sherpa-ONNX TTS runtime support.
   */
  static checkNativeSupport(): boolean {
    if (this.isNativeSupported !== null) {
      return this.isNativeSupported;
    }

    if (Platform.OS === 'web') {
      this.isNativeSupported = false;
      return false;
    }

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
      const sherpaTts = require('react-native-sherpa-onnx/tts');
      this.isNativeSupported = typeof sherpaTts?.createTTS === 'function';
    } catch {
      this.isNativeSupported = false;
    }

    return this.isNativeSupported ?? false;
  }

  /**
   * Initializes the native Sherpa-ONNX TTS engine instance.
   * Serializes concurrent calls and preserves active instance for identical modelId.
   */
  static async initialize(model: TtsModelMetadata = DEFAULT_TTS_MODEL): Promise<TtsEngine> {
    if (this.activeEngine && this.activeModelId === model.id) {
      return this.activeEngine;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      if (!this.checkNativeSupport()) {
        throw new Error('Native Sherpa-ONNX TTS module is not available in the current runtime.');
      }

      if (this.activeEngine) {
        await this.destroy();
      }

      // Self-healing check: if the model folder exists in app files but is incomplete (e.g. interrupted copy),
      // purge it so native SherpaOnnx re-extracts the full assets from the APK.
      if (FileSystem.documentDirectory) {
        try {
          const targetModelDir = `${FileSystem.documentDirectory}models/${model.id}`;
          const dirInfo = await FileSystem.getInfoAsync(targetModelDir);
          if (dirInfo.exists) {
            const tokensInfo = await FileSystem.getInfoAsync(`${targetModelDir}/tokens.txt`);
            if (!tokensInfo.exists) {
              console.warn(
                `[TextToSpeechService] Incomplete model directory detected at ${targetModelDir}. Purging to re-extract from assets.`
              );
              await FileSystem.deleteAsync(targetModelDir, { idempotent: true });
            }
          }
        } catch {
          // Ignore filesystem query errors and let native resolver proceed
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createTTS } = require('react-native-sherpa-onnx/tts');

      const engine: TtsEngine = await createTTS({
        modelPath: { type: 'asset', path: `models/${model.id}` },
        modelType: model.architecture,
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
   * Synthesizes text into offline speech audio and writes a unique WAV file to disk.
   * Serialized to avoid concurrent native generation race conditions or file locks.
   */
  static async synthesize(
    text: string,
    options?: { speed?: number; model?: TtsModelMetadata }
  ): Promise<TtsSynthesisResult> {
    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error('Text to synthesize cannot be empty.');
    }

    // Queue synthesis sequentially to protect against concurrent file/engine access
    return new Promise<TtsSynthesisResult>((resolve, reject) => {
      this.synthesisQueue = this.synthesisQueue
        .then(async () => {
          const engine = await this.initialize(options?.model ?? DEFAULT_TTS_MODEL);

          const startTime = Date.now();
          const generated = await engine.generateSpeech(trimmed, {
            speed: options?.speed ?? 1.0,
          });
          const synthesisTimeMs = Math.max(1, Date.now() - startTime);

          const sampleRate = generated.sampleRate || 22050;
          const samplesCount = generated.samples?.length || 0;
          const durationSec = samplesCount > 0 ? samplesCount / sampleRate : 0;
          const rtf = durationSec > 0 ? synthesisTimeMs / (durationSec * 1000) : 0;

          // Unique temp file path in cache directory to prevent collision with active players
          const cacheDir = FileSystem.cacheDirectory ?? '';
          const filename = `tts_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.wav`;
          const fullUri = `${cacheDir}${filename}`;
          const rawCleanPath = fullUri.startsWith('file://')
            ? decodeURI(fullUri.replace(/^file:\/\//, ''))
            : fullUri;

          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { saveAudioToFile } = require('react-native-sherpa-onnx/tts');
          await saveAudioToFile(generated, rawCleanPath);

          resolve({
            audioUri: fullUri,
            rawPath: rawCleanPath,
            sampleRate,
            samplesCount,
            durationSec,
            synthesisTimeMs,
            rtf,
          });
        })
        .catch(reject);
    });
  }

  /**
   * Releases active TTS engine instance and native C++ resources.
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
