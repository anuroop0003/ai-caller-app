import { Pressable, View } from 'react-native';
import { router } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import type { ModelCategory } from '@/constants/models';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface MissingModelFilesCardProps {
  category: ModelCategory;
  modelName: string;
  missingFiles: readonly string[];
  customMessage?: string;
}

export function MissingModelFilesCard({
  category,
  modelName,
  missingFiles,
  customMessage,
}: MissingModelFilesCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const categoryLabels: Record<ModelCategory, { title: string; defaultDesc: string }> = {
    stt: {
      title: 'Speech Recognition Files Missing',
      defaultDesc:
        'Malayalam speech recognition cannot start because the required acoustic model files have not been verified in storage.',
    },
    tts: {
      title: 'Speech Synthesis Files Missing',
      defaultDesc:
        'Malayalam voice synthesis cannot start because the Piper voice model or eSpeak phonemizer data is missing.',
    },
    llm: {
      title: 'Language Model Weights Missing',
      defaultDesc:
        'Conversational dialogue generation cannot start because the GGUF model weights have not been downloaded.',
    },
  };

  const info = categoryLabels[category];

  const handleOpenModels = () => {
    router.navigate({
      pathname: '/models',
      params: { category },
    });
  };

  return (
    <View className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 gap-3.5 my-2">
      {/* Header */}
      <View className="flex-row items-start gap-3">
        <View className="w-9 h-9 rounded-xl bg-amber-500/15 items-center justify-center mt-0.5">
          <Ionicons name="warning" size={20} color={isDark ? '#fbbf24' : '#d97706'} />
        </View>

        <View className="flex-1">
          <ThemedText type="default" className="font-semibold text-foreground">
            {info.title}
          </ThemedText>
          <ThemedText type="small" className="text-muted-foreground mt-0.5 leading-5">
            {customMessage ?? info.defaultDesc}
          </ThemedText>
        </View>
      </View>

      {/* Missing Files List */}
      <View className="bg-card/70 rounded-xl p-3 border border-border/80 gap-2">
        <ThemedText type="smallBold" className="text-foreground text-xs uppercase tracking-wider">
          Required Files Status ({modelName})
        </ThemedText>

        <View className="gap-1.5 mt-1">
          {missingFiles.map((filename) => (
            <View
              key={filename}
              className="flex-row items-center justify-between py-1 border-b border-border/40 last:border-b-0"
            >
              <ThemedText type="small" className="text-foreground font-mono text-xs">
                {filename}
              </ThemedText>
              <View className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30">
                <ThemedText type="smallBold" className="text-rose-600 dark:text-rose-400 text-xs">
                  Missing
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Action Button */}
      <Pressable
        onPress={handleOpenModels}
        accessibilityRole="button"
        accessibilityLabel="Open model management flow"
        className="flex-row items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 active:opacity-85 shadow-sm"
      >
        <Ionicons name="download-outline" size={16} color="#ffffff" />
        <ThemedText type="smallBold" className="text-white">
          Open Model Management Flow
        </ThemedText>
      </Pressable>
    </View>
  );
}
