import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/utils/cn';

export interface LlmEnvironmentBannerProps {
  isRealNative: boolean;
  useMockRuntime: boolean;
  freeDiskSpaceMb: number;
  onToggleMock?: () => void;
}

export function LlmEnvironmentBanner({
  isRealNative,
  useMockRuntime,
  freeDiskSpaceMb,
  onToggleMock,
}: LlmEnvironmentBannerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const isNativeActive = isRealNative && !useMockRuntime;

  return (
    <View className="p-3.5 rounded-md bg-secondary/50 border border-border gap-2">
      {/* Top Row: Icon + Title + Runtime Badge */}
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-2 flex-1">
          <View className="w-7 h-7 rounded-md items-center justify-center border bg-purple-500/10 border-purple-500/30">
            <Ionicons name="hardware-chip" size={14} color={isDark ? '#a78bfa' : '#7c3aed'} />
          </View>
          <ThemedText type="smallBold" className="text-foreground">
            Local LLM Runtime
          </ThemedText>
        </View>

        <View
          className={cn(
            'h-6 flex-row items-center justify-center px-2 rounded-md border gap-1.5 shrink-0',
            isNativeActive
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-amber-500/10 border-amber-500/30'
          )}
        >
          <View
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              isNativeActive ? 'bg-emerald-500' : 'bg-amber-500'
            )}
          />
          <ThemedText
            type="code"
            className={cn(
              'text-xs leading-none font-medium',
              isNativeActive
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-amber-800 dark:text-amber-400'
            )}
          >
            {isNativeActive ? 'llama.rn (Native C++)' : 'Simulated / Mock'}
          </ThemedText>
        </View>
      </View>

      {/* Description */}
      <ThemedText type="muted" className="text-muted-foreground text-xs leading-4">
        {isRealNative
          ? 'Native ARM64 NEON llama.cpp runtime active. Quantized GGUF weights run offline in private memory.'
          : 'Running in simulated environment (JSI native bridge unlinked in current JS bundle).'}
      </ThemedText>

      {/* Bottom Row: Free Storage & Simulation Switch */}
      <View className="flex-row items-center justify-between pt-0.5">
        <ThemedText type="code" className="text-muted-foreground text-xs">
          Storage:{' '}
          {freeDiskSpaceMb > 0 ? `${(freeDiskSpaceMb / 1024).toFixed(1)} GB free` : 'Checking...'}
        </ThemedText>

        {isRealNative && onToggleMock && (
          <Pressable
            onPress={onToggleMock}
            accessibilityRole="button"
            accessibilityLabel="Toggle simulation mode"
            className="flex-row items-center gap-1.5 active:opacity-75"
          >
            <ThemedText type="muted" className="text-xs">
              Simulation Mode:
            </ThemedText>
            <View
              className={cn(
                'h-5 px-1.5 rounded-md border items-center justify-center',
                useMockRuntime ? 'bg-purple-500/15 border-purple-500/30' : 'bg-card border-border'
              )}
            >
              <ThemedText
                type="code"
                className={cn(
                  'text-[10px] leading-none font-medium',
                  useMockRuntime ? 'text-purple-700 dark:text-purple-300' : 'text-muted-foreground'
                )}
              >
                {useMockRuntime ? 'ON' : 'OFF'}
              </ThemedText>
            </View>
          </Pressable>
        )}
      </View>
    </View>
  );
}
