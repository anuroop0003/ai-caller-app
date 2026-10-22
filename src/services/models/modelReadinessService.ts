import {
  type ModelReadinessResult,
  type ModelReadinessStatus,
  type UnifiedModelPackage,
} from '@/constants/models';
import { RuntimeEnvironment } from './internal/runtimeEnvironment';
import { ModelFileService } from './modelFileService';
import { ModelRegistry } from './modelRegistry';

export type ReadinessChangeListener = (modelId?: string) => void;

export class ModelReadinessService {
  private static readinessListeners = new Set<ReadinessChangeListener>();
  private static readinessCache = new Map<string, ModelReadinessResult>();

  /**
   * Retrieves synchronously cached readiness result for a model if available.
   */
  static getCachedReadiness(modelId: string): ModelReadinessResult | null {
    return this.readinessCache.get(modelId) ?? null;
  }

  /**
   * Clears the in-memory readiness cache for a specific model or all models.
   */
  static clearCache(modelId?: string): void {
    if (modelId) {
      this.readinessCache.delete(modelId);
    } else {
      this.readinessCache.clear();
    }
  }

  /**
   * Subscribes to model readiness change events (e.g., deletions, downloads, cache evictions).
   */
  static subscribe(listener: ReadinessChangeListener): () => void {
    this.readinessListeners.add(listener);
    return () => {
      this.readinessListeners.delete(listener);
    };
  }

  /**
   * Broadcasts a model change or deletion event to all subscribers and evicts cached state.
   */
  static notifyModelChanged(modelId?: string): void {
    this.clearCache(modelId);
    this.readinessListeners.forEach((cb) => {
      try {
        cb(modelId);
      } catch (e) {
        console.error('[ModelReadinessService] Listener error:', e);
      }
    });
  }

  /**
   * Diagnostic check for native Sherpa-ONNX runtime capability.
   */
  static isSherpaNativeSupported(): boolean {
    return RuntimeEnvironment.isSherpaNativeSupported();
  }

  /**
   * Diagnostic check for native llama.rn bridge capability.
   */
  static isLlamaNativeSupported(): boolean {
    return RuntimeEnvironment.isLlamaNativeSupported();
  }

  /**
   * Checks whether an STT or TTS model is pre-bundled in the APK assets.
   */
  static async isModelBundledInApkAssets(modelId: string): Promise<boolean> {
    if (RuntimeEnvironment.isNode()) return false;
    if (!this.isSherpaNativeSupported()) return false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const sherpa = require('react-native-sherpa-onnx');
      if (typeof sherpa?.listAssetModels === 'function') {
        const assetModels: Array<{ folder: string }> = await sherpa.listAssetModels();
        return Array.isArray(assetModels) && assetModels.some((item) => item.folder === modelId);
      }
    } catch (e) {
      console.warn('[ModelReadinessService] listAssetModels check failed:', e);
    }
    return false;
  }

  /**
   * Evaluates the complete verified readiness of a model package.
   */
  static async checkModelReadiness(
    modelOrId: string | UnifiedModelPackage
  ): Promise<ModelReadinessResult> {
    const model = typeof modelOrId === 'string' ? ModelRegistry.getModelById(modelOrId) : modelOrId;

    if (!model) {
      return {
        modelId: typeof modelOrId === 'string' ? modelOrId : 'unknown',
        category: 'stt',
        status: 'not_downloaded',
        isReady: false,
        storageLocation: 'none',
        resolvedPath: null,
        files: [],
        missingFiles: [],
        errorMessage: `Model not found in registry: ${String(modelOrId)}`,
      };
    }

    let result: ModelReadinessResult;

    // Android System TTS does not require on-disk neural file downloads
    if (model.category === 'tts') {
      result = {
        modelId: model.id,
        category: 'tts',
        status: 'ready',
        isReady: true,
        storageLocation: 'none',
        resolvedPath: 'android_system_tts',
        files: [],
        missingFiles: [],
      };
      this.readinessCache.set(model.id, result);
      return result;
    }

    // 1. Verify app-private storage files
    let verification;
    try {
      verification = await ModelFileService.verifyModelFiles(model);
    } catch (err) {
      result = {
        modelId: model.id,
        category: model.category,
        status: 'failed',
        isReady: false,
        storageLocation: 'none',
        resolvedPath: null,
        files: [],
        missingFiles: [],
        errorMessage: err instanceof Error ? err.message : String(err),
      };
      return result;
    }

    const existingRequiredCount = verification.files.filter((f) => f.isRequired && f.exists).length;

    // Check if fully verified in app storage
    if (verification.isComplete) {
      const resolvedPath =
        model.category === 'llm'
          ? ModelFileService.getFilePath(model, model.files[0]?.relativePath ?? '')
          : ModelFileService.getModelDir(model);

      result = {
        modelId: model.id,
        category: model.category,
        status: 'ready',
        isReady: true,
        storageLocation: 'app_storage',
        resolvedPath,
        files: verification.files,
        missingFiles: [],
      };
      this.readinessCache.set(model.id, result);
      return result;
    }

    // 2. Check bundled asset fallback for STT
    if (model.category === 'stt') {
      const isBundled = await this.isModelBundledInApkAssets(model.id);
      if (isBundled) {
        result = {
          modelId: model.id,
          category: model.category,
          status: 'ready',
          isReady: true,
          storageLocation: 'bundled_asset',
          resolvedPath: `models/${model.id}`,
          files: verification.files,
          missingFiles: [],
        };
        this.readinessCache.set(model.id, result);
        return result;
      }
    }

    // 3. Status determination: incomplete vs not_downloaded
    let status: ModelReadinessStatus = 'not_downloaded';
    let storageLocation: 'app_storage' | 'bundled_asset' | 'none' = 'none';

    if (existingRequiredCount > 0) {
      status = 'incomplete';
      storageLocation = 'app_storage';
    }

    result = {
      modelId: model.id,
      category: model.category,
      status,
      isReady: false,
      storageLocation,
      resolvedPath: null,
      files: verification.files,
      missingFiles: verification.missingFiles,
    };
    this.readinessCache.set(model.id, result);
    return result;
  }

  static async checkSttReadiness(): Promise<ModelReadinessResult> {
    const defaultStt = ModelRegistry.getDefaultModel('stt');
    return this.checkModelReadiness(defaultStt);
  }

  static async checkTtsReadiness(): Promise<ModelReadinessResult> {
    const defaultTts = ModelRegistry.getDefaultModel('tts');
    return this.checkModelReadiness(defaultTts);
  }

  static async checkLlmReadiness(modelId?: string): Promise<ModelReadinessResult> {
    const model = modelId
      ? ModelRegistry.getModelById(modelId)
      : ModelRegistry.getDefaultModel('llm');
    return this.checkModelReadiness(model ?? ModelRegistry.getDefaultModel('llm'));
  }

  /**
   * Unified check across all 3 components for the AI caller pipeline.
   */
  static async checkFullPipelineReadiness(): Promise<{
    isReady: boolean;
    stt: ModelReadinessResult;
    tts: ModelReadinessResult;
    llm: ModelReadinessResult;
    missingSummary: string[];
  }> {
    const [stt, tts, llm] = await Promise.all([
      this.checkSttReadiness(),
      this.checkTtsReadiness(),
      this.checkLlmReadiness(),
    ]);

    const missingSummary: string[] = [];
    if (!stt.isReady) missingSummary.push('STT (Speech Recognition)');
    if (!tts.isReady) missingSummary.push('TTS (Speech Synthesis)');
    if (!llm.isReady) missingSummary.push('LLM (Text Generation)');

    return {
      isReady: stt.isReady && tts.isReady && llm.isReady,
      stt,
      tts,
      llm,
      missingSummary,
    };
  }
}
