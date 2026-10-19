import { DEFAULT_SPEECH_MODEL } from '@/constants/speechModels';
import { RuntimeEnvironment } from '@/services/models';
import type {
  FileStorageSource,
  ModelFileInspection,
  ModelInspectionResult,
  ModelInstallationStatus,
  ModelPathConfig,
  SpeechModelMetadata,
} from '@/types/speech';
import type { TtsModelMetadata } from '@/types/tts';

export type {
  FileStorageSource,
  ModelFileInspection,
  ModelInspectionResult,
  ModelInstallationStatus,
  ModelPathConfig,
};

export interface NativeSupportDiagnostic {
  supported: boolean;
  reason?: string;
}

export class ModelFileService {
  /**
   * Diagnostic check for native Sherpa-ONNX runtime availability.
   */
  static checkNativeSupport(): NativeSupportDiagnostic {
    if (RuntimeEnvironment.isWeb()) {
      return {
        supported: false,
        reason: 'Web runtime is not supported. Sherpa-ONNX requires an Android/iOS native runtime.',
      };
    }

    if (RuntimeEnvironment.isExpoGo()) {
      return {
        supported: false,
        reason:
          'Expo Go does not include custom native TurboModules. Please use a development build.',
      };
    }

    if (!RuntimeEnvironment.isSherpaNativeSupported()) {
      return {
        supported: false,
        reason: 'Native SherpaOnnx TurboModule is not linked in this build.',
      };
    }

    return { supported: true };
  }

  /**
   * Resolves the native ModelPathConfig for Sherpa-ONNX, prioritizing verified downloaded
   * storage, falling back to APK bundled assets.
   */
  static async resolveModelPathConfig(
    model: SpeechModelMetadata = DEFAULT_SPEECH_MODEL
  ): Promise<ModelPathConfig> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('expo-file-system/legacy');
      if (fs?.documentDirectory) {
        const localDir = `${fs.documentDirectory}models/${model.id}`;
        const cleanPath = localDir.replace(/^file:\/\//, '');
        const info = await fs.getInfoAsync(`${localDir}/model.int8.onnx`);
        if (info.exists) {
          return { type: 'file', path: cleanPath };
        }
      }
    } catch {
      // Ignore and fallback
    }

    const isBundled = await this.isModelBundledInAssets(model.id);
    if (isBundled) {
      return { type: 'asset', path: `models/${model.id}` };
    }

    throw new Error(
      `Model files for "${model.name}" are missing on disk. Please download the model before initializing speech recognition.`
    );
  }

  /**
   * Checks whether the model folder is present in the app's bundled APK assets.
   */
  static async isModelBundledInAssets(modelId: string): Promise<boolean> {
    const nativeCheck = this.checkNativeSupport();
    if (!nativeCheck.supported) {
      return false;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const sherpa = require('react-native-sherpa-onnx');
      if (typeof sherpa?.listAssetModels === 'function') {
        const assetModels: Array<{ folder: string }> = await sherpa.listAssetModels();
        return Array.isArray(assetModels) && assetModels.some((item) => item.folder === modelId);
      }
    } catch (err) {
      console.warn('[ModelFileService] Could not check bundled assets:', err);
    }

    return false;
  }

  /**
   * Inspects model status against native runtime support and packaged APK assets.
   */
  static async inspectModelFiles(
    model: SpeechModelMetadata | TtsModelMetadata = DEFAULT_SPEECH_MODEL
  ): Promise<ModelInspectionResult> {
    const nativeCheck = this.checkNativeSupport();

    if (!nativeCheck.supported) {
      const unavailableFiles: ModelFileInspection[] = model.files.map((spec) => ({
        name: spec.name,
        type: spec.type,
        description: spec.description,
        exists: false,
        source: 'not_found',
        isRequired: spec.isRequired,
      }));

      return {
        status: 'unavailable',
        storageSource: 'none',
        installedCount: 0,
        files: unavailableFiles,
        error: nativeCheck.reason,
      };
    }

    const isBundled = await this.isModelBundledInAssets(model.id);

    const inspectedFiles: ModelFileInspection[] = model.files.map((spec) => {
      const exists = isBundled && spec.bundledByDefault;
      return {
        name: spec.name,
        type: spec.type,
        description:
          spec.type === 'fp32'
            ? 'Full precision FP32 baseline (omitted from APK to keep size lean; INT8 is active)'
            : spec.description,
        exists,
        sizeBytes: exists ? spec.expectedSizeBytes : undefined,
        source: exists ? 'bundled_asset' : 'not_found',
        isRequired: spec.isRequired,
        path: exists ? `models/${model.id}/${spec.name}` : undefined,
      };
    });

    const hasRequiredFiles = inspectedFiles.filter((f) => f.isRequired).every((f) => f.exists);

    const status: ModelInstallationStatus = hasRequiredFiles ? 'installed' : 'not_installed';

    return {
      status,
      storageSource: isBundled ? 'bundled' : 'none',
      installedCount: inspectedFiles.filter((f) => f.exists).length,
      files: inspectedFiles,
      error: !isBundled
        ? `Model folder 'models/${model.id}' was not discovered in the APK bundled assets.`
        : undefined,
    };
  }
}
