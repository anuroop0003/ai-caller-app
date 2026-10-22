import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import type { CallTurnState } from '@/types/conversation';
import { cn } from '@/utils/cn';

export interface CallTurnIndicatorProps {
  turnState: CallTurnState;
  isRecording: boolean;
  recordingDurationSec?: number;
  errorMessage?: string | null;
  className?: string;
}

export function CallTurnIndicator({
  turnState,
  isRecording,
  recordingDurationSec = 0,
  errorMessage,
  className,
}: CallTurnIndicatorProps) {
  if (errorMessage) {
    return (
      <View
        className={cn(
          'w-full flex-row items-center gap-2 px-3 py-2 rounded-md bg-red-500/10 border border-red-500/30',
          className
        )}
      >
        <Ionicons name="alert-circle-outline" size={16} color="#ef4444" />
        <ThemedText className="text-xs text-red-600 dark:text-red-400 flex-1" numberOfLines={2}>
          {errorMessage}
        </ThemedText>
      </View>
    );
  }

  switch (turnState) {
    case 'listening':
      return (
        <View
          className={cn(
            'w-full flex-row items-center justify-between px-3.5 py-2 rounded-full border',
            isRecording
              ? 'bg-rose-500/15 border-rose-500/40'
              : 'bg-emerald-500/10 border-emerald-500/30',
            className
          )}
        >
          <View className="flex-row items-center gap-2">
            <View
              className={cn(
                'w-2.5 h-2.5 rounded-full',
                isRecording ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
              )}
            />
            <ThemedText
              className={cn(
                'text-xs font-medium',
                isRecording
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              )}
            >
              {isRecording
                ? 'നിങ്ങളുടെ ശബ്ദം റെക്കോർഡ് ചെയ്യുന്നു...'
                : 'നിങ്ങൾ സംസാരിക്കൂ (Tap to Speak)...'}
            </ThemedText>
          </View>

          {isRecording ? (
            <ThemedText className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
              {recordingDurationSec}s
            </ThemedText>
          ) : (
            <Ionicons name="mic-outline" size={16} color="#10b981" />
          )}
        </View>
      );

    case 'transcribing':
      return (
        <View
          className={cn(
            'w-full flex-row items-center gap-2 px-3.5 py-2 rounded-full bg-amber-500/10 border border-amber-500/30',
            className
          )}
        >
          <Ionicons name="sync-outline" size={15} color="#f59e0b" className="animate-spin" />
          <ThemedText className="text-xs font-medium text-amber-600 dark:text-amber-400">
            ശബ്ദം തിരിച്ചറിയുന്നു (Transcribing with IndicConformer)...
          </ThemedText>
        </View>
      );

    case 'thinking':
      return (
        <View
          className={cn(
            'w-full flex-row items-center gap-2 px-3.5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30',
            className
          )}
        >
          <Ionicons name="sparkles-outline" size={15} color="#6366f1" />
          <ThemedText className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
            മറുപടി തയ്യാറാക്കുന്നു (Generating response)...
          </ThemedText>
        </View>
      );

    case 'speaking':
      return (
        <View
          className={cn(
            'w-full flex-row items-center gap-2 px-3.5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30',
            className
          )}
        >
          <Ionicons name="volume-medium-outline" size={16} color="#10b981" />
          <ThemedText className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            AI സംസാരിക്കുന്നു (Speaking)...
          </ThemedText>
        </View>
      );

    case 'idle':
    default:
      return null;
  }
}
