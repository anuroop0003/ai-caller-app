import { Pressable, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MALAYALAM_TTS_PRESETS } from '@/constants/ttsModels';
import { cn } from '@/utils/cn';

export interface TtsInputSectionProps {
  selectedPresetId: string;
  inputText: string;
  activeLanguageName?: string;
  activeLanguageCode?: string;
  onSelectPreset: (presetId: string) => void;
  onChangeText: (text: string) => void;
  isDark: boolean;
}

export function TtsInputSection({
  selectedPresetId,
  inputText,
  activeLanguageName = 'Malayalam',
  activeLanguageCode = 'ml-IN',
  onSelectPreset,
  onChangeText,
  isDark,
}: TtsInputSectionProps) {
  const isMalayalam = activeLanguageCode === 'ml-IN';

  const presets = isMalayalam
    ? MALAYALAM_TTS_PRESETS
    : [{ id: 'sample-text', label: `${activeLanguageName} Sample`, text: '' }];

  return (
    <View className="gap-2.5">
      {/* Preset Phrases Selectors (Matches LlmPromptSection) */}
      <View className="gap-1.5">
        <ThemedText type="small" className="text-xs text-muted-foreground font-medium">
          {activeLanguageName} Test Presets:
        </ThemedText>
        <View className="flex-row flex-wrap gap-1.5">
          {presets.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <Pressable
                key={preset.id}
                onPress={() => onSelectPreset(preset.id)}
                accessibilityRole="button"
                accessibilityLabel={`Select prompt preset: ${preset.label}`}
                className={cn(
                  'px-2.5 py-1 rounded-md border text-xs active:opacity-75',
                  isSelected ? 'bg-primary border-primary' : 'bg-secondary border border-border'
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
          placeholder={`Enter text to speak in ${activeLanguageName}...`}
          placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
          multiline
          numberOfLines={2}
          className="p-2.5 rounded-md border border-border bg-secondary/30 text-foreground text-sm font-normal min-h-[64px]"
          textAlignVertical="top"
        />
        <ThemedText type="small" className="text-[11px] text-muted-foreground text-right">
          {inputText.length} characters
        </ThemedText>
      </View>
    </View>
  );
}
