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

export class ModelRegistry {
  private static allModels: readonly UnifiedModelPackage[] = [
    ...AVAILABLE_STT_MODELS,
    ...AVAILABLE_TTS_MODELS,
    ...AVAILABLE_LLM_MODELS,
  ];

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
    return this.allModels.find((m) => m.id === id);
  }

  static getDefaultModel(category: ModelCategory): UnifiedModelPackage {
    switch (category) {
      case 'stt':
        return DEFAULT_STT_MODEL;
      case 'tts':
        return DEFAULT_TTS_MODEL;
      case 'llm':
        return DEFAULT_LLM_MODEL;
    }
  }
}
