import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemeToggleButton } from '@/components/layout/theme-toggle-button';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/utils/cn';

interface StudioTopBarProps {
  className?: string;
}

export function StudioTopBar({ className }: StudioTopBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      className={cn(
        'w-full px-4 pt-2 pb-2 flex-row items-center justify-between',
        className
      )}>
      {/* Brand & Subtitle */}
      <View className="flex-row items-center gap-2.5">
        <View className="w-9 h-9 rounded-md bg-primary/10 border border-primary/20 items-center justify-center">
          <Ionicons name="mic" size={18} color={isDark ? '#60a5fa' : '#2563eb'} />
        </View>
        <View className="gap-0.5">
          <ThemedText type="h4" className="text-foreground leading-tight tracking-tight">
            AI Caller
          </ThemedText>
          <ThemedText type="muted" className="text-muted-foreground text-xs font-medium">
            Malayalam Speech Studio
          </ThemedText>
        </View>
      </View>

      {/* Theme Toggle Button */}
      <ThemeToggleButton />
    </View>
  );
}
