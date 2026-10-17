import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { cn } from '@/utils/cn';

interface DiagnosticsAlertBannerProps {
  type?: 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onDismiss?: () => void;
}

export function DiagnosticsAlertBanner({
  type = 'error',
  title,
  message,
  onDismiss,
}: DiagnosticsAlertBannerProps) {
  const styles = {
    error: {
      container: 'bg-destructive/10 border-destructive/30',
      text: 'text-destructive',
      icon: 'alert-circle' as const,
      iconColor: '#ef4444',
    },
    warning: {
      container: 'bg-amber-500/10 border-amber-500/30',
      text: 'text-amber-800 dark:text-amber-300',
      icon: 'warning' as const,
      iconColor: '#f59e0b',
    },
    info: {
      container: 'bg-blue-500/10 border-blue-500/30',
      text: 'text-blue-700 dark:text-blue-300',
      icon: 'information-circle' as const,
      iconColor: '#3b82f6',
    },
  }[type];

  return (
    <View
      className={cn(
        'p-3 rounded-md border flex-row items-start justify-between gap-2.5',
        styles.container
      )}
    >
      <View className="flex-row items-start gap-2 flex-1">
        <Ionicons name={styles.icon} size={18} color={styles.iconColor} style={{ marginTop: 1 }} />
        <View className="flex-1">
          {title ? (
            <ThemedText type="smallBold" className={cn(styles.text, 'mb-0.5')}>
              {title}
            </ThemedText>
          ) : null}
          <ThemedText type="small" className={styles.text}>
            {message}
          </ThemedText>
        </View>
      </View>

      {onDismiss ? (
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss alert"
          className="p-1 active:opacity-70 -mr-1 -mt-1"
        >
          <Ionicons name="close" size={16} color={styles.iconColor} />
        </Pressable>
      ) : null}
    </View>
  );
}
