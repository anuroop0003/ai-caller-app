import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { CALLER_SCENARIOS } from '@/services/dialogue/callerScenarios';
import type { CallerScenario } from '@/types/conversation';
import { cn } from '@/utils/cn';

export interface CallReadyStageProps {
  scenario: CallerScenario;
  onStartCall: () => void;
  className?: string;
}

export function CallReadyStage({ scenario, onStartCall, className }: CallReadyStageProps) {
  const scenarioConfig = CALLER_SCENARIOS[scenario] ?? CALLER_SCENARIOS.general_assistant;

  return (
    <View
      className={cn(
        'w-full p-5 rounded-xl border border-border bg-card shadow-sm gap-4 items-center',
        className
      )}
    >
      {/* Visual AI Avatar */}
      <View className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 items-center justify-center">
        <Ionicons name="chatbubbles" size={38} color="#10b981" />
      </View>

      <View className="items-center text-center gap-1">
        <ThemedText type="subtitle" className="text-lg font-bold text-foreground text-center">
          {scenarioConfig.title}
        </ThemedText>
        <ThemedText className="text-xs text-muted-foreground text-center">
          {scenarioConfig.description}
        </ThemedText>
      </View>

      {/* Greeting Preview Box */}
      <View className="w-full p-3.5 rounded-lg border border-border/80 bg-secondary/40 gap-1.5">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="volume-high-outline" size={14} color="#10b981" />
          <ThemedText className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Initial Spoken Greeting (തുടക്കത്തിലെ അഭിവാദ്യം)
          </ThemedText>
        </View>
        <ThemedText className="text-xs leading-5 text-foreground italic">
          "{scenarioConfig.initialGreeting}"
        </ThemedText>
      </View>

      {/* Start Call CTA Button */}
      <Pressable
        onPress={onStartCall}
        className="w-full h-13 rounded-full bg-emerald-600 active:bg-emerald-700 flex-row items-center justify-center gap-2.5 shadow-md py-3.5"
        accessibilityRole="button"
        accessibilityLabel="Start AI Simulated Call"
      >
        <Ionicons name="call" size={20} color="#ffffff" />
        <ThemedText className="text-white font-bold text-sm">
          Start AI Call (കോൾ ആരംഭിക്കുക)
        </ThemedText>
      </Pressable>

      {/* Offline Assurance */}
      <View className="flex-row items-center gap-1.5 pt-1">
        <Ionicons name="shield-checkmark-outline" size={13} color="#71717a" />
        <ThemedText className="text-[11px] text-muted-foreground">
          100% Offline On-Device Neural Audio Pipeline
        </ThemedText>
      </View>
    </View>
  );
}
