import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { filterVoicesForLanguage, SUPPORTED_TTS_LANGUAGES } from '@/constants/ttsLanguages';
import { nativeTtsService } from '@/services/speech';
import { ttsSettingsStore, useTtsSettings } from '@/stores/ttsSettingsStore';
import type { TtsLanguageDef, TtsVoiceOption } from '@/types/ttsSettings';
import { cn } from '@/utils/cn';
import { TtsLanguageCard } from './tts-language-card';

export interface TtsModelsHubProps {
  initialLanguage?: string;
}

export function TtsModelsHub({ initialLanguage }: TtsModelsHubProps = {}) {
  const config = useTtsSettings();

  const [voices, setVoices] = useState<readonly TtsVoiceOption[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [playingLanguageId, setPlayingLanguageId] = useState<string | null>(null);
  const [activeLanguageFilter, setActiveLanguageFilter] = useState<string>(
    initialLanguage ?? 'all'
  );

  useEffect(() => {
    if (initialLanguage) {
      setActiveLanguageFilter(initialLanguage);
    }
  }, [initialLanguage]);

  const loadVoices = useCallback(async (force = false) => {
    setIsRefreshing(true);
    try {
      const detected = await nativeTtsService.getAvailableVoices(force);
      setVoices(detected);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadVoices();

    const unsubscribe = nativeTtsService.subscribePlayback((state) => {
      if (!state.isSpeaking) {
        setPlayingLanguageId(null);
      }
    });

    return () => {
      unsubscribe();
      nativeTtsService.stop();
    };
  }, [loadVoices]);

  const handlePlayPreview = async (
    lang: TtsLanguageDef,
    draftParams?: { voiceId?: string | null; rate?: number; pitch?: number }
  ) => {
    setPlayingLanguageId(lang.id);

    const langConfig = ttsSettingsStore.getLanguageConfig(lang.code);
    const langVoices = await nativeTtsService.getVoicesForLanguage(lang.code);
    const activeVoiceId =
      draftParams?.voiceId !== undefined
        ? draftParams.voiceId
        : (langConfig.voiceId ?? langVoices[0]?.identifier);
    const activeRate = draftParams?.rate ?? langConfig.rate;
    const activePitch = draftParams?.pitch ?? langConfig.pitch;

    try {
      await nativeTtsService.speak(lang.sampleText, {
        language: lang.code,
        voice: activeVoiceId ?? undefined,
        rate: activeRate,
        pitch: activePitch,
        volume: langConfig.volume,
        onDone: () => setPlayingLanguageId(null),
        onStopped: () => setPlayingLanguageId(null),
        onError: () => setPlayingLanguageId(null),
      });
    } catch {
      setPlayingLanguageId(null);
    }
  };

  const handleStopPreview = async () => {
    await nativeTtsService.stop();
    setPlayingLanguageId(null);
  };

  const activeLangDef =
    SUPPORTED_TTS_LANGUAGES.find((l) => l.code === config.preferredLanguage) ??
    SUPPORTED_TTS_LANGUAGES[0];

  // Language filter tabs matching Diagnostics STT pattern
  const filterTabs = [
    { id: 'all', label: `All (${SUPPORTED_TTS_LANGUAGES.length})` },
    ...SUPPORTED_TTS_LANGUAGES.map((lang) => ({
      id: lang.id,
      label: lang.nativeName,
    })),
  ];

  const displayedLanguages =
    activeLanguageFilter === 'all'
      ? SUPPORTED_TTS_LANGUAGES
      : SUPPORTED_TTS_LANGUAGES.filter((lang) => lang.id === activeLanguageFilter);

  return (
    <View className="gap-3">
      {/* 1. Horizontal Scrollable Language Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6, paddingVertical: 2 }}
      >
        {filterTabs.map((tab) => {
          const isActive = activeLanguageFilter === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveLanguageFilter(tab.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${tab.label} filter tab`}
              className={cn(
                'py-1.5 px-3 rounded-md border active:opacity-75',
                isActive ? 'bg-primary border-primary' : 'bg-card border-border'
              )}
            >
              <ThemedText
                type={isActive ? 'smallBold' : 'small'}
                className={cn(isActive ? 'text-primary-foreground' : 'text-foreground')}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* 4. Filtered Language Cards List */}
      <View className="gap-3">
        {displayedLanguages.map((lang) => {
          const isPreferred = config.preferredLanguage === lang.code;
          const isPlaying = playingLanguageId === lang.id;
          const langConfig = ttsSettingsStore.getLanguageConfig(lang.code);

          // Filter voices specifically matching this language and region
          const matchedVoices = filterVoicesForLanguage(voices, lang);

          return (
            <TtsLanguageCard
              key={lang.id}
              language={lang}
              isPreferred={isPreferred}
              isPlaying={isPlaying}
              voices={matchedVoices}
              selectedVoiceId={langConfig.voiceId}
              rate={langConfig.rate}
              pitch={langConfig.pitch}
              onSelectPreferred={() => {
                ttsSettingsStore.setPreferredLanguage(lang.code, langConfig.voiceId);
              }}
              onSelectVoice={(voiceId) => {
                ttsSettingsStore.setLanguageVoice(lang.code, voiceId);
              }}
              onUpdateRate={(rate) => {
                ttsSettingsStore.setLanguageRate(lang.code, rate);
              }}
              onUpdatePitch={(pitch) => {
                ttsSettingsStore.setLanguagePitch(lang.code, pitch);
              }}
              onSaveConfig={(params) => {
                ttsSettingsStore.saveLanguageConfig(lang.code, params);
              }}
              onPlayPreview={(params) => handlePlayPreview(lang, params)}
              onStopPreview={handleStopPreview}
              onOpenSettings={() => nativeTtsService.openTtsSettings()}
            />
          );
        })}
      </View>
    </View>
  );
}
