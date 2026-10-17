import { SpeechModelMetadata } from '@/types/speech';

/**
 * Dedicated Malayalam IndicConformer STT model definition.
 * INT8 weights and vocabulary tokens are bundled by default into the Android APK assets.
 * FP32 weights are an acoustic baseline and omitted from bundled APK assets.
 */
export const INDIC_CONFORMER_ML_MODEL: SpeechModelMetadata = {
  id: 'sherpa-onnx-indic-conformer-ml',
  name: 'IndicConformer Multilingual',
  language: 'Malayalam, Hindi, Tamil & 19 Indic Languages',
  languageCode: 'ml',
  architecture: 'NeMo CTC / IndicConformer',
  sampleRate: 16000,
  modelType: 'nemo_ctc',
  files: [
    {
      name: 'model.int8.onnx',
      type: 'int8',
      description: 'Quantized INT8 weights (Mobile ARM CPU optimized, low memory)',
      expectedSizeBytes: 141173148,
      isRequired: true,
      bundledByDefault: true,
    },
    {
      name: 'model.onnx',
      type: 'fp32',
      description: 'Full precision FP32 weights (Acoustic baseline, higher accuracy)',
      expectedSizeBytes: 493060445,
      isRequired: false,
      bundledByDefault: false,
    },
    {
      name: 'tokens.txt',
      type: 'tokens',
      description: 'Multilingual vocabulary table (5,630+ tokens across 22 Indian languages)',
      expectedSizeBytes: 67605,
      isRequired: true,
      bundledByDefault: true,
    },
  ],
} as const;

export const DEFAULT_SPEECH_MODEL = INDIC_CONFORMER_ML_MODEL;
