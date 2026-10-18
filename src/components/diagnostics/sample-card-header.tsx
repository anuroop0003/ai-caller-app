import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import type { AudioTestSample } from '@/constants/audioTestSamples';
import { cn } from '@/utils/cn';

import { getLanguageColor } from './sample-card-styles';

export interface SampleCardHeaderProps {
  sample: AudioTestSample;
}

export function SampleCardHeader({ sample }: SampleCardHeaderProps) {
  const langStyle = getLanguageColor(sample.languageCode);

  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-2.5 flex-1 pr-2">
        <View
          className={cn(
            'w-10 h-10 rounded-md items-center justify-center border',
            langStyle.bg,
            langStyle.border
          )}
        >
          <Ionicons
            name={sample.speakerGender === 'female' ? 'woman' : 'man'}
            size={20}
            color={langStyle.iconColor}
          />
        </View>
        <View className="flex-1">
          <ThemedText type="smallBold" className="text-foreground" numberOfLines={1}>
            {sample.title} ({sample.language})
          </ThemedText>
          <ThemedText type="muted" className="text-muted-foreground">
            {sample.speakerLabel} • {sample.durationLabel}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}
