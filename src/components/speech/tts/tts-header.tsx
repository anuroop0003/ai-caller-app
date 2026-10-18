import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { DEFAULT_TTS_MODEL } from '@/constants/ttsModels';

export interface TtsHeaderProps {
  isDark: boolean;
}

export function TtsHeader({ isDark }: TtsHeaderProps) {
  return (
    <View className="flex-row items-center gap-2.5">
      <View className="w-10 h-10 rounded-md items-center justify-center border bg-blue-500/10 border-blue-500/30">
        <Ionicons name="volume-high" size={20} color={isDark ? '#60a5fa' : '#2563eb'} />
      </View>
      <View className="flex-1">
        <ThemedText type="smallBold" className="text-foreground" numberOfLines={1}>
          Speech Synthesis ({DEFAULT_TTS_MODEL.language})
        </ThemedText>
        <ThemedText type="muted" className="text-muted-foreground">
          Piper VITS • {DEFAULT_TTS_MODEL.voiceName} (Female) •{' '}
          {(DEFAULT_TTS_MODEL.sampleRate / 1000).toFixed(2)} kHz
        </ThemedText>
      </View>
    </View>
  );
}
