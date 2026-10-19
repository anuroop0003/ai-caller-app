import {
  AVAILABLE_LLM_MODELS,
  AVAILABLE_STT_MODELS,
  AVAILABLE_TTS_MODELS,
  DEFAULT_LLM_MODEL,
  DEFAULT_STT_MODEL,
  DEFAULT_TTS_MODEL,
  type ModelCategory,
  type UnifiedModelPackage,
} from '@/constants/models';

/**
 * Single source of truth for unified model packages across STT, TTS, and LLM categories.
 */
export class ModelRegistry {
  private static readonly allModels: readonly UnifiedModelPackage[] = [
    ...AVAILABLE_STT_MODELS,
    ...AVAILABLE_TTS_MODELS,
    ...AVAILABLE_LLM_MODELS,
  ];

  private static readonly modelsById: ReadonlyMap<string, UnifiedModelPackage> = new Map(
    ModelRegistry.allModels.map((m) => [m.id, m])
  );

  static getAllModels(): readonly UnifiedModelPackage[] {
    return this.allModels;
  }

  static getModelsByCategory(category: ModelCategory): readonly UnifiedModelPackage[] {
    switch (category) {
      case 'stt':
        return AVAILABLE_STT_MODELS;
      case 'tts':
        return AVAILABLE_TTS_MODELS;
      case 'llm':
        return AVAILABLE_LLM_MODELS;
      default:
        return [];
    }
  }

  static getModelById(id: string): UnifiedModelPackage | undefined {
    return this.modelsById.get(id);
  }

  static getDefaultModel(category: ModelCategory): UnifiedModelPackage {
    switch (category) {
      case 'stt':
        return DEFAULT_STT_MODEL;
      case 'tts':
        return DEFAULT_TTS_MODEL;
      case 'llm':
        return DEFAULT_LLM_MODEL;
      default:
        throw new Error(
          `[ModelRegistry] Unsupported or invalid model category: "${String(category)}"`
        );
    }
  }
}
