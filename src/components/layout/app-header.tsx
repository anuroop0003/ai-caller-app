import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemeToggleButton } from '@/components/layout/theme-toggle-button';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/utils/cn';

export interface AppHeaderProps {
  /**
   * Title text displayed in the header. Defaults to 'AI Caller'.
   */
  title?: string;
  /**
   * Subtitle text displayed below the title (e.g. 'Malayalam Speech Studio', 'Audio Diagnostics', 'Speech Models').
   */
  subtitle?: string;
  /**
   * Icon displayed next to the brand title. Defaults to 'mic'.
   */
  icon?: keyof typeof Ionicons.glyphMap;
  /**
   * Optional right accessory component. Defaults to the <ThemeToggleButton />.
   */
  rightAccessory?: ReactNode;
  /**
   * Optional custom styling class for the container.
   */
  className?: string;
}

export function AppHeader({
  title = 'AI Caller',
  subtitle,
  icon = 'mic',
  rightAccessory,
  className,
}: AppHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = Colors[isDark ? 'dark' : 'light'].primaryForeground;

  return (
    <View
      className={cn(
        'w-full px-4 py-2 flex-row items-center justify-between',
        className
      )}>
      {/* Brand & Subtitle */}
      <View className="flex-row items-center gap-2.5">
        <View className="w-10 h-10 rounded-md bg-primary items-center justify-center shadow-sm">
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View className="gap-0.5">
          <ThemedText type="h4" className="text-foreground leading-tight tracking-tight">
            {title}
          </ThemedText>
          {subtitle ? (
            <ThemedText type="muted" className="text-muted-foreground text-xs font-medium">
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
      </View>

      {/* Right Accessory (Defaults to ThemeToggleButton) */}
      {rightAccessory !== undefined ? rightAccessory : <ThemeToggleButton />}
    </View>
  );
}
