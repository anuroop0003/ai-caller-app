export interface TtsVoiceOption {
  readonly identifier: string;
  readonly name: string;
  readonly language: string;
  readonly quality?: string;
  readonly isDefault?: boolean;
  readonly localService?: boolean;
}

export interface TtsLanguageConfig {
  readonly voiceId: string | null;
  readonly rate?: number;
  readonly pitch?: number;
}

export interface TtsConfig {
  readonly preferredLanguage: string;
  readonly selectedVoiceId: string | null;
  readonly rate: number;
  readonly pitch: number;
  readonly volume: number;
  readonly languageConfigs?: Record<string, TtsLanguageConfig>;
}

export interface TtsLanguageDef {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly nativeName: string;
  readonly script: string;
  readonly flagEmoji: string;
  readonly sampleText: string;
  readonly altCodes?: readonly string[];
}

export type TtsLanguageAvailability = 'installed' | 'missing' | 'checking';

export interface TtsPlaybackState {
  readonly isSpeaking: boolean;
  readonly activeUtteranceId: string | null;
  readonly activeLanguage: string | null;
}

export interface TtsBenchmarkResult {
  readonly text: string;
  readonly language: string;
  readonly voiceId?: string;
  readonly voiceName?: string;
  readonly startupLatencyMs: number;
  readonly totalDurationMs: number;
  readonly isCompleted: boolean;
  readonly wasInterrupted: boolean;
  readonly timestamp: number;
  readonly errorMessage?: string | null;
}
