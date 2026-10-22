import { useCallback, useEffect, useRef, useState } from 'react';

import { SUPPORTED_TTS_LANGUAGES } from '@/constants/ttsLanguages';
import { MALAYALAM_TTS_PRESETS } from '@/constants/ttsModels';
import { nativeTtsService } from '@/services/speech';
import { ttsSettingsStore, useTtsSettings } from '@/stores/ttsSettingsStore';
import type { TtsBenchmarkResult, TtsVoiceOption } from '@/types/ttsSettings';

export interface UseTtsBenchmarkResult {
  // Configured Voice Info (from persistent store)
  configuredLanguageCode: string;
  configuredLanguageName: string;
  configuredVoiceId: string | null;
  rate: number;
  pitch: number;

  // Available installed voices & Temporary Voice Override
  availableVoices: readonly TtsVoiceOption[];
  isLoadingVoices: boolean;
  overrideVoiceId: string | null;
  effectiveVoiceId: string | null;
  isOverrideActive: boolean;
  setOverrideVoiceId: (voiceId: string | null) => void;
  resetOverride: () => void;

  // Test Utterance State
  selectedPresetId: string;
  inputText: string;
  selectPreset: (presetId: string) => void;
  updateInputText: (text: string) => void;

  // Diagnostics Metrics & Execution
  isSynthesizing: boolean;
  isPlaying: boolean;
  synthesisError: string | null;
  lastBenchmark: TtsBenchmarkResult | null;
  playTest: () => Promise<void>;
  stopTest: () => Promise<void>;
}

export function useTtsBenchmark(): UseTtsBenchmarkResult {
  const config = useTtsSettings();
  const configuredLanguageCode = config.preferredLanguage;

  const currentLangDef =
    SUPPORTED_TTS_LANGUAGES.find((l) => l.code === configuredLanguageCode) ??
    SUPPORTED_TTS_LANGUAGES[0];

  const langConfig = ttsSettingsStore.getLanguageConfig(configuredLanguageCode);
  const configuredVoiceId = langConfig.voiceId;

  // Installed voices on the Android device for the configured language
  const initialCachedVoices = nativeTtsService.getCachedVoicesForLanguage(configuredLanguageCode);
  const [availableVoices, setAvailableVoices] = useState<readonly TtsVoiceOption[]>(
    initialCachedVoices ?? []
  );
  const [isLoadingVoices, setIsLoadingVoices] = useState<boolean>(!initialCachedVoices);

  // Temporary in-memory voice override for Diagnostics testing (does NOT persist to store)
  const [overrideVoiceId, setOverrideVoiceId] = useState<string | null>(null);

  // Initial text and preset setup
  const initialPreset = MALAYALAM_TTS_PRESETS[0];
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    configuredLanguageCode === 'ml-IN' ? initialPreset.id : 'sample-text'
  );
  const [inputText, setInputText] = useState<string>(
    configuredLanguageCode === 'ml-IN' ? initialPreset.text : currentLangDef.sampleText
  );

  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [synthesisError, setSynthesisError] = useState<string | null>(null);
  const [lastBenchmark, setLastBenchmark] = useState<TtsBenchmarkResult | null>(null);

  const isExecutingRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(0);
  const speechStartRef = useRef<number>(0);
  const prevLangRef = useRef<string>(configuredLanguageCode);

  // Synchronously synchronize state during render if configuredLanguageCode changed
  if (prevLangRef.current !== configuredLanguageCode) {
    prevLangRef.current = configuredLanguageCode;
    const nextCached = nativeTtsService.getCachedVoicesForLanguage(configuredLanguageCode);
    setAvailableVoices(nextCached ?? []);
    setIsLoadingVoices(!nextCached);
    setOverrideVoiceId(null);
    setLastBenchmark(null);
    setSynthesisError(null);

    if (configuredLanguageCode === 'ml-IN') {
      setSelectedPresetId(MALAYALAM_TTS_PRESETS[0].id);
      setInputText(MALAYALAM_TTS_PRESETS[0].text);
    } else {
      setSelectedPresetId('sample-text');
      setInputText(currentLangDef.sampleText);
    }
  }

  // Load available voices for configured language
  useEffect(() => {
    let cancelled = false;
    if (!nativeTtsService.hasCachedVoices()) {
      setIsLoadingVoices(true);
    }

    nativeTtsService
      .getVoicesForLanguage(configuredLanguageCode)
      .then((voices) => {
        if (!cancelled) {
          setAvailableVoices(voices);
          setIsLoadingVoices(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn('[useTtsBenchmark] Failed to load voices:', err);
          setIsLoadingVoices(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [configuredLanguageCode]);

  // Sync with native playback state
  useEffect(() => {
    const unsub = nativeTtsService.subscribePlayback((state) => {
      setIsPlaying(state.isSpeaking);
    });
    return () => {
      unsub();
      nativeTtsService.stop();
    };
  }, []);

  const selectPreset = useCallback(
    (presetId: string) => {
      if (presetId === 'sample-text') {
        setSelectedPresetId('sample-text');
        setInputText(currentLangDef.sampleText);
        setSynthesisError(null);
        return;
      }

      const preset = MALAYALAM_TTS_PRESETS.find((item) => item.id === presetId);
      if (!preset) return;

      setSelectedPresetId(preset.id);
      setInputText(preset.text);
      setSynthesisError(null);
    },
    [currentLangDef.sampleText]
  );

  const updateInputText = useCallback((text: string) => {
    setInputText(text);
    setSelectedPresetId('');
    setSynthesisError(null);
  }, []);

  const resetOverride = useCallback(() => {
    setOverrideVoiceId(null);
  }, []);

  const effectiveVoiceId = overrideVoiceId !== null ? overrideVoiceId : configuredVoiceId;
  const isOverrideActive = overrideVoiceId !== null && overrideVoiceId !== configuredVoiceId;

  const playTest = useCallback(async () => {
    const textToSpeak = inputText.trim();
    if (!textToSpeak || isExecutingRef.current) return;

    isExecutingRef.current = true;
    setIsSynthesizing(true);
    setSynthesisError(null);

    const callStart = Date.now();
    startTimeRef.current = callStart;
    speechStartRef.current = callStart;

    try {
      await nativeTtsService.speak(textToSpeak, {
        language: configuredLanguageCode,
        voice: effectiveVoiceId ?? undefined,
        rate: langConfig.rate,
        pitch: langConfig.pitch,
        volume: langConfig.volume,
        onStart: () => {
          const now = Date.now();
          speechStartRef.current = now;
          setIsSynthesizing(false);
          setIsPlaying(true);
        },
        onDone: () => {
          const totalEnd = Date.now();
          const startupLatency = Math.max(1, speechStartRef.current - callStart);
          const speechDuration = Math.max(1, totalEnd - speechStartRef.current);

          setLastBenchmark({
            text: textToSpeak,
            language: configuredLanguageCode,
            voiceId: effectiveVoiceId ?? undefined,
            startupLatencyMs: startupLatency,
            totalDurationMs: speechDuration,
            isCompleted: true,
            wasInterrupted: false,
            timestamp: totalEnd,
          });
          setIsPlaying(false);
          isExecutingRef.current = false;
        },
        onStopped: () => {
          const totalEnd = Date.now();
          setLastBenchmark({
            text: textToSpeak,
            language: configuredLanguageCode,
            voiceId: effectiveVoiceId ?? undefined,
            startupLatencyMs: Math.max(1, speechStartRef.current - callStart),
            totalDurationMs: Math.max(1, totalEnd - speechStartRef.current),
            isCompleted: false,
            wasInterrupted: true,
            timestamp: totalEnd,
          });
          setIsPlaying(false);
          isExecutingRef.current = false;
        },
        onError: (err) => {
          setSynthesisError(err.message);
          setIsPlaying(false);
          isExecutingRef.current = false;
        },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setSynthesisError(message);
      setIsPlaying(false);
      isExecutingRef.current = false;
    } finally {
      setIsSynthesizing(false);
    }
  }, [
    configuredLanguageCode,
    effectiveVoiceId,
    inputText,
    langConfig.pitch,
    langConfig.rate,
    langConfig.volume,
  ]);

  const stopTest = useCallback(async () => {
    await nativeTtsService.stop();
    setIsPlaying(false);
    setIsSynthesizing(false);
    isExecutingRef.current = false;
  }, []);

  return {
    configuredLanguageCode,
    configuredLanguageName: currentLangDef.name,
    configuredVoiceId,
    rate: langConfig.rate,
    pitch: langConfig.pitch,
    availableVoices,
    isLoadingVoices,
    overrideVoiceId,
    effectiveVoiceId,
    isOverrideActive,
    setOverrideVoiceId,
    resetOverride,
    selectedPresetId,
    inputText,
    isSynthesizing,
    isPlaying,
    synthesisError,
    lastBenchmark,
    selectPreset,
    updateInputText,
    playTest,
    stopTest,
  };
}
