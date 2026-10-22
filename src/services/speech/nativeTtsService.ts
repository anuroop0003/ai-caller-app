import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { ActivityAction, startActivityAsync } from 'expo-intent-launcher';

import { filterVoicesForLanguage, SUPPORTED_TTS_LANGUAGES } from '@/constants/ttsLanguages';
import type {
  TtsLanguageAvailability,
  TtsPlaybackState,
  TtsVoiceOption,
} from '@/types/ttsSettings';
import type { ITtsRuntime, TtsSpeakOptions } from './ITtsRuntime';

type PlaybackListener = (state: TtsPlaybackState) => void;

export class NativeTtsService implements ITtsRuntime {
  private static instance: NativeTtsService | null = null;

  private cachedVoices: readonly TtsVoiceOption[] | null = null;
  private playbackListeners = new Set<PlaybackListener>();
  private activeUtteranceId: string | null = null;
  private activeLanguage: string | null = null;
  private isSpeakingState = false;

  static getInstance(): NativeTtsService {
    if (!this.instance) {
      this.instance = new NativeTtsService();
    }
    return this.instance;
  }

  // Playback state observer for reactive UI updates
  subscribePlayback(listener: PlaybackListener): () => void {
    this.playbackListeners.add(listener);
    listener(this.getPlaybackState());
    return () => {
      this.playbackListeners.delete(listener);
    };
  }

  getPlaybackState(): TtsPlaybackState {
    return {
      isSpeaking: this.isSpeakingState,
      activeUtteranceId: this.activeUtteranceId,
      activeLanguage: this.activeLanguage,
    };
  }

  private notifyPlaybackChange(): void {
    const state = this.getPlaybackState();
    this.playbackListeners.forEach((fn) => fn(state));
  }

  /**
   * Fetches and caches system TTS voices available on the Android device.
   */
  async getAvailableVoices(forceRefresh = false): Promise<readonly TtsVoiceOption[]> {
    if (this.cachedVoices && !forceRefresh) {
      return this.cachedVoices;
    }

    try {
      const rawVoices = await Speech.getAvailableVoicesAsync();
      const normalized: TtsVoiceOption[] = rawVoices.map((v) => ({
        identifier: v.identifier,
        name: v.name,
        language: v.language,
        quality: (v as { quality?: string }).quality,
      }));

      this.cachedVoices = normalized;
      return normalized;
    } catch (err) {
      console.warn('[NativeTtsService] Failed to get available voices:', err);
      return [];
    }
  }

  /**
   * Checks whether an individual language has installed voices on the device.
   */
  async checkLanguageAvailability(languageCode: string): Promise<TtsLanguageAvailability> {
    const voices = await this.getAvailableVoices();
    const langDef = SUPPORTED_TTS_LANGUAGES.find((l) => l.code === languageCode);
    if (!langDef) return 'missing';

    const matched = filterVoicesForLanguage(voices, langDef);
    return matched.length > 0 ? 'installed' : 'missing';
  }

  /**
   * Returns list of installed voices matching a specific language code.
   */
  async getVoicesForLanguage(languageCode: string): Promise<readonly TtsVoiceOption[]> {
    const voices = await this.getAvailableVoices();
    const langDef = SUPPORTED_TTS_LANGUAGES.find((l) => l.code === languageCode);
    if (!langDef) return [];

    return filterVoicesForLanguage(voices, langDef);
  }

  /**
   * Speaks the provided text using Android native TextToSpeech engine.
   * Settles cleanly with cancellation and error protection.
   */
  async speak(text: string, options: TtsSpeakOptions = {}): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    // Stop ongoing speech on the hardware without triggering spurious external state blips
    try {
      await Speech.stop();
    } catch {
      // Ignore
    }

    const { ttsSettingsStore } = await import('@/stores/ttsSettingsStore');
    const savedConfig = ttsSettingsStore.getState();

    const targetLanguage = options.language ?? savedConfig.preferredLanguage;
    const langConfig = ttsSettingsStore.getLanguageConfig(targetLanguage);

    const targetVoice =
      options.voice !== undefined ? options.voice : (langConfig.voiceId ?? undefined);
    const targetRate = options.rate ?? langConfig.rate;
    const targetPitch = options.pitch ?? langConfig.pitch;
    const targetVolume = options.volume ?? langConfig.volume;

    const utteranceId = `utt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    this.activeUtteranceId = utteranceId;
    this.activeLanguage = targetLanguage;
    this.isSpeakingState = true;
    this.notifyPlaybackChange();

    return new Promise<void>((resolve, reject) => {
      let settled = false;

      const finish = (wasError = false, errorObj?: Error) => {
        if (settled) return;
        settled = true;

        if (this.activeUtteranceId === utteranceId) {
          this.activeUtteranceId = null;
          this.activeLanguage = null;
          this.isSpeakingState = false;
          this.notifyPlaybackChange();
        }

        if (wasError && errorObj) {
          options.onError?.(errorObj);
          reject(errorObj);
        } else {
          resolve();
        }
      };

      try {
        Speech.speak(trimmed, {
          language: targetLanguage,
          voice: targetVoice,
          rate: targetRate,
          pitch: targetPitch,
          volume: targetVolume,
          onStart: () => {
            if (this.activeUtteranceId === utteranceId) {
              this.isSpeakingState = true;
              this.notifyPlaybackChange();
              options.onStart?.();
            }
          },
          onDone: () => {
            // Android often finishes synthesis while AudioTrack is still playing audio buffers.
            // Check Speech.isSpeakingAsync() until physical sound playback has truly finished.
            let pollCount = 0;
            const poller = setInterval(async () => {
              pollCount++;
              try {
                const stillSpeaking = await Speech.isSpeakingAsync();
                if (!stillSpeaking || pollCount >= 60 || this.activeUtteranceId !== utteranceId) {
                  clearInterval(poller);
                  if (this.activeUtteranceId === utteranceId) {
                    options.onDone?.();
                    finish(false);
                  }
                }
              } catch {
                clearInterval(poller);
                finish(false);
              }
            }, 150);
          },
          onStopped: () => {
            if (this.activeUtteranceId === utteranceId) {
              options.onStopped?.();
              finish(false);
            }
          },
          onError: (err) => {
            if (this.activeUtteranceId === utteranceId) {
              const error = err instanceof Error ? err : new Error(String(err));
              finish(true, error);
            }
          },
        });
      } catch (err) {
        finish(true, err instanceof Error ? err : new Error(String(err)));
      }
    });
  }

  /**
   * Immediately stops any active TTS playback on the device.
   */
  async stop(): Promise<void> {
    try {
      await Speech.stop();
    } catch {
      // Ignore stop errors if not speaking
    } finally {
      this.isSpeakingState = false;
      this.activeUtteranceId = null;
      this.activeLanguage = null;
      this.notifyPlaybackChange();
    }
  }

  /**
   * Queries if the native engine is currently vocalizing.
   */
  async isSpeaking(): Promise<boolean> {
    try {
      const isExpoSpeaking = await Speech.isSpeakingAsync();
      return isExpoSpeaking || this.isSpeakingState;
    } catch {
      return this.isSpeakingState;
    }
  }

  /**
   * Opens Android's system Text-To-Speech Settings or Voice Data Installer.
   */
  async openTtsSettings(): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      // Primary documented entry point for TTS engine and voice settings
      await startActivityAsync(ActivityAction.TTS_SETTINGS);
    } catch (err) {
      console.warn('[NativeTtsService] TTS_SETTINGS intent failed, trying INSTALL_TTS_DATA:', err);
      try {
        await startActivityAsync('android.speech.tts.engine.INSTALL_TTS_DATA');
      } catch (installErr) {
        console.warn('[NativeTtsService] INSTALL_TTS_DATA intent also failed:', installErr);
      }
    }
  }
}

export const nativeTtsService = NativeTtsService.getInstance();
