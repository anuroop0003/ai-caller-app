import type { TtsLanguageDef, TtsVoiceOption } from '@/types/ttsSettings';

export const SUPPORTED_TTS_LANGUAGES: readonly TtsLanguageDef[] = [
  {
    id: 'ml-IN',
    code: 'ml-IN',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    script: 'മലയാളം',
    flagEmoji: '🇮🇳',
    sampleText: 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ AI അസിസ്റ്റന്റാണ്. സുഖമാണോ?',
    altCodes: ['ml', 'mal', 'ml_IN'],
  },
  {
    id: 'hi-IN',
    code: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    script: 'देवनागरी',
    flagEmoji: '🇮🇳',
    sampleText: 'नमस्ते! मैं आपका एआई सहायक हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?',
    altCodes: ['hi', 'hin', 'hi_IN'],
  },
  {
    id: 'ta-IN',
    code: 'ta-IN',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    script: 'தமிழ்',
    flagEmoji: '🇮🇳',
    sampleText: 'வணக்கம்! நான் உங்கள் AI உதவியாளர். உங்களுக்கு இன்று நான் எப்படி உதவ முடியும்?',
    altCodes: ['ta', 'tam', 'ta_IN'],
  },
  {
    id: 'kn-IN',
    code: 'kn-IN',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    script: 'ಕನ್ನಡ',
    flagEmoji: '🇮🇳',
    sampleText: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ಸಹಾಯಕ. ನಿಮಗೆ ಇಂದು ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
    altCodes: ['kn', 'kan', 'kn_IN'],
  },
  {
    id: 'te-IN',
    code: 'te-IN',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    script: 'తెలుగు',
    flagEmoji: '🇮🇳',
    sampleText: 'నమస్కారం! నేను మీ AI సహాయకుడిని. మీకు ఎలా సహాయం చేయగలను?',
    altCodes: ['te', 'tel', 'te_IN'],
  },
  {
    id: 'bn-IN',
    code: 'bn-IN',
    name: 'Bengali',
    nativeName: 'বাংলা',
    script: 'বাংলা',
    flagEmoji: '🇮🇳',
    sampleText: 'নমস্কার! আমি আপনার এআই সহকারী। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?',
    altCodes: ['bn', 'ben', 'bn_IN'],
  },
  {
    id: 'en-IN',
    code: 'en-IN',
    name: 'Indian English',
    nativeName: 'English (India)',
    script: 'Latin',
    flagEmoji: '🇮🇳',
    sampleText: 'Hello! I am your AI caller assistant. How can I help you today?',
    altCodes: ['en_IN'],
  },
  {
    id: 'en-US',
    code: 'en-US',
    name: 'Global English',
    nativeName: 'English (US)',
    script: 'Latin',
    flagEmoji: '🌐',
    sampleText: 'Hello! I am your AI assistant. How may I assist you with your call today?',
    altCodes: ['en', 'eng', 'en_US', 'en-GB'],
  },
] as const;

export const DEFAULT_TTS_LANGUAGE_CODE = 'ml-IN';

export function filterVoicesForLanguage<T extends TtsVoiceOption>(
  voices: readonly T[],
  lang: TtsLanguageDef
): readonly T[] {
  const targetCode = lang.code.toLowerCase().replace('_', '-');
  const [targetLang] = targetCode.split('-');

  return voices.filter((v) => {
    const vLang = v.language.toLowerCase().replace('_', '-');
    const vId = v.identifier.toLowerCase().replace('_', '-');

    if (targetLang === 'en') {
      if (targetCode === 'en-in') {
        // Only Indian English voices (e.g. en-IN, en_IN)
        return vLang === 'en-in' || vId.includes('en-in');
      }
      if (targetCode === 'en-us') {
        // US / Global English voices (excluding en-IN to avoid duplicate voice clutter)
        return (
          (vLang === 'en-us' || vLang === 'en' || vLang.startsWith('en-')) &&
          !vLang.includes('en-in') &&
          !vId.includes('en-in')
        );
      }
    }

    const codesToMatch = [
      targetCode,
      targetLang,
      ...(lang.altCodes?.map((c) => c.toLowerCase().replace('_', '-')) ?? []),
    ];

    return codesToMatch.some(
      (c) =>
        vLang === c ||
        vLang.startsWith(`${c}-`) ||
        vId.startsWith(`${c}-`) ||
        vId.includes(`-${c}-`)
    );
  });
}
