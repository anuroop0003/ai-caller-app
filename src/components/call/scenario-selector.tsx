import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { CALLER_SCENARIOS } from '@/services/dialogue/callerScenarios';
import type { CallerScenario } from '@/types/conversation';
import { cn } from '@/utils/cn';

export interface ScenarioSelectorProps {
  selectedScenario: CallerScenario;
  onSelectScenario: (scenario: CallerScenario) => void;
  disabled?: boolean;
  className?: string;
}

const SCENARIO_ITEMS: Array<{
  id: CallerScenario;
  title: string;
  tag: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  {
    id: 'general_assistant',
    title: 'AI Voice Assistant',
    tag: 'സഹായകൻ',
    icon: 'sparkles-outline',
  },
  {
    id: 'appointment_scheduler',
    title: 'Clinic Appointment',
    tag: 'അപ്പോയിന്റ്മെന്റ്',
    icon: 'calendar-outline',
  },
  {
    id: 'call_screener',
    title: 'Call Screener',
    tag: 'മീറ്റിംഗ് സ്ക്രീനിംഗ്',
    icon: 'briefcase-outline',
  },
  {
    id: 'otp_security',
    title: 'Security Verification',
    tag: 'ഒ.ടി.പി കോൾ',
    icon: 'shield-checkmark-outline',
  },
];

export function ScenarioSelector({
  selectedScenario,
  onSelectScenario,
  disabled = false,
  className,
}: ScenarioSelectorProps) {
  return (
    <View className={cn('gap-2.5', className)}>
      <ThemedText className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
        Select AI Scenario (സന്ദർഭം തിരഞ്ഞെടുക്കുക)
      </ThemedText>

      <View className="flex-row flex-wrap gap-2">
        {SCENARIO_ITEMS.map((item) => {
          const isSelected = item.id === selectedScenario;
          return (
            <Pressable
              key={item.id}
              disabled={disabled}
              onPress={() => onSelectScenario(item.id)}
              className={cn(
                'flex-1 min-w-[46%] p-3 rounded-lg border flex-row items-center gap-2.5 transition-colors',
                isSelected
                  ? 'border-emerald-500/60 bg-emerald-500/10'
                  : 'border-border bg-card hover:bg-secondary/40',
                disabled && 'opacity-50'
              )}
              accessibilityRole="button"
              accessibilityLabel={`Select ${item.title}`}
              accessibilityState={{ selected: isSelected, disabled }}
            >
              <View
                className={cn(
                  'w-8 h-8 rounded-full items-center justify-center',
                  isSelected ? 'bg-emerald-500/20' : 'bg-secondary'
                )}
              >
                <Ionicons name={item.icon} size={16} color={isSelected ? '#10b981' : '#71717a'} />
              </View>

              <View className="flex-1">
                <ThemedText
                  type="default"
                  className={cn(
                    'text-xs font-semibold',
                    isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                  )}
                  numberOfLines={1}
                >
                  {item.title}
                </ThemedText>
                <ThemedText className="text-[10px] text-muted-foreground" numberOfLines={1}>
                  {item.tag}
                </ThemedText>
              </View>

              {isSelected ? <Ionicons name="checkmark-circle" size={16} color="#10b981" /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
