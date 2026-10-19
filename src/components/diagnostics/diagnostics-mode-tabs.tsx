import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/utils/cn';

export type DiagnosticsMode = 'stt' | 'tts' | 'llm' | 'pipeline';

export interface DiagnosticsModeTabsProps {
  activeMode: DiagnosticsMode;
  onSelectMode: (mode: DiagnosticsMode) => void;
}

export function DiagnosticsModeTabs({ activeMode, onSelectMode }: DiagnosticsModeTabsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-row p-1 rounded-lg bg-secondary/70 border border-border">
      {/* Transcription (STT) Tab */}
      <Pressable
        key="stt-mode-tab"
        onPress={() => onSelectMode('stt')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeMode === 'stt' }}
        accessibilityLabel="Transcription STT diagnostics"
        className={cn(
          'flex-1 py-2 px-1.5 rounded-md flex-row items-center justify-center gap-1 active:opacity-80',
          activeMode === 'stt'
            ? 'bg-card border border-border/80'
            : 'bg-transparent border border-transparent'
        )}
      >
        <Ionicons
          name="mic"
          size={13}
          color={
            activeMode === 'stt' ? (isDark ? '#60a5fa' : '#2563eb') : isDark ? '#a1a1aa' : '#71717a'
          }
        />
        <ThemedText
          type={activeMode === 'stt' ? 'smallBold' : 'small'}
          className={cn(
            activeMode === 'stt' ? 'text-foreground font-semibold' : 'text-muted-foreground'
          )}
        >
          STT
        </ThemedText>
      </Pressable>

      {/* Speech Synthesis (TTS) Tab */}
      <Pressable
        key="tts-mode-tab"
        onPress={() => onSelectMode('tts')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeMode === 'tts' }}
        accessibilityLabel="Speech synthesis TTS diagnostics"
        className={cn(
          'flex-1 py-2 px-1.5 rounded-md flex-row items-center justify-center gap-1 active:opacity-80',
          activeMode === 'tts'
            ? 'bg-card border border-border/80'
            : 'bg-transparent border border-transparent'
        )}
      >
        <Ionicons
          name="volume-high"
          size={13}
          color={
            activeMode === 'tts' ? (isDark ? '#60a5fa' : '#2563eb') : isDark ? '#a1a1aa' : '#71717a'
          }
        />
        <ThemedText
          type={activeMode === 'tts' ? 'smallBold' : 'small'}
          className={cn(
            activeMode === 'tts' ? 'text-foreground font-semibold' : 'text-muted-foreground'
          )}
        >
          TTS
        </ThemedText>
      </Pressable>

      {/* LLM Benchmarks Tab */}
      <Pressable
        key="llm-mode-tab"
        onPress={() => onSelectMode('llm')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeMode === 'llm' }}
        accessibilityLabel="Local LLM benchmarks"
        className={cn(
          'flex-1 py-2 px-1.5 rounded-md flex-row items-center justify-center gap-1 active:opacity-80',
          activeMode === 'llm'
            ? 'bg-card border border-border/80'
            : 'bg-transparent border border-transparent'
        )}
      >
        <Ionicons
          name="hardware-chip"
          size={13}
          color={
            activeMode === 'llm' ? (isDark ? '#a78bfa' : '#7c3aed') : isDark ? '#a1a1aa' : '#71717a'
          }
        />
        <ThemedText
          type={activeMode === 'llm' ? 'smallBold' : 'small'}
          className={cn(
            activeMode === 'llm' ? 'text-foreground font-semibold' : 'text-muted-foreground'
          )}
        >
          LLM
        </ThemedText>
      </Pressable>

      {/* Pipeline Device Validation Tab */}
      <Pressable
        key="pipeline-mode-tab"
        onPress={() => onSelectMode('pipeline')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeMode === 'pipeline' }}
        accessibilityLabel="Device pipeline validation"
        className={cn(
          'flex-1 py-2 px-2.5 rounded-md flex-row items-center justify-center gap-1 active:opacity-80',
          activeMode === 'pipeline'
            ? 'bg-card border border-border/80'
            : 'bg-transparent border border-transparent'
        )}
      >
        <Ionicons
          name="shield-checkmark"
          size={14}
          color={
            activeMode === 'pipeline'
              ? isDark
                ? '#34d399'
                : '#059669'
              : isDark
                ? '#a1a1aa'
                : '#71717a'
          }
        />
        <ThemedText
          type={activeMode === 'pipeline' ? 'smallBold' : 'small'}
          className={cn(
            activeMode === 'pipeline' ? 'text-foreground font-semibold' : 'text-muted-foreground'
          )}
        >
          Device E2E
        </ThemedText>
      </Pressable>
    </View>
  );
}
