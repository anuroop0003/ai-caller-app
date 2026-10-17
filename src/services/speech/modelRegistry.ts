/**
 * Model Registry for Offline Speech-to-Text Models.
 *
 * Provides a centralized registry and lookup mechanism for configured speech recognition models.
 * Contains no filesystem operations, native module calls, or asynchronous logic.
 */

import { DEFAULT_SPEECH_MODEL, INDIC_CONFORMER_ML_MODEL } from '@/constants/speechModels';
import { SpeechModelMetadata } from '@/types/speech';

export const MODEL_REGISTRY = {
  [INDIC_CONFORMER_ML_MODEL.id]: INDIC_CONFORMER_ML_MODEL,
} satisfies Record<string, SpeechModelMetadata>;

export type SupportedModelId = keyof typeof MODEL_REGISTRY;

export function getModelMetadata(modelId: string = DEFAULT_SPEECH_MODEL.id): SpeechModelMetadata {
  const model = (MODEL_REGISTRY as Record<string, SpeechModelMetadata>)[modelId];
  if (!model) {
    throw new Error(`[ModelRegistry] Unknown model ID: "${modelId}"`);
  }
  return model;
}
