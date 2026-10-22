import type { UnifiedModelPackage } from './types';

const HF_REPO_ID =
  process.env.EXPO_PUBLIC_HF_REPO_ID || 'anuroop0003/malayalam-speech-studio-models';
const HF_RAW_BASE = `https://huggingface.co/${HF_REPO_ID}/resolve/main`;

export const STT_INDIC_CONFORMER_MODEL: UnifiedModelPackage = {
  id: 'sherpa-onnx-indic-conformer-ml',
  name: 'Sherpa-ONNX IndicConformer (Malayalam STT)',
  category: 'stt',
  description:
    'Quantized INT8 multilingual speech-to-text model optimized for real-time Malayalam conversational turns.',
  totalSizeBytes: 141240753, // ~141.2 MB
  targetDirectory: 'models/sherpa-onnx-indic-conformer-ml',
  language: 'Malayalam & 21 Indic Languages',
  languageCode: 'ml',
  architecture: 'NeMo CTC / IndicConformer',
  modelType: 'nemo_ctc',
  sampleRate: 16000,
  files: [
    {
      filename: 'model.int8.onnx',
      remoteUrl: `${HF_RAW_BASE}/stt/sherpa-onnx-indic-conformer-ml/model.int8.onnx`,
      relativePath: 'model.int8.onnx',
      fileSizeBytes: 141173148,
      isRequired: true,
      description: 'Quantized INT8 acoustic neural network weights (ARM NEON optimized)',
    },
    {
      filename: 'tokens.txt',
      remoteUrl: `${HF_RAW_BASE}/stt/sherpa-onnx-indic-conformer-ml/tokens.txt`,
      relativePath: 'tokens.txt',
      fileSizeBytes: 67605,
      isRequired: true,
      description: 'Multilingual character and subword vocabulary table',
    },
  ],
};

export const AVAILABLE_STT_MODELS: readonly UnifiedModelPackage[] = [STT_INDIC_CONFORMER_MODEL];

export const DEFAULT_STT_MODEL = STT_INDIC_CONFORMER_MODEL;
