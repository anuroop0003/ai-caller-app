import type { TtsLanguageAvailability, TtsVoiceOption } from '@/types/ttsSettings';

export interface TtsSpeakOptions {
  readonly language?: string;
  readonly voice?: string;
  readonly rate?: number;
  readonly pitch?: number;
  readonly volume?: number;
  readonly onStart?: () => void;
  readonly onDone?: () => void;
  readonly onStopped?: () => void;
  readonly onError?: (error: Error) => void;
}

export interface ITtsRuntime {
  getAvailableVoices(): Promise<readonly TtsVoiceOption[]>;
  speak(text: string, options?: TtsSpeakOptions): Promise<void>;
  stop(): Promise<void>;
  isSpeaking(): Promise<boolean>;
  checkLanguageAvailability(languageCode: string): Promise<TtsLanguageAvailability>;
  openTtsSettings(): Promise<void>;
}
