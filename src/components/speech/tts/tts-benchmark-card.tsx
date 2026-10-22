import { View } from 'react-native';

import { router } from 'expo-router';

import { SUPPORTED_TTS_LANGUAGES } from '@/constants/ttsLanguages';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTtsBenchmark } from '@/hooks/use-tts-benchmark';

import { TtsActionButtons } from './tts-action-buttons';
import { TtsErrorBanner } from './tts-error-banner';
import { TtsHeader } from './tts-header';
import { TtsInputSection } from './tts-input-section';
import { TtsMetricsPanel } from './tts-metrics-panel';

import type { UseTtsBenchmarkResult } from '@/hooks/use-tts-benchmark';

export interface TtsBenchmarkCardProps {
  isReady?: boolean;
  benchmarkHook?: UseTtsBenchmarkResult;
}

export function TtsBenchmarkCard({
  isReady = true,
  benchmarkHook: externalHook,
}: TtsBenchmarkCardProps = {}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const internalHook = useTtsBenchmark();
  const {
    configuredLanguageCode,
    configuredVoiceId,
    rate,
    availableVoices,
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
  } = externalHook ?? internalHook;

  const langDef =
    SUPPORTED_TTS_LANGUAGES.find((l) => l.code === configuredLanguageCode) ??
    SUPPORTED_TTS_LANGUAGES[0];

  const configuredVoiceObj = availableVoices.find((v) => v.identifier === configuredVoiceId);
  const voiceLabel = configuredVoiceObj
    ? configuredVoiceObj.name || configuredVoiceObj.identifier
    : configuredVoiceId || 'Selected installed voice';

  return (
    <View className="gap-3">
      {/* Main Benchmark Card: Follows identical structure to STT and LLM tabs */}
      <View className="rounded-md p-4 border border-border bg-card gap-3 shadow-sm">
        {/* 1. Header: Icon, Title, Subtitle, and Status Badge */}
        <TtsHeader
          title={`${langDef.name} (${langDef.nativeName})`}
          subtitle={`${voiceLabel} • ${rate.toFixed(2)}× Rate`}
        />

        {/* 2. Presets & Input Text */}
        <TtsInputSection
          selectedPresetId={selectedPresetId}
          inputText={inputText}
          activeLanguageName={langDef.name}
          activeLanguageCode={configuredLanguageCode}
          onSelectPreset={selectPreset}
          onChangeText={updateInputText}
          isDark={isDark}
        />

        {/* 3. Error Banner (when error occurs) */}
        <TtsErrorBanner message={synthesisError} severity="error" />

        {/* 4. Output / Metrics Panel with Startup Latency & Speech Duration */}
        <TtsMetricsPanel
          isSynthesizing={isSynthesizing}
          isPlaying={isPlaying}
          benchmark={lastBenchmark}
        />

        {/* 5. Action Buttons */}
        <TtsActionButtons
          isSynthesizing={isSynthesizing}
          isPlaying={isPlaying}
          canPlay={inputText.trim().length > 0}
          onPlay={playTest}
          onStop={stopTest}
          onOpenSettings={() => {
            router.navigate({
              pathname: '/models',
              params: { category: 'tts', language: configuredLanguageCode },
            });
          }}
        />
      </View>
    </View>
  );
}
