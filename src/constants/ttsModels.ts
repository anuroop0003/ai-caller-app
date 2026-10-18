import { TtsModelMetadata } from '@/types/tts';

/**
 * Dedicated Malayalam Piper VITS offline voice model definition.
 * Bundled directly in APK assets at models/vits-piper-ml_IN-meera-medium
 */
export const PIPER_MEERA_ML_MODEL: TtsModelMetadata = {
  id: 'vits-piper-ml_IN-meera-medium',
  name: 'Piper Meera (Malayalam)',
  language: 'Malayalam (India)',
  languageCode: 'ml',
  voiceName: 'Meera',
  gender: 'female',
  architecture: 'vits',
  sampleRate: 22050,
} as const;

export const DEFAULT_TTS_MODEL = PIPER_MEERA_ML_MODEL;

export interface TtsPresetPhrase {
  readonly id: string;
  readonly label: string;
  readonly text: string;
  readonly category:
    | 'greeting'
    | 'conversational'
    | 'call_handling'
    | 'appointment'
    | 'otp'
    | 'closing'
    | 'numerals';
}

export const MALAYALAM_TTS_PRESETS: readonly TtsPresetPhrase[] = [
  {
    id: 'preset-greeting',
    label: 'Call Greeting',
    text: 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ AI അസിസ്റ്റന്റാണ്. എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാനാകും?',
    category: 'greeting',
  },
  {
    id: 'preset-busy-screening',
    label: 'Call Screening',
    text: 'ക്ഷമിക്കണം, അദ്ദേഹം ഇപ്പോൾ ഒരു പ്രധാന മീറ്റിംഗിലാണ്. എന്തെങ്കിലും അത്യാവശ്യ സന്ദേശമുണ്ടോ?',
    category: 'call_handling',
  },
  {
    id: 'preset-appointment',
    label: 'Appointment',
    text: 'നാളെ രാവിലെ പത്ത് മണിക്ക് നിങ്ങളുടെ ഡോക്ടറുടെ അപ്പോയിന്റ്മെന്റ് നിശ്ചയിച്ചിട്ടുണ്ട്.',
    category: 'appointment',
  },
  {
    id: 'preset-otp-verification',
    label: 'OTP Alert',
    text: 'നിങ്ങളുടെ സ്ഥിരീകരണ കോഡ് ഏഴ്, രണ്ട്, പൂജ്യം, അഞ്ച് ആണ്. ഇത് ആരുമായും പങ്കിടരുത്.',
    category: 'otp',
  },
  {
    id: 'preset-call-transfer',
    label: 'Call Transfer',
    text: 'ദയവായി അല്പസമയം കാത്തിരിക്കൂ, ഞാൻ നിങ്ങളുടെ കോൾ കസ്റ്റമർ കെയറിലേക്ക് കൈമാറാം.',
    category: 'call_handling',
  },
  {
    id: 'preset-call-closing',
    label: 'Sign-off',
    text: 'വിളിച്ചതിന് വളരെ നന്ദി. നിങ്ങൾക്ക് നല്ലൊരു ദിവസം ആശംസിക്കുന്നു!',
    category: 'closing',
  },
  {
    id: 'preset-conversational',
    label: 'Quick Hello',
    text: 'നമസ്കാരം, സുഖമാണോ? എന്തൊക്കെയുണ്ട് വിശേഷങ്ങൾ?',
    category: 'conversational',
  },
] as const;
