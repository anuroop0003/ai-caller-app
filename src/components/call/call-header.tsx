import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { CALLER_SCENARIOS } from '@/services/dialogue/callerScenarios';
import type { CallLifecycleState, CallerScenario } from '@/types/conversation';
import { cn } from '@/utils/cn';

export interface CallHeaderProps {
  lifecycleState: CallLifecycleState;
  scenario: CallerScenario;
  formattedDuration: string;
  className?: string;
}

function getScenarioIcon(scenario: CallerScenario): keyof typeof Ionicons.glyphMap {
  switch (scenario) {
    case 'appointment_scheduler':
      return 'calendar-outline';
    case 'call_screener':
      return 'briefcase-outline';
    case 'otp_security':
      return 'shield-checkmark-outline';
    case 'general_assistant':
    default:
      return 'sparkles-outline';
  }
}

export function CallHeader({
  lifecycleState,
  scenario,
  formattedDuration,
  className,
}: CallHeaderProps) {
  const scenarioConfig = CALLER_SCENARIOS[scenario] ?? CALLER_SCENARIOS.general_assistant;
  const isConnected = lifecycleState === 'connected';
  const isEnded = lifecycleState === 'ended';

  return (
    <View
      className={cn(
        'w-full flex-row items-center justify-between p-3.5 rounded-lg border border-border bg-card shadow-sm',
        className
      )}
    >
      {/* Caller Info & Scenario Badge */}
      <View className="flex-row items-center gap-3 flex-1 mr-2">
        <View className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 items-center justify-center">
          <Ionicons name={getScenarioIcon(scenario)} size={22} color="#10b981" />
        </View>

        <View className="flex-1">
          <ThemedText
            type="default"
            className="text-base font-semibold text-foreground"
            numberOfLines={1}
          >
            {scenarioConfig.title}
          </ThemedText>
          <ThemedText className="text-xs text-muted-foreground" numberOfLines={1}>
            {scenarioConfig.subtitle}
          </ThemedText>
        </View>
      </View>

      {/* Lifecycle Status & Elapsed Duration */}
      <View className="items-end gap-1">
        {isConnected ? (
          <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
            <View className="w-2 h-2 rounded-full bg-emerald-500" />
            <ThemedText className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {formattedDuration}
            </ThemedText>
          </View>
        ) : isEnded ? (
          <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-500/15 border border-zinc-500/30">
            <View className="w-2 h-2 rounded-full bg-zinc-400" />
            <ThemedText className="text-xs font-medium text-muted-foreground">Ended</ThemedText>
          </View>
        ) : (
          <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30">
            <View className="w-2 h-2 rounded-full bg-blue-500" />
            <ThemedText className="text-xs font-medium text-blue-600 dark:text-blue-400">
              Ready
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}
