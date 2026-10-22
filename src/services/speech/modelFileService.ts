/**
 * @deprecated Use ModelFileService and ModelReadinessService from '@/services/models' instead.
 * Preserved for backwards compatibility with direct file imports.
 */

import { DEFAULT_SPEECH_MODEL } from '@/constants/speechModels';
import { RuntimeEnvironment } from '@/services/models';
import { ModelReadinessService } from '@/services/models/modelReadinessService';
import type {
  FileStorageSource,
  ModelFileInspection,
  ModelInspectionResult,
  ModelInstallationStatus,
  ModelPathConfig,
  SpeechModelMetadata,
} from '@/types/speech';

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
    const readiness = await ModelReadinessService.checkModelReadiness(model.id);
    if (readiness.storageLocation === 'app_storage' && readiness.resolvedPath) {
      return {
        type: 'file',
        path: readiness.resolvedPath.replace(/^file:\/\//, '').replace(/\/+$/, ''),
      };
    }
    return {
      type: 'asset',
      path: `models/${model.id}`,
    };
  }

  /**
   * Checks whether an STT model is bundled into the Android APK assets.
   */
  static async isModelBundledInAssets(modelId: string): Promise<boolean> {
    return await ModelReadinessService.isModelBundledInApkAssets(modelId);
  }
}
