import type { UnifiedModelPackage } from './types';

const HF_REPO_ID =
  process.env.EXPO_PUBLIC_HF_REPO_ID || 'anuroop0003/malayalam-speech-studio-models';
const HF_RAW_BASE = `https://huggingface.co/${HF_REPO_ID}/resolve/main`;

export const TTS_PIPER_MEERA_MODEL: UnifiedModelPackage = {
  id: 'vits-piper-ml_IN-meera-medium',
  name: 'Piper Meera (Malayalam TTS)',
  category: 'tts',
  description:
    'Offline Piper VITS neural acoustic voice model and Malayalam eSpeak phonemizer for natural speech synthesis.',
  totalSizeBytes: 70230742, // ~70.2 MB compressed download
  targetDirectory: 'models/vits-piper-ml_IN-meera-medium',
  language: 'Malayalam (India)',
  voiceName: 'Meera (Female)',
  sampleRate: 22050,
  files: [
    {
      filename: 'ml_IN-meera-medium.onnx',
      remoteUrl: `${HF_RAW_BASE}/tts/vits-piper-ml_IN-meera-medium/ml_IN-meera-medium.onnx`,
      relativePath: 'ml_IN-meera-medium.onnx',
      fileSizeBytes: 62950174,
      isRequired: true,
      description: 'Piper VITS neural acoustic synthesis weights',
    },
    {
      filename: 'ml_IN-meera-medium.onnx.json',
      remoteUrl: `${HF_RAW_BASE}/tts/vits-piper-ml_IN-meera-medium/ml_IN-meera-medium.onnx.json`,
      relativePath: 'ml_IN-meera-medium.onnx.json',
      fileSizeBytes: 3113,
      isRequired: true,
      description: 'Audio parameters, phoneme ID mapping, and configuration',
    },
    {
      filename: 'tokens.txt',
      remoteUrl: `${HF_RAW_BASE}/tts/vits-piper-ml_IN-meera-medium/tokens.txt`,
      relativePath: 'tokens.txt',
      fileSizeBytes: 968,
      isRequired: true,
      description: 'Piper phoneme and punctuation token table',
    },
    {
      filename: 'espeak-ng-data.tar.bz2',
      remoteUrl: `${HF_RAW_BASE}/tts/vits-piper-ml_IN-meera-medium/espeak-ng-data.tar.bz2`,
      relativePath: 'espeak-ng-data.tar.bz2',
      fileSizeBytes: 7276487,
      isRequired: true,
      isArchive: true,
      extractedTargetDir: 'espeak-ng-data',
      description: 'eSpeak-ng pronunciation lexicon and Malayalam phonemizer data',
    },
  ],
};

export const AVAILABLE_TTS_MODELS: readonly UnifiedModelPackage[] = [TTS_PIPER_MEERA_MODEL];

export const DEFAULT_TTS_MODEL = TTS_PIPER_MEERA_MODEL;
