import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { cn } from '@/utils/cn';

export interface RecorderErrorBannerProps {
  error: string | null;
  className?: string;
}

export function RecorderErrorBanner({ error, className }: RecorderErrorBannerProps) {
  if (!error) return null;

  return (
    <View
      className={cn(
        'p-3 rounded-md border border-red-500/30 bg-red-500/10 flex-row items-center gap-2',
        className
      )}
    >
      <Ionicons name="alert-circle" size={16} color="#e11d48" />
      <ThemedText type="small" className="text-red-600 dark:text-red-400 text-xs flex-1">
        {error}
      </ThemedText>
    </View>
  );
}
