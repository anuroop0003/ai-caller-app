import type { UnifiedModelPackage } from './types';

export const TTS_ANDROID_SYSTEM_MODEL: UnifiedModelPackage = {
  id: 'android-system-tts',
  name: 'Android System Text-to-Speech',
  category: 'tts',
  description:
    'Hardware-accelerated native Android speech synthesis engine (Google Speech Services / Samsung TTS) supporting Malayalam, Hindi, Tamil, and international languages.',
  totalSizeBytes: 0,
  targetDirectory: '',
  language: 'Multilingual (System)',
  voiceName: 'Dynamic System Voice',
  sampleRate: 24000,
  files: [],
};

export const AVAILABLE_TTS_MODELS: readonly UnifiedModelPackage[] = [TTS_ANDROID_SYSTEM_MODEL];

export const DEFAULT_TTS_MODEL = TTS_ANDROID_SYSTEM_MODEL;
