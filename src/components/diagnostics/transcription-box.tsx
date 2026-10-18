import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export interface TranscriptionBoxProps {
  text?: string | null;
  title?: string;
  tag?: string;
  emptyFallbackText?: string;
}

export function TranscriptionBox({
  text,
  title = 'Transcription',
  tag = 'On-Device INT8',
  emptyFallbackText = '(empty / silence detected)',
}: TranscriptionBoxProps) {
  return (
    <View className="p-3.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 gap-2">
      <View className="flex-row items-center justify-between">
        <ThemedText type="smallBold" className="text-emerald-700 dark:text-emerald-300">
          {title}
        </ThemedText>
        {tag ? (
          <ThemedText type="code" className="text-emerald-700 dark:text-emerald-300">
            {tag}
          </ThemedText>
        ) : null}
      </View>
      <ThemedText type="lead" className="text-foreground leading-7">
        &ldquo;{text || emptyFallbackText}&rdquo;
      </ThemedText>
    </View>
  );
}
