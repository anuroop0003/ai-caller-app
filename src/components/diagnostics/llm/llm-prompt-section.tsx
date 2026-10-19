import { Pressable, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { cn } from '@/utils/cn';

export interface LlmPromptPreset {
  id: string;
  label: string;
  prompt: string;
}

export const MALAYALAM_LLM_PRESETS: readonly LlmPromptPreset[] = [
  {
    id: 'appointment',
    label: 'Appointment',
    prompt: 'നമസ്കാരം, എനിക്ക് ഡോക്ടറെ കാണാൻ ഒരു അപ്പോയിന്റ്മെന്റ് വേണം.',
  },
  {
    id: 'timings',
    label: 'Office Timings',
    prompt: 'നിങ്ങളുടെ ഓഫീസ് സമയം എപ്പോഴാണ് എന്ന് പറയാമോ?',
  },
  {
    id: 'greeting',
    label: 'Greeting',
    prompt: 'നമസ്കാരം, സുഖമാണോ? എന്താണ് ഇന്നത്തെ വിശേഷങ്ങൾ?',
  },
  {
    id: 'services',
    label: 'Services',
    prompt: 'നിങ്ങൾ നൽകുന്ന സേവനങ്ങളെക്കുറിച്ച് കുറച്ച് പറയാമോ?',
  },
];

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
      {/* Preset Malayalam Phrase Selectors */}
      <View className="gap-1.5">
        <ThemedText type="small" className="text-xs text-muted-foreground font-medium">
          Malayalam Prompt Presets:
        </ThemedText>
        <View className="flex-row flex-wrap gap-1.5">
          {MALAYALAM_LLM_PRESETS.map((preset) => {
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
                  isSelected
                    ? 'bg-card border-border/80'
                    : 'bg-secondary text-secondary-foreground border border-border',
                  disabled && 'opacity-60'
                )}
              >
                <ThemedText
                  type="small"
                  className={cn(
                    'text-xs',
                    isSelected ? 'text-foreground font-semibold' : 'text-secondary-foreground'
                  )}
                >
                  {preset.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Editable Malayalam Input Text Box */}
      <View className="gap-1">
        <TextInput
          value={inputText}
          onChangeText={onChangeText}
          editable={!disabled}
          placeholder="Enter Malayalam prompt to test..."
          placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
          multiline
          numberOfLines={2}
          className={cn(
            'p-2.5 rounded-md border border-border bg-secondary/30 text-foreground text-sm font-normal min-h-[64px]',
            disabled && 'opacity-60'
          )}
          textAlignVertical="top"
        />
        <ThemedText type="small" className="text-[11px] text-muted-foreground text-right">
          {inputText.length} characters
        </ThemedText>
      </View>
    </View>
  );
}
