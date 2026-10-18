import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { cn } from '@/utils/cn';

export interface TtsErrorBannerProps {
  message: string | null;
  severity?: 'error' | 'warning';
}

export function TtsErrorBanner({ message, severity = 'error' }: TtsErrorBannerProps) {
  if (!message) return null;

  const isError = severity === 'error';

  return (
    <View
      className={cn(
        'p-2.5 rounded-md flex-row items-center gap-2 border',
        isError ? 'bg-destructive/10 border-destructive/30' : 'bg-amber-500/10 border-amber-500/30'
      )}
    >
      <Ionicons
        name={isError ? 'alert-circle' : 'warning'}
        size={16}
        color={isError ? '#ef4444' : '#f59e0b'}
      />
      <ThemedText
        type="small"
        className={cn(
          'text-xs flex-1',
          isError ? 'text-destructive' : 'text-amber-600 dark:text-amber-400'
        )}
      >
        {message}
      </ThemedText>
    </View>
  );
}
