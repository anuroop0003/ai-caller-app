import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { cn } from '@/utils/cn';
import { formatFileSize } from '@/utils/format';
import type { DisplayedModelFile } from '@/utils/modelInspection.utils';

export function getFileBadgeText(file: DisplayedModelFile, isLoading: boolean): string {
  if (file.exists && file.sizeBytes) {
    return formatFileSize(file.sizeBytes);
  }
  if (file.exists) {
    return 'Installed';
  }
  if (isLoading) {
    return 'Checking...';
  }
  return file.isRequired ? 'Missing' : 'Omitted from APK';
}

export interface ModelFileCardProps {
  file: DisplayedModelFile;
  isLoading: boolean;
  className?: string;
}

export function ModelFileCard({
  file,
  isLoading,
  className,
}: ModelFileCardProps) {
  return (
    <View
      className={cn(
        'p-3 rounded-md border border-border bg-secondary/40 gap-1.5',
        className
      )}>
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-2">
          <ThemedText type="smallBold" className="text-foreground">
            {file.name}
          </ThemedText>
        </View>

        <View
          className={cn(
            'px-2 py-0.5 rounded-md border',
            file.exists
              ? 'bg-blue-500/10 border-blue-500/20'
              : 'bg-secondary border-border'
          )}>
          <ThemedText
            type="code"
            className={
              file.exists
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-muted-foreground'
            }>
            {getFileBadgeText(file, isLoading)}
          </ThemedText>
        </View>
      </View>

      <ThemedText type="muted" className="text-muted-foreground">
        {file.description}
      </ThemedText>
    </View>
  );
}
