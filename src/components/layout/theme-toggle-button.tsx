import { Pressable } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/utils/cn';

interface ThemeToggleButtonProps {
  className?: string;
}

export function ThemeToggleButton({ className }: ThemeToggleButtonProps) {
  const colorScheme = useColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const isDark = colorScheme === 'dark';

  const toggleTheme = () => {
    setColorScheme(isDark ? 'light' : 'dark');
  };

  return (
    <Pressable
      onPress={toggleTheme}
      className={cn(
        'w-9 h-9 rounded-md bg-secondary border border-border items-center justify-center active:opacity-70',
        className
      )}
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={isDark ? '#facc15' : '#71717a'} />
    </Pressable>
  );
}
