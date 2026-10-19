import { useEffect, useRef } from 'react';
import { ScrollView, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import type { CallTurnState, ConversationTurn } from '@/types/conversation';
import { cn } from '@/utils/cn';

export interface ConversationTranscriptProps {
  history: readonly ConversationTurn[];
  turnState: CallTurnState;
  className?: string;
}

function formatTurnTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function getIntentLabel(intent?: string): string | null {
  if (!intent) return null;
  switch (intent) {
    case 'greeting':
      return 'അഭിവാദ്യം (Greeting)';
    case 'repeat_request':
      return 'വീണ്ടും കേൾക്കൽ (Repeat)';
    case 'appointment_confirm':
      return 'സ്ഥിരീകരണം (Confirmed)';
    case 'appointment_reschedule':
      return 'മാറ്റിവെക്കൽ (Reschedule)';
    case 'call_screening_busy':
      return 'തിരക്കിലാണ് (Busy)';
    case 'call_screening_message':
      return 'സന്ദേശം (Message)';
    case 'otp_received':
      return 'കോഡ് ലഭിച്ചു (Verified)';
    case 'otp_repeat':
      return 'കോഡ് ആവർത്തനം (OTP Repeat)';
    case 'call_closing':
      return 'കോൾ സമാപനം (Ending)';
    case 'clarification':
      return 'വ്യക്തത വരുത്തൽ (Clarify)';
    default:
      return null;
  }
}

export function ConversationTranscript({
  history,
  turnState,
  className,
}: ConversationTranscriptProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll to bottom when history or turnState changes
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [history.length, turnState]);

  return (
    <ScrollView
      ref={scrollViewRef}
      className={cn('flex-1 w-full rounded-lg border border-border bg-card/60 p-3.5', className)}
      contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {history.length === 0 ? (
        <View className="items-center justify-center py-12 gap-2">
          <Ionicons name="chatbubbles-outline" size={32} color="#71717a" />
          <ThemedText className="text-xs text-muted-foreground text-center">
            സംഭാഷണം ഇവിടെ ദൃശ്യമാകും (Conversation transcript will appear here)
          </ThemedText>
        </View>
      ) : null}

      {history.map((turn) => {
        const isAssistant = turn.speaker === 'assistant';
        const intentLabel = getIntentLabel(turn.intent);

        return (
          <View
            key={turn.id}
            className={cn(
              'max-w-[84%] gap-1.5',
              isAssistant ? 'self-start items-start' : 'self-end items-end'
            )}
          >
            {/* Header info row */}
            <View className="flex-row items-center gap-1.5 px-1">
              <ThemedText className="text-[10px] font-semibold text-muted-foreground">
                {isAssistant ? 'AI Assistant' : 'You (നിങ്ങൾ)'}
              </ThemedText>
              <ThemedText className="text-[9px] text-muted-foreground/70">
                {formatTurnTime(turn.timestamp)}
              </ThemedText>
              {turn.latencyMs ? (
                <ThemedText className="text-[9px] text-muted-foreground/60">
                  • {turn.latencyMs}ms
                </ThemedText>
              ) : null}
            </View>

            {/* Speech Bubble */}
            <View
              className={cn(
                'p-3.5 rounded-2xl shadow-sm',
                isAssistant
                  ? 'bg-card border border-border rounded-tl-none'
                  : 'bg-blue-600 dark:bg-blue-600 rounded-tr-none'
              )}
            >
              <ThemedText
                className={cn(
                  'text-sm leading-5 font-medium',
                  isAssistant ? 'text-card-foreground' : 'text-white'
                )}
              >
                {turn.text}
              </ThemedText>
            </View>

            {/* Assistant Intent Tag */}
            {isAssistant && intentLabel ? (
              <View className="flex-row items-center gap-1 px-1.5 py-0.5 rounded-full bg-secondary border border-border">
                <Ionicons name="pricetag-outline" size={9} color="#71717a" />
                <ThemedText className="text-[9px] font-medium text-muted-foreground">
                  {intentLabel}
                </ThemedText>
              </View>
            ) : null}
          </View>
        );
      })}

      {/* Typing/Processing indicator when assistant is thinking or STT is running */}
      {turnState === 'thinking' || turnState === 'transcribing' ? (
        <View className="self-start max-w-[80%] p-3 rounded-2xl rounded-tl-none bg-card border border-border flex-row items-center gap-2">
          <Ionicons
            name={turnState === 'transcribing' ? 'sync-outline' : 'sparkles-outline'}
            size={14}
            color="#6366f1"
          />
          <ThemedText className="text-xs text-muted-foreground italic">
            {turnState === 'transcribing'
              ? 'ശബ്ദം രേഖപ്പെടുത്തുന്നു...'
              : 'മറുപടി ടൈപ്പ് ചെയ്യുന്നു...'}
          </ThemedText>
        </View>
      ) : null}
    </ScrollView>
  );
}
