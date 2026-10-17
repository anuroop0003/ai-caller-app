import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { cn } from '@/utils/cn';

export interface RecorderHeaderSectionProps {
  isRecording: boolean;
  recordedUri: string | null;
  className?: string;
}

export function RecorderHeaderSection({
  isRecording,
  recordedUri,
  className,
}: RecorderHeaderSectionProps) {
  return (
    <View className={cn('flex-row justify-between items-start gap-3', className)}>
      <View className="flex-1 gap-1">
        <ThemedText type="small" className="text-muted-foreground">
          Audio Capture
        </ThemedText>
        <ThemedText type="large" className="text-card-foreground">
          Voice Recorder
        </ThemedText>
        <ThemedText type="muted" className="text-muted-foreground">
          Live Microphone • 16 kHz Ready
        </ThemedText>
      </View>

      {/* Status Badge */}
      <View
        className={cn(
          'px-2 py-0.5 rounded-md border',
          isRecording
            ? 'bg-red-500/10 border-red-500/20'
            : recordedUri
              ? 'bg-emerald-500/10 border-emerald-500/20'
              : 'bg-secondary border-border'
        )}>
        <ThemedText
          type="code"
          className={
            isRecording
              ? 'text-red-600 dark:text-red-400'
              : recordedUri
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-muted-foreground'
          }>
          {isRecording ? 'Recording' : recordedUri ? 'Ready' : 'Idle'}
        </ThemedText>
      </View>
    </View>
  );
}
