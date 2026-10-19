import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/utils/cn';

export interface DiagnosticsAlertBannerProps {
  type?: 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function DiagnosticsAlertBanner({
  type = 'error',
  title,
  message,
  onDismiss,
  className,
}: DiagnosticsAlertBannerProps) {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const config = {
    error: {
      container: 'bg-red-500/10 border-red-500/30',
      titleColor: 'text-red-700 dark:text-red-400',
      icon: 'alert-circle-outline' as const,
      iconColor: isDark ? '#f87171' : '#ef4444',
    },
    warning: {
      container: 'bg-amber-500/10 border-amber-500/30',
      titleColor: 'text-amber-800 dark:text-amber-400',
      icon: 'warning-outline' as const,
      iconColor: isDark ? '#fbbf24' : '#d97706',
    },
    info: {
      container: 'bg-blue-500/10 border-blue-500/30',
      titleColor: 'text-blue-700 dark:text-blue-400',
      icon: 'information-circle-outline' as const,
      iconColor: isDark ? '#60a5fa' : '#2563eb',
    },
  }[type];

  return (
    <View
      className={cn(
        'p-3.5 rounded-md border flex-row items-start justify-between gap-3',
        config.container,
        className
      )}
    >
      <View className="flex-row items-start gap-2.5 flex-1">
        <Ionicons name={config.icon} size={18} color={config.iconColor} style={{ marginTop: 1 }} />
        <View className="flex-1">
          {title ? (
            <ThemedText
              type="smallBold"
              className={cn(config.titleColor, 'text-xs font-semibold mb-0.5')}
            >
              {title}
            </ThemedText>
          ) : null}
          <ThemedText
            type="small"
            className={cn(title ? 'text-muted-foreground' : config.titleColor, 'text-xs leading-5')}
          >
            {message}
          </ThemedText>
        </View>
      </View>

      {onDismiss ? (
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss alert"
          className="p-1 rounded-md active:opacity-70 -mr-1 -mt-0.5"
        >
          <Ionicons name="close" size={16} color={theme.mutedForeground} />
        </Pressable>
      ) : null}
    </View>
  );
}
