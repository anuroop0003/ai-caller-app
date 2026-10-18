import { ActivityIndicator, Pressable } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/utils/cn';

export interface TranscriptionCtaButtonProps {
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  className?: string;
}

export function TranscriptionCtaButton({
  onPress,
  disabled = false,
  isLoading = false,
  loadingText = 'Generating...',
  className,
}: TranscriptionCtaButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = Colors[isDark ? 'dark' : 'light'];

  return (
    <Pressable
      disabled={disabled || isLoading}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={isLoading ? loadingText : 'Convert recorded audio to transcript'}
      className={cn(
        'py-2.5 px-4 rounded-md bg-primary flex-row items-center justify-center gap-2 active:opacity-85 shadow-sm',
        (disabled || isLoading) && 'opacity-75',
        className
      )}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={themeColors.primaryForeground}
          style={{ transform: [{ scale: 0.85 }] }}
        />
      ) : (
        <Ionicons name="sparkles" size={16} color={themeColors.primaryForeground} />
      )}
      <ThemedText type="smallBold" className="text-primary-foreground font-semibold text-sm">
        {isLoading ? loadingText : 'Convert Audio to Transcript'}
      </ThemedText>
    </Pressable>
  );
}
