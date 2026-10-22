import { useSyncExternalStore } from 'react';

import { DEFAULT_TTS_LANGUAGE_CODE } from '@/constants/ttsLanguages';
import { FsAdapter } from '@/services/models/internal/fsAdapter';
import type { TtsConfig } from '@/types/ttsSettings';

export const DEFAULT_TTS_CONFIG: TtsConfig = {
  preferredLanguage: DEFAULT_TTS_LANGUAGE_CODE,
  selectedVoiceId: null,
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  languageConfigs: {},
};

type Listener = () => void;

class TtsSettingsStore {
  private config: TtsConfig = DEFAULT_TTS_CONFIG;
  private listeners = new Set<Listener>();
  private isLoaded = false;

  constructor() {
    this.loadFromDisk();
  }

  getState = (): TtsConfig => {
    return this.config;
  };

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify(): void {
    this.listeners.forEach((fn) => fn());
    this.saveToDisk();
  }

  private getSettingsPath(): string | null {
    try {
      const docDir = FsAdapter.getDocumentDirectory();
      if (!docDir) return null;
      return `${docDir}tts_settings.json`;
    } catch {
      return null;
    }
  }

  private async loadFromDisk(): Promise<void> {
    if (this.isLoaded) return;
    try {
      const filePath = this.getSettingsPath();
      if (!filePath) {
        this.isLoaded = true;
        return;
      }
      const info = await FsAdapter.getInfoAsync(filePath);
      if (info.exists) {
        const content = await FsAdapter.readAsStringAsync(filePath);
        if (content) {
          const parsed = JSON.parse(content) as Partial<TtsConfig>;
          this.config = {
            preferredLanguage: parsed.preferredLanguage ?? DEFAULT_TTS_CONFIG.preferredLanguage,
            selectedVoiceId: parsed.selectedVoiceId ?? DEFAULT_TTS_CONFIG.selectedVoiceId,
            rate: typeof parsed.rate === 'number' ? parsed.rate : DEFAULT_TTS_CONFIG.rate,
            pitch: typeof parsed.pitch === 'number' ? parsed.pitch : DEFAULT_TTS_CONFIG.pitch,
            volume: typeof parsed.volume === 'number' ? parsed.volume : DEFAULT_TTS_CONFIG.volume,
            languageConfigs: parsed.languageConfigs ?? {},
          };
          this.isLoaded = true;
          this.listeners.forEach((fn) => fn());
          return;
        }
      }
      this.isLoaded = true;
    } catch {
      this.isLoaded = true;
    }
  }

  private async saveToDisk(): Promise<void> {
    try {
      const filePath = this.getSettingsPath();
      if (!filePath) return;
      await FsAdapter.writeAsStringAsync(filePath, JSON.stringify(this.config));
    } catch (err) {
      console.warn('[TtsSettingsStore] Failed to save TTS settings to disk:', err);
    }
  }

  getLanguageConfig(langCode: string): {
    voiceId: string | null;
    rate: number;
    pitch: number;
    volume: number;
  } {
    const langConfig = this.config.languageConfigs?.[langCode];
    const isPreferred = langCode === this.config.preferredLanguage;
    return {
      voiceId: langConfig?.voiceId ?? (isPreferred ? this.config.selectedVoiceId : null),
      rate: langConfig?.rate ?? (isPreferred ? this.config.rate : 1.0),
      pitch: langConfig?.pitch ?? (isPreferred ? this.config.pitch : 1.0),
      volume: this.config.volume,
    };
  }

  setPreferredLanguage(language: string, defaultVoiceId?: string | null): void {
    const existing = this.config.languageConfigs?.[language];
    const targetVoiceId =
      defaultVoiceId !== undefined ? defaultVoiceId : (existing?.voiceId ?? null);
    this.config = {
      ...this.config,
      preferredLanguage: language,
      selectedVoiceId: targetVoiceId,
      rate: existing?.rate ?? this.config.rate,
      pitch: existing?.pitch ?? this.config.pitch,
    };
    this.notify();
  }

  setLanguageVoice(langCode: string, voiceId: string | null): void {
    const existing = this.config.languageConfigs?.[langCode] ?? { voiceId: null };
    const updated = {
      ...this.config.languageConfigs,
      [langCode]: { ...existing, voiceId },
    };
    this.config = {
      ...this.config,
      selectedVoiceId:
        langCode === this.config.preferredLanguage ? voiceId : this.config.selectedVoiceId,
      languageConfigs: updated,
    };
    this.notify();
  }

  setLanguageRate(langCode: string, rate: number): void {
    const clamped = Math.max(0.5, Math.min(2.0, Number(rate.toFixed(2))));
    const existing = this.config.languageConfigs?.[langCode] ?? { voiceId: null };
    const updated = {
      ...this.config.languageConfigs,
      [langCode]: { ...existing, rate: clamped },
    };
    this.config = {
      ...this.config,
      rate: langCode === this.config.preferredLanguage ? clamped : this.config.rate,
      languageConfigs: updated,
    };
    this.notify();
  }

  setLanguagePitch(langCode: string, pitch: number): void {
    const clamped = Math.max(0.5, Math.min(1.5, Number(pitch.toFixed(2))));
    const existing = this.config.languageConfigs?.[langCode] ?? { voiceId: null };
    const updated = {
      ...this.config.languageConfigs,
      [langCode]: { ...existing, pitch: clamped },
    };
    this.config = {
      ...this.config,
      pitch: langCode === this.config.preferredLanguage ? clamped : this.config.pitch,
      languageConfigs: updated,
    };
    this.notify();
  }

  saveLanguageConfig(
    langCode: string,
    params: { voiceId?: string | null; rate?: number; pitch?: number }
  ): void {
    const existing = this.config.languageConfigs?.[langCode] ?? { voiceId: null };
    const updatedVoice = params.voiceId !== undefined ? params.voiceId : (existing.voiceId ?? null);
    const updatedRate =
      params.rate !== undefined
        ? Math.max(0.5, Math.min(2.0, Number(params.rate.toFixed(2))))
        : (existing.rate ?? 1.0);
    const updatedPitch =
      params.pitch !== undefined
        ? Math.max(0.5, Math.min(1.5, Number(params.pitch.toFixed(2))))
        : (existing.pitch ?? 1.0);

    const isPreferred = langCode === this.config.preferredLanguage;
    const updated = {
      ...this.config.languageConfigs,
      [langCode]: {
        ...existing,
        voiceId: updatedVoice,
        rate: updatedRate,
        pitch: updatedPitch,
      },
    };

    this.config = {
      ...this.config,
      selectedVoiceId: isPreferred ? updatedVoice : this.config.selectedVoiceId,
      rate: isPreferred ? updatedRate : this.config.rate,
      pitch: isPreferred ? updatedPitch : this.config.pitch,
      languageConfigs: updated,
    };
    this.notify();
  }

  setSelectedVoice(voiceId: string | null): void {
    if (this.config.selectedVoiceId === voiceId) return;
    this.setLanguageVoice(this.config.preferredLanguage, voiceId);
  }

  setRate(rate: number): void {
    const clamped = Math.max(0.5, Math.min(2.0, Number(rate.toFixed(2))));
    if (this.config.rate === clamped) return;
    this.config = { ...this.config, rate: clamped };
    this.notify();
  }

  setPitch(pitch: number): void {
    const clamped = Math.max(0.5, Math.min(1.5, Number(pitch.toFixed(2))));
    if (this.config.pitch === clamped) return;
    this.config = { ...this.config, pitch: clamped };
    this.notify();
  }

  setVolume(volume: number): void {
    const clamped = Math.max(0.0, Math.min(1.0, Number(volume.toFixed(2))));
    if (this.config.volume === clamped) return;
    this.config = { ...this.config, volume: clamped };
    this.notify();
  }

  resetDefaults(): void {
    this.config = DEFAULT_TTS_CONFIG;
    this.notify();
  }
}

export const ttsSettingsStore = new TtsSettingsStore();

export function useTtsSettings(): TtsConfig {
  return useSyncExternalStore(ttsSettingsStore.subscribe, ttsSettingsStore.getState);
}
