import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { cn } from '@/utils/cn';

export interface TranscriptionErrorBannerProps {
  error: string | null;
  className?: string;
}

export function TranscriptionErrorBanner({ error, className }: TranscriptionErrorBannerProps) {
  if (!error) return null;

  return (
    <View
      className={cn(
        'p-3 rounded-md border border-rose-500/30 bg-rose-500/10 flex-row items-center gap-2',
        className
      )}
    >
      <Ionicons name="alert-circle" size={16} color="#e11d48" />
      <ThemedText type="small" className="text-rose-600 dark:text-rose-400 text-xs flex-1">
        {error}
      </ThemedText>
    </View>
  );
}
