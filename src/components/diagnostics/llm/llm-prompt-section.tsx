import { Pressable, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { cn } from '@/utils/cn';

export interface LlmPromptPreset {
  id: string;
  label: string;
  prompt: string;
  language?: 'ml' | 'en' | 'custom';
}

export const LLM_TEST_PROMPTS: readonly LlmPromptPreset[] = [
  {
    id: 'ml_appointment',
    label: 'Malayalam (Doctor)',
    prompt: 'നമസ്കാരം, എനിക്ക് ഡോക്ടറെ കാണാൻ ഒരു അപ്പോയിന്റ്മെന്റ് വേണം.',
    language: 'ml',
  },
  {
    id: 'ml_timings',
    label: 'Malayalam (Timings)',
    prompt: 'നിങ്ങളുടെ ഓഫീസ് സമയം എപ്പോഴാണ് എന്ന് പറയാമോ?',
    language: 'ml',
  },
  {
    id: 'en_booking',
    label: 'English (Booking)',
    prompt: 'Hello, I would like to schedule a consultation appointment for tomorrow morning.',
    language: 'en',
  },
  {
    id: 'custom',
    label: 'Custom Prompt',
    prompt: '',
    language: 'custom',
  },
];

export const MALAYALAM_LLM_PRESETS = LLM_TEST_PROMPTS;

export interface LlmPromptSectionProps {
  selectedPresetId: string;
  inputText: string;
  onSelectPreset: (preset: LlmPromptPreset) => void;
  onChangeText: (text: string) => void;
  isDark: boolean;
  disabled?: boolean;
}

export function LlmPromptSection({
  selectedPresetId,
  inputText,
  onSelectPreset,
  onChangeText,
  isDark,
  disabled = false,
}: LlmPromptSectionProps) {
  return (
    <View className="gap-2.5">
      {/* Test Prompts Row */}
      <View className="gap-1.5">
        <ThemedText type="small" className="text-xs text-muted-foreground font-medium">
          Test Prompts:
        </ThemedText>
        <View className="flex-row flex-wrap gap-1.5">
          {LLM_TEST_PROMPTS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <Pressable
                key={preset.id}
                onPress={() => !disabled && onSelectPreset(preset)}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={`Select prompt preset: ${preset.label}`}
                className={cn(
                  'px-2.5 py-1 rounded-md border text-xs active:opacity-75',
                  isSelected ? 'bg-primary border-primary' : 'bg-secondary border border-border',
                  disabled && 'opacity-60'
                )}
              >
                <ThemedText
                  type="small"
                  className={cn(
                    'text-xs',
                    isSelected ? 'text-primary-foreground font-semibold' : 'text-foreground'
                  )}
                >
                  {preset.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Editable Input Text Box */}
      <View className="gap-1">
        <TextInput
          value={inputText}
          onChangeText={onChangeText}
          editable={!disabled}
          placeholder="Enter prompt utterance to test..."
          placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
          className={cn(
            'rounded-md border border-border bg-background p-2.5 text-sm text-foreground min-h-[72px]',
            disabled && 'opacity-60'
          )}
        />
      </View>
    </View>
  );
}
