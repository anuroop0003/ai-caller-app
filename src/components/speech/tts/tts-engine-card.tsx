import { ActivityIndicator, Pressable, View } from 'react-native';
import { router } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ModelStatusBadge } from '@/components/models/model-status-card/model-status-badge';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { nativeTtsService } from '@/services/speech';
import { cn } from '@/utils/cn';

export interface TtsEngineCardProps {
  totalVoices: number;
  activeLanguageName: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  className?: string;
}

export function TtsEngineCard({
  totalVoices,
  activeLanguageName,
  isRefreshing,
  onRefresh,
  className,
}: TtsEngineCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primaryForeground = isDark ? '#18181b' : '#fafafa';

  const handleOpenSettings = async () => {
    await nativeTtsService.openTtsSettings();
  };

  const handleTestDiagnostics = () => {
    router.navigate({ pathname: '/diagnostics', params: { tab: 'tts' } });
  };

  return (
    <View className={cn('rounded-md p-4 border border-border bg-card gap-3 shadow-sm', className)}>
      {/* Header: matching ModelCardHeader */}
      <View className="flex-row items-center gap-3">
        <View
          className={cn(
            'w-10 h-10 rounded-md items-center justify-center border',
            'bg-blue-500/10 border-blue-500/30'
          )}
        >
          <Ionicons name="volume-high" size={20} color={isDark ? '#60a5fa' : '#2563eb'} />
        </View>
        <View className="flex-1 justify-center">
          <ThemedText
            type="smallBold"
            themeColor="foreground"
            className="text-sm font-semibold"
            numberOfLines={1}
          >
            Android System Text-to-Speech
          </ThemedText>
          <ThemedText type="muted" className="text-xs mt-0.5">
            Built-in OS Engine • {totalVoices} {totalVoices === 1 ? 'voice' : 'voices'}
          </ThemedText>
        </View>
      </View>

      <ThemedText type="small" className="text-muted-foreground leading-5">
        Hardware-accelerated native Android speech synthesis supporting multilingual Indian and
        global voices with zero download size overhead.
      </ThemedText>

      {/* Metadata Badges: matching ModelCardMetadata */}
      <View className="flex-row flex-wrap items-center gap-2">
        <ModelStatusBadge status="ready" />

        <View className="h-6 flex-row items-center justify-center px-2 rounded-md bg-secondary border border-border">
          <ThemedText type="code" className="text-xs text-muted-foreground leading-none">
            Native System Engine
          </ThemedText>
        </View>

        <View className="h-6 flex-row items-center justify-center gap-1.5 px-2 rounded-md bg-secondary border border-border">
          <Ionicons name="language-outline" size={12} color={isDark ? '#60a5fa' : '#2563eb'} />
          <ThemedText type="code" className="text-xs text-muted-foreground leading-none">
            Caller: {activeLanguageName}
          </ThemedText>
        </View>

        <View className="h-6 flex-row items-center justify-center gap-1.5 px-2 rounded-md bg-secondary border border-border">
          <Ionicons
            name="phone-portrait-outline"
            size={12}
            color={isDark ? '#a1a1aa' : '#71717a'}
          />
          <ThemedText type="code" className="text-xs text-muted-foreground leading-none">
            Google / Samsung TTS
          </ThemedText>
        </View>
      </View>

      {/* Action Buttons: matching ModelCardActions */}
      <View className="flex-row items-center gap-2 pt-0.5">
        <Pressable
          onPress={handleOpenSettings}
          accessibilityRole="button"
          accessibilityLabel="Download voice data in Android settings"
          className="flex-1 h-9 px-3 rounded-md bg-primary flex-row items-center justify-center gap-1.5 active:opacity-80"
        >
          <Ionicons name="download-outline" size={16} color={primaryForeground} />
          <ThemedText type="smallBold" className="text-primary-foreground text-xs">
            Download Voices
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={onRefresh}
          disabled={isRefreshing}
          accessibilityRole="button"
          accessibilityLabel="Refresh installed voices"
          className={cn(
            'h-9 px-3 rounded-md bg-secondary border border-border flex-row items-center justify-center gap-1.5 active:opacity-75',
            isRefreshing && 'opacity-60'
          )}
        >
          {isRefreshing ? (
            <ActivityIndicator
              size="small"
              color={isDark ? '#e4e4e7' : '#18181b'}
              style={{ transform: [{ scale: 0.7 }] }}
            />
          ) : (
            <Ionicons name="refresh" size={14} color={isDark ? '#e4e4e7' : '#18181b'} />
          )}
          <ThemedText type="smallBold" className="text-foreground text-xs">
            {isRefreshing ? 'Checking...' : 'Refresh'}
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={handleTestDiagnostics}
          accessibilityRole="button"
          accessibilityLabel="Run TTS Diagnostics Test"
          className="h-9 px-3 rounded-md border active:opacity-75 bg-blue-500/15 border-blue-500/40 dark:bg-blue-500/20 dark:border-blue-500/50 flex-row items-center justify-center gap-1.5"
        >
          <Ionicons name="play" size={14} color={isDark ? '#60a5fa' : '#2563eb'} />
          <ThemedText type="smallBold" className="text-blue-600 dark:text-blue-400 text-xs">
            Test
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}
