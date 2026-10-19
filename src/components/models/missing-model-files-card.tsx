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

  const primaryForeground = isDark ? '#18181b' : '#fafafa';

  return (
    <View className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3.5 gap-3 my-1">
      {/* Header */}
      <View className="flex-row items-start gap-2.5">
        <View className="w-9 h-9 rounded-md bg-amber-500/15 border border-amber-500/30 items-center justify-center mt-0.5">
          <Ionicons name="warning" size={18} color={isDark ? '#fbbf24' : '#d97706'} />
        </View>

        <View className="flex-1">
          <ThemedText type="smallBold" className="text-foreground">
            {info.title}
          </ThemedText>
          <ThemedText type="small" className="text-muted-foreground mt-0.5 leading-5 text-xs">
            {customMessage ?? info.defaultDesc}
          </ThemedText>
        </View>
      </View>

      {/* Missing Files List */}
      <View className="bg-card rounded-md p-3 border border-border gap-1.5">
        <ThemedText
          type="smallBold"
          className="text-xs text-muted-foreground uppercase tracking-wider"
        >
          Required Files Status ({modelName})
        </ThemedText>

        <View className="gap-1 mt-0.5">
          {missingFiles.map((filename) => (
            <View key={filename} className="flex-row items-center justify-between py-1">
              <ThemedText
                type="code"
                className="text-foreground text-xs flex-1 mr-2"
                numberOfLines={1}
              >
                {filename}
              </ThemedText>
              <View className="h-6 flex-row items-center justify-center px-2 rounded-md bg-destructive/10 border border-destructive/30">
                <ThemedText type="smallBold" className="text-destructive text-xs leading-none">
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
        className="flex-row items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-primary active:opacity-80"
      >
        <Ionicons name="download-outline" size={16} color={primaryForeground} />
        <ThemedText type="smallBold" className="text-primary-foreground text-xs">
          Open Model Management Flow
        </ThemedText>
      </Pressable>
    </View>
  );
}
