import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { TtsLanguageDef, TtsVoiceOption } from '@/types/ttsSettings';
import { cn } from '@/utils/cn';

export interface TtsLanguageCardProps {
  language: TtsLanguageDef;
  isPreferred: boolean;
  isPlaying: boolean;
  voices: readonly TtsVoiceOption[];
  selectedVoiceId: string | null;
  rate?: number;
  pitch?: number;
  onSelectPreferred: () => void;
  onSelectVoice: (voiceId: string) => void;
  onUpdateRate: (rate: number) => void;
  onUpdatePitch: (pitch: number) => void;
  onSaveConfig?: (config: { voiceId: string | null; rate: number; pitch: number }) => void;
  onPlayPreview: (params?: { voiceId?: string | null; rate?: number; pitch?: number }) => void;
  onStopPreview: () => void;
  onOpenSettings: () => void;
  className?: string;
}

const SPEED_POINTS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0] as const;
const PITCH_POINTS = [0.6, 0.8, 1.0, 1.2, 1.4] as const;

export function TtsLanguageCard({
  language,
  isPreferred,
  isPlaying,
  voices,
  selectedVoiceId,
  rate = 1.0,
  pitch = 1.0,
  onSelectPreferred,
  onSelectVoice,
  onUpdateRate,
  onUpdatePitch,
  onSaveConfig,
  onPlayPreview,
  onStopPreview,
  onOpenSettings,
  className,
}: TtsLanguageCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#a1a1aa' : '#71717a';
  const primaryForeground = isDark ? '#18181b' : '#fafafa';

  const hasVoices = voices.length > 0;

  // Local working draft state for responsive configuration
  const [draftVoiceId, setDraftVoiceId] = useState<string | null>(
    selectedVoiceId ?? voices[0]?.identifier ?? null
  );
  const [draftRate, setDraftRate] = useState<number>(rate);
  const [draftPitch, setDraftPitch] = useState<number>(pitch);
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);

  // Sync working state when saved props change externally
  useEffect(() => {
    setDraftVoiceId(selectedVoiceId ?? voices[0]?.identifier ?? null);
    setDraftRate(rate);
    setDraftPitch(pitch);
  }, [selectedVoiceId, rate, pitch, language.id]);

  const currentSavedVoice = selectedVoiceId ?? voices[0]?.identifier ?? null;
  const hasChanges =
    draftVoiceId !== currentSavedVoice ||
    Math.abs(draftRate - rate) >= 0.01 ||
    Math.abs(draftPitch - pitch) >= 0.01;

  const handleSave = () => {
    if (onSaveConfig) {
      onSaveConfig({
        voiceId: draftVoiceId,
        rate: draftRate,
        pitch: draftPitch,
      });
    } else {
      if (draftVoiceId) onSelectVoice(draftVoiceId);
      onUpdateRate(draftRate);
      onUpdatePitch(draftPitch);
    }
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2000);
  };

  // Find currently active voice index / label
  const selectedVoiceIndex = voices.findIndex((v) => v.identifier === draftVoiceId);
  const activeVoiceIndex = selectedVoiceIndex >= 0 ? selectedVoiceIndex : 0;
  const activeVoice = voices[activeVoiceIndex];
  const activeVoiceLabel = activeVoice ? `Voice ${activeVoiceIndex + 1}` : 'System Default Voice';

  return (
    <View
      className={cn('rounded-md p-4 border border-border bg-card gap-3.5 shadow-sm', className)}
    >
      {/* 1. Header: matching ModelCardHeader */}
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-md items-center justify-center border bg-blue-500/10 border-blue-500/30">
          <ThemedText type="subtitle" className="text-xl">
            {language.flagEmoji}
          </ThemedText>
        </View>

        <View className="flex-1 justify-center">
          <ThemedText
            type="smallBold"
            themeColor="foreground"
            className="text-sm font-semibold"
            numberOfLines={1}
          >
            {language.name} ({language.nativeName})
          </ThemedText>
          <ThemedText type="muted" className="text-xs mt-0.5" numberOfLines={1}>
            {hasVoices
              ? `${activeVoiceLabel} • ${draftRate.toFixed(2)}× Rate`
              : 'Voice data not installed on device'}
          </ThemedText>
        </View>
      </View>

      {/* 2. Sample utterance phrase */}
      <View className="p-3 rounded-md bg-secondary/40 border border-dashed border-border gap-1">
        <ThemedText type="smallBold" className="text-muted-foreground text-xs">
          Sample Utterance:
        </ThemedText>
        <ThemedText type="p" className="text-foreground text-xs leading-5 italic" numberOfLines={2}>
          &ldquo;{language.sampleText}&rdquo;
        </ThemedText>
      </View>

      {/* 3. Badges row */}
      <View className="flex-row flex-wrap items-center gap-2">
        {isPreferred && (
          <View className="h-6 flex-row items-center justify-center px-2 rounded-md bg-emerald-500/10 border border-emerald-500/30 dark:bg-emerald-500/15 dark:border-emerald-500/40 shrink-0">
            <ThemedText
              type="code"
              className="text-xs font-medium leading-none text-emerald-600 dark:text-emerald-400"
            >
              Default Starting Voice
            </ThemedText>
          </View>
        )}

        {hasVoices ? (
          <View className="h-6 flex-row items-center justify-center px-2 rounded-md bg-secondary border border-border shrink-0">
            <ThemedText type="code" className="text-xs text-muted-foreground leading-none">
              {voices.length} {voices.length === 1 ? 'Voice' : 'Voices'}
            </ThemedText>
          </View>
        ) : (
          <View className="h-6 flex-row items-center justify-center px-2 rounded-md bg-amber-500/10 border border-amber-500/30 dark:bg-amber-500/15 dark:border-amber-500/40 shrink-0">
            <ThemedText
              type="code"
              className="text-xs font-medium leading-none text-amber-600 dark:text-amber-400"
            >
              Needs Download
            </ThemedText>
          </View>
        )}

        <View className="h-6 flex-row items-center justify-center px-2 rounded-md bg-secondary border border-border shrink-0">
          <ThemedText type="code" className="text-xs text-muted-foreground leading-none">
            {language.code}
          </ThemedText>
        </View>

        <View className="h-6 flex-row items-center justify-center px-2 rounded-md bg-secondary border border-border shrink-0">
          <ThemedText type="code" className="text-xs text-muted-foreground leading-none">
            {language.script}
          </ThemedText>
        </View>
      </View>

      {/* 4. Per-Language Configuration Section */}
      {hasVoices && (
        <View className="p-3.5 rounded-md border border-border bg-card gap-3.5">
          {/* Voice Selector */}
          <View className="gap-1.5">
            <ThemedText type="smallBold" className="text-xs text-muted-foreground">
              Select Voice
            </ThemedText>

            <View className="h-10 rounded-md bg-secondary border border-border justify-center overflow-hidden">
              <Picker
                selectedValue={draftVoiceId ?? voices[0]?.identifier}
                onValueChange={(itemValue) => setDraftVoiceId(String(itemValue))}
                mode="dialog"
                prompt={`Select Voice for ${language.name}`}
                dropdownIconColor={isDark ? '#e4e4e7' : '#18181b'}
                style={{
                  color: isDark ? '#fafafa' : '#09090b',
                  backgroundColor: 'transparent',
                  fontSize: 12,
                }}
              >
                {voices.map((v, idx) => (
                  <Picker.Item
                    key={v.identifier}
                    label={`Voice ${idx + 1}${v.quality ? ` (${v.quality})` : ''} - ${v.name || v.identifier}`}
                    value={v.identifier}
                    color={isDark ? '#fafafa' : '#09090b'}
                    style={{
                      fontSize: 12,
                      color: isDark ? '#fafafa' : '#09090b',
                    }}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Speed (Speech Rate) Slider */}
          <View className="gap-1">
            <View className="flex-row items-center justify-between">
              <ThemedText type="smallBold" className="text-xs text-muted-foreground">
                Speech Rate
              </ThemedText>
              <ThemedText type="code" className="text-xs text-foreground font-semibold">
                {draftRate.toFixed(2)}×
              </ThemedText>
            </View>

            <Slider
              value={draftRate}
              minimumValue={0.5}
              maximumValue={2.0}
              step={0.25}
              onValueChange={(val) => setDraftRate(Number(val.toFixed(2)))}
              minimumTrackTintColor={isDark ? '#e4e4e7' : '#18181b'}
              maximumTrackTintColor={isDark ? '#3f3f46' : '#e4e4e7'}
              thumbTintColor={isDark ? '#e4e4e7' : '#18181b'}
              style={{ width: '100%', height: 36 }}
            />

            <View className="flex-row items-center justify-between px-1 -mt-1">
              {SPEED_POINTS.map((pt) => (
                <Pressable key={pt} onPress={() => setDraftRate(pt)}>
                  <ThemedText
                    type="code"
                    className={cn(
                      'text-[10px]',
                      Math.abs(draftRate - pt) < 0.05
                        ? 'text-foreground font-semibold'
                        : 'text-muted-foreground'
                    )}
                  >
                    {pt}×
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Pitch Slider */}
          <View className="gap-1">
            <View className="flex-row items-center justify-between">
              <ThemedText type="smallBold" className="text-xs text-muted-foreground">
                Pitch (Tone)
              </ThemedText>
              <ThemedText type="code" className="text-xs text-foreground font-semibold">
                {draftPitch === 1.0
                  ? '1.00× (Normal)'
                  : draftPitch < 1.0
                    ? `${draftPitch.toFixed(2)}× (Deep)`
                    : `${draftPitch.toFixed(2)}× (High)`}
              </ThemedText>
            </View>

            <Slider
              value={draftPitch}
              minimumValue={0.6}
              maximumValue={1.4}
              step={0.2}
              onValueChange={(val) => setDraftPitch(Number(val.toFixed(2)))}
              minimumTrackTintColor={isDark ? '#e4e4e7' : '#18181b'}
              maximumTrackTintColor={isDark ? '#3f3f46' : '#e4e4e7'}
              thumbTintColor={isDark ? '#e4e4e7' : '#18181b'}
              style={{ width: '100%', height: 36 }}
            />

            <View className="flex-row items-center justify-between px-1 -mt-1">
              {PITCH_POINTS.map((pt) => (
                <Pressable key={pt} onPress={() => setDraftPitch(pt)}>
                  <ThemedText
                    type="code"
                    className={cn(
                      'text-[10px]',
                      Math.abs(draftPitch - pt) < 0.05
                        ? 'text-foreground font-semibold'
                        : 'text-muted-foreground'
                    )}
                  >
                    {pt}×
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Save Config Button */}
          <Pressable
            disabled={!hasChanges && !isSavedRecently}
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel={`Save voice configuration for ${language.name}`}
            className={cn(
              'h-9 px-3.5 rounded-md flex-row items-center justify-center gap-1.5 active:opacity-85',
              hasChanges
                ? 'bg-primary'
                : isSavedRecently
                  ? 'bg-emerald-600'
                  : 'bg-secondary border border-border opacity-50'
            )}
          >
            <Ionicons
              name={isSavedRecently ? 'checkmark-circle' : 'save-outline'}
              size={14}
              color={hasChanges || isSavedRecently ? primaryForeground : iconColor}
            />
            <ThemedText
              type="smallBold"
              className={cn(
                'text-xs font-semibold',
                hasChanges || isSavedRecently ? 'text-primary-foreground' : 'text-muted-foreground'
              )}
            >
              {isSavedRecently
                ? 'Configuration Saved'
                : hasChanges
                  ? 'Save Config'
                  : 'Config Saved'}
            </ThemedText>
          </Pressable>
        </View>
      )}

      {/* 5. Actions Row: Default Selection & Preview */}
      <View className="flex-row items-center gap-2 pt-0.5">
        {hasVoices ? (
          <>
            {/* Default Starting Voice Selection Button */}
            <Pressable
              onPress={() => {
                if (hasChanges) {
                  handleSave();
                }
                onSelectPreferred();
              }}
              accessibilityRole="button"
              accessibilityLabel={
                isPreferred
                  ? `${language.name} is the default starting voice`
                  : `Set ${language.name} as default starting voice`
              }
              className={cn(
                'flex-1 h-9 px-3 rounded-md flex-row items-center justify-center gap-1.5 active:opacity-85',
                isPreferred
                  ? 'bg-emerald-600 active:bg-emerald-700'
                  : 'bg-secondary border border-border'
              )}
            >
              <Ionicons
                name={isPreferred ? 'checkmark-circle' : 'radio-button-off'}
                size={15}
                color={isPreferred ? '#ffffff' : iconColor}
              />
              <ThemedText
                type="smallBold"
                className={cn(
                  'text-xs font-semibold',
                  isPreferred ? 'text-white' : 'text-foreground'
                )}
              >
                {isPreferred ? 'Default Starting Voice' : 'Set as Default'}
              </ThemedText>
            </Pressable>

            {/* Preview Button */}
            <Pressable
              onPress={
                isPlaying
                  ? onStopPreview
                  : () =>
                      onPlayPreview({ voiceId: draftVoiceId, rate: draftRate, pitch: draftPitch })
              }
              accessibilityRole="button"
              accessibilityLabel={isPlaying ? 'Stop speech preview' : 'Play speech preview'}
              className={cn(
                'h-9 px-3.5 min-w-[100px] rounded-md border flex-row items-center justify-center gap-1.5 active:opacity-75',
                isPlaying
                  ? 'bg-rose-500 border-rose-600'
                  : 'bg-blue-500/15 border-blue-500/40 dark:bg-blue-500/20 dark:border-blue-500/50'
              )}
            >
              <Ionicons
                name={isPlaying ? 'stop' : 'play'}
                size={14}
                color={isPlaying ? '#ffffff' : isDark ? '#60a5fa' : '#2563eb'}
              />
              <ThemedText
                type="smallBold"
                className={cn(
                  'text-xs',
                  isPlaying ? 'text-white' : 'text-blue-600 dark:text-blue-400'
                )}
              >
                {isPlaying ? 'Stop' : 'Preview'}
              </ThemedText>
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={onOpenSettings}
            accessibilityRole="button"
            accessibilityLabel={`Download ${language.name} voice pack in Android settings`}
            className="flex-1 h-9 px-3 rounded-md bg-primary flex-row items-center justify-center gap-1.5 active:opacity-80"
          >
            <Ionicons name="download-outline" size={15} color="#ffffff" />
            <ThemedText type="smallBold" className="text-primary-foreground text-xs">
              Download in Android Settings
            </ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );
}
