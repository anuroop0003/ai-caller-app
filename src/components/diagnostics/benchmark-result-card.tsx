import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import type { BenchmarkRunResult } from '@/services/speech/audioBenchmarkService';

import { BenchmarkResultContent } from './benchmark-result-content';

export interface BenchmarkResultCardProps {
  result: BenchmarkRunResult | null;
  error: string | null;
  onClear: () => void;
}

export function BenchmarkResultCard({ result, error, onClear }: BenchmarkResultCardProps) {
  if (!result && !error) return null;

  if (error) {
    return (
      <View className="rounded-md p-4 bg-destructive/10 border border-destructive/30 gap-2">
        <View className="flex-row items-center justify-between">
          <ThemedText type="smallBold" className="text-destructive">
            Recognition Failed
          </ThemedText>
          <Pressable
            onPress={onClear}
            className="p-1 active:opacity-70"
            accessibilityLabel="Dismiss error"
          >
            <Ionicons name="close" size={16} color="#ef4444" />
          </Pressable>
        </View>
        <ThemedText type="small" className="text-foreground">
          {error}
        </ThemedText>
      </View>
    );
  }

  if (!result) return null;

  return <BenchmarkResultContent result={result} onClear={onClear} />;
}
