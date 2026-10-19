import { ScrollView, Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { CALLER_SCENARIOS } from '@/services/dialogue/callerScenarios';
import type { CallerScenario, ConversationTurn } from '@/types/conversation';
import { cn } from '@/utils/cn';

export interface CallSummaryProps {
  scenario: CallerScenario;
  formattedDuration: string;
  history: readonly ConversationTurn[];
  onStartNewCall: () => void;
  onDismiss: () => void;
  className?: string;
}

export function CallSummary({
  scenario,
  formattedDuration,
  history,
  onStartNewCall,
  onDismiss,
  className,
}: CallSummaryProps) {
  const scenarioConfig = CALLER_SCENARIOS[scenario] ?? CALLER_SCENARIOS.general_assistant;
  const userTurnsCount = history.filter((t) => t.speaker === 'user').length;
  const assistantTurnsCount = history.filter((t) => t.speaker === 'assistant').length;

  return (
    <View
      className={cn(
        'w-full rounded-xl border border-border bg-card p-4 gap-4 shadow-md',
        className
      )}
    >
      {/* Header Banner */}
      <View className="flex-row items-center justify-between pb-3 border-b border-border">
        <View className="flex-row items-center gap-2.5">
          <View className="w-9 h-9 rounded-full bg-emerald-500/15 items-center justify-center">
            <Ionicons name="checkmark-done" size={20} color="#10b981" />
          </View>
          <View>
            <ThemedText type="default" className="text-base font-semibold text-foreground">
              കോൾ പൂർത്തിയായി (Call Summary)
            </ThemedText>
            <ThemedText className="text-xs text-muted-foreground">
              {scenarioConfig.title}
            </ThemedText>
          </View>
        </View>

        <Pressable
          onPress={onDismiss}
          className="p-1 rounded-full hover:bg-secondary"
          accessibilityRole="button"
          accessibilityLabel="Dismiss summary"
        >
          <Ionicons name="close" size={20} color="#71717a" />
        </Pressable>
      </View>

      {/* Metrics Row */}
      <View className="flex-row items-center justify-between gap-2">
        {/* Duration */}
        <View className="flex-1 p-2.5 rounded-lg border border-border bg-secondary/30 items-center">
          <ThemedText className="text-[10px] text-muted-foreground uppercase font-semibold">
            Duration
          </ThemedText>
          <ThemedText className="text-base font-bold text-foreground">
            {formattedDuration}
          </ThemedText>
        </View>

        {/* Total Turns */}
        <View className="flex-1 p-2.5 rounded-lg border border-border bg-secondary/30 items-center">
          <ThemedText className="text-[10px] text-muted-foreground uppercase font-semibold">
            Total Turns
          </ThemedText>
          <ThemedText className="text-base font-bold text-foreground">{history.length}</ThemedText>
        </View>

        {/* User Turns */}
        <View className="flex-1 p-2.5 rounded-lg border border-border bg-secondary/30 items-center">
          <ThemedText className="text-[10px] text-muted-foreground uppercase font-semibold">
            User / AI
          </ThemedText>
          <ThemedText className="text-base font-bold text-foreground">
            {userTurnsCount} / {assistantTurnsCount}
          </ThemedText>
        </View>
      </View>

      {/* Transcript Review */}
      <View className="gap-2">
        <ThemedText className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Conversation Log (സംഭാഷണ രേഖ)
        </ThemedText>

        <ScrollView
          className="max-h-56 rounded-lg border border-border bg-secondary/20 p-3"
          contentContainerStyle={{ gap: 8 }}
          showsVerticalScrollIndicator={true}
        >
          {history.map((turn, idx) => {
            const isAssistant = turn.speaker === 'assistant';
            return (
              <View key={turn.id || idx} className="gap-0.5">
                <ThemedText
                  className={cn(
                    'text-[10px] font-bold',
                    isAssistant
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-blue-600 dark:text-blue-400'
                  )}
                >
                  {isAssistant ? 'AI Assistant:' : 'You (നിങ്ങൾ):'}
                </ThemedText>
                <ThemedText className="text-xs text-foreground leading-4">{turn.text}</ThemedText>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Actions */}
      <View className="flex-row items-center gap-2 pt-2 border-t border-border">
        <Pressable
          onPress={onDismiss}
          className="flex-1 py-3 rounded-full border border-border bg-secondary items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="Dismiss summary"
        >
          <ThemedText className="text-xs font-semibold text-foreground">
            അടയ്ക്കുക (Close)
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={onStartNewCall}
          className="flex-1 py-3 rounded-full bg-emerald-600 active:bg-emerald-700 flex-row items-center justify-center gap-1.5 shadow-sm"
          accessibilityRole="button"
          accessibilityLabel="Start another call"
        >
          <Ionicons name="call" size={15} color="#ffffff" />
          <ThemedText className="text-xs font-bold text-white">പുതിയ കോൾ (New Call)</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}
