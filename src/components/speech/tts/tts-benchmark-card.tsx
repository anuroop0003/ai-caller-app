import { View } from 'react-native';

import { useAudioPreviewPlayer } from '@/hooks/use-audio-preview-player';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTtsBenchmark } from '@/hooks/use-tts-benchmark';

import { TtsActionButtons } from './tts-action-buttons';
import { TtsErrorBanner } from './tts-error-banner';
import { TtsHeader } from './tts-header';
import { TtsInputSection } from './tts-input-section';
import { TtsMetricsPanel } from './tts-metrics-panel';

export function TtsBenchmarkCard() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const {
    selectedPresetId,
    inputText,
    isSynthesizing,
    synthesisError,
    lastResult,
    selectPreset,
    updateInputText,
    synthesize,
  } = useTtsBenchmark();

  const {
    isPlaying,
    play,
    stop,
    error: playbackError,
  } = useAudioPreviewPlayer(lastResult?.audioUri ?? null);

  const handleSynthesize = async () => {
    stop();
    await synthesize();
  };

  return (
    <View className="rounded-md p-4 border border-border bg-card gap-3">
      <TtsHeader isDark={isDark} />

      <TtsInputSection
        selectedPresetId={selectedPresetId}
        inputText={inputText}
        onSelectPreset={selectPreset}
        onChangeText={updateInputText}
        isDark={isDark}
      />

      <TtsErrorBanner message={synthesisError} severity="error" />
      <TtsErrorBanner message={playbackError} severity="warning" />

      <TtsMetricsPanel
        isSynthesizing={isSynthesizing}
        spokenText={lastResult ? inputText : undefined}
        result={lastResult}
      />

      <TtsActionButtons
        isSynthesizing={isSynthesizing}
        isPlaying={isPlaying}
        hasResult={lastResult !== null}
        canSynthesize={inputText.trim().length > 0}
        onSynthesize={handleSynthesize}
        onPlay={play}
      />
    </View>
  );
}
