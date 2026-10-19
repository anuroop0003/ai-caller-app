import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import type { CallTurnState } from '@/types/conversation';
import { cn } from '@/utils/cn';

export interface CallControlsProps {
  turnState: CallTurnState;
  isRecording: boolean;
  recordingDurationSec: number;
  isMuted: boolean;
  onStartUserTurn: () => void;
  onFinishUserTurn: () => void;
  onCancelUserTurn: () => void;
  onToggleMute: () => void;
  onEndCall: () => void;
  className?: string;
}

export function CallControls({
  turnState,
  isRecording,
  recordingDurationSec,
  isMuted,
  onStartUserTurn,
  onFinishUserTurn,
  onCancelUserTurn,
  onToggleMute,
  onEndCall,
  className,
}: CallControlsProps) {
  const isBusy =
    turnState === 'transcribing' || turnState === 'thinking' || turnState === 'speaking';
  const canStartTalking = turnState === 'listening' && !isRecording && !isMuted && !isBusy;

  return (
    <View
      className={cn(
        'w-full p-4 rounded-xl border border-border bg-card shadow-md items-center gap-3.5',
        className
      )}
    >
      {/* Primary Action Button (Push-to-Talk / Done Speaking) */}
      <View className="w-full flex-row items-center justify-center gap-3">
        {/* Cancel Recording Button (only visible during recording) */}
        {isRecording ? (
          <Pressable
            onPress={onCancelUserTurn}
            className="w-12 h-12 rounded-full border border-border bg-secondary items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Cancel recording turn"
          >
            <Ionicons name="close" size={22} color="#71717a" />
          </Pressable>
        ) : null}

        {/* Big Push-To-Talk Button */}
        {isRecording ? (
          <Pressable
            onPress={onFinishUserTurn}
            className="flex-1 max-w-[280px] h-14 rounded-full bg-rose-600 active:bg-rose-700 flex-row items-center justify-center gap-2.5 px-6 shadow-md"
            accessibilityRole="button"
            accessibilityLabel="Done speaking, send voice message"
          >
            <View className="w-3 h-3 rounded-full bg-white animate-pulse" />
            <ThemedText className="text-white font-bold text-sm">
              പൂർത്തിയായി ({recordingDurationSec}s)
            </ThemedText>
            <Ionicons name="arrow-up-circle" size={24} color="#ffffff" />
          </Pressable>
        ) : (
          <Pressable
            disabled={!canStartTalking}
            onPress={onStartUserTurn}
            className={cn(
              'flex-1 max-w-[280px] h-14 rounded-full flex-row items-center justify-center gap-2.5 px-6 shadow-md transition-all',
              canStartTalking
                ? 'bg-emerald-600 active:bg-emerald-700'
                : 'bg-zinc-300 dark:bg-zinc-800 opacity-60'
            )}
            accessibilityRole="button"
            accessibilityLabel={
              isMuted
                ? 'Microphone is muted'
                : isBusy
                  ? 'Please wait, assistant is processing'
                  : 'Tap to speak'
            }
            accessibilityState={{ disabled: !canStartTalking }}
          >
            <Ionicons name="mic" size={22} color={canStartTalking ? '#ffffff' : '#a1a1aa'} />
            <ThemedText
              className={cn('font-bold text-sm', canStartTalking ? 'text-white' : 'text-zinc-500')}
            >
              {isMuted
                ? 'മൈക്ക് മ്യൂട്ട് ആണ്'
                : isBusy
                  ? 'കാത്തിരിക്കൂ...'
                  : 'സംസാരിക്കുക (Tap to Speak)'}
            </ThemedText>
          </Pressable>
        )}
      </View>

      {/* Auxiliary Call Controls: Mute + End Call */}
      <View className="w-full flex-row items-center justify-around pt-1 border-t border-border/50">
        {/* Mute Toggle */}
        <Pressable
          onPress={onToggleMute}
          className={cn(
            'flex-row items-center gap-2 px-4 py-2 rounded-full border transition-colors',
            isMuted ? 'border-rose-500/40 bg-rose-500/15' : 'border-border bg-secondary/50'
          )}
          accessibilityRole="button"
          accessibilityLabel={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          <Ionicons
            name={isMuted ? 'mic-off' : 'mic-outline'}
            size={18}
            color={isMuted ? '#ef4444' : '#71717a'}
          />
          <ThemedText
            className={cn(
              'text-xs font-semibold',
              isMuted ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'
            )}
          >
            {isMuted ? 'Muted (അൺമ്യൂട്ട് ചെയ്യുക)' : 'Mute (മ്യൂട്ട്)'}
          </ThemedText>
        </Pressable>

        {/* End Call Button */}
        <Pressable
          onPress={onEndCall}
          className="flex-row items-center gap-2 px-5 py-2 rounded-full bg-red-600 active:bg-red-700 shadow-sm"
          accessibilityRole="button"
          accessibilityLabel="End AI Call"
        >
          <Ionicons name="call" size={18} color="#ffffff" />
          <ThemedText className="text-white text-xs font-bold">
            End Call (അവസാനിപ്പിക്കുക)
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}
