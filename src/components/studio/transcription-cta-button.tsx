import { Pressable } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/utils/cn';

export interface TranscriptionCtaButtonProps {
  onPress: () => void;
  disabled?: boolean;
  className?: string;
}

export function TranscriptionCtaButton({
  onPress,
  disabled = false,
  className,
}: TranscriptionCtaButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = Colors[isDark ? 'dark' : 'light'];

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Convert recorded audio to transcript"
      className={cn(
        'py-2.5 px-4 rounded-md bg-primary flex-row items-center justify-center gap-2 active:opacity-85 shadow-sm',
        disabled && 'opacity-60',
        className
      )}>
      <Ionicons name="sparkles" size={16} color={themeColors.primaryForeground} />
      <ThemedText type="smallBold" className="text-primary-foreground font-semibold text-sm">
        Convert Audio to Transcript
      </ThemedText>
    </Pressable>
  );
}
