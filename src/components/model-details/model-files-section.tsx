import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { cn } from '@/utils/cn';
import type { DisplayedModelFile } from '@/utils/modelInspection.utils';

import { ModelFileCard } from './model-file-card';

export interface ModelFilesSectionProps {
  title: string;
  files: ReadonlyArray<DisplayedModelFile>;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  className?: string;
}

export function ModelFilesSection({
  title,
  files,
  loading,
  refreshing,
  onRefresh,
  className,
}: ModelFilesSectionProps) {
  return (
    <View className={cn('gap-2.5', className)}>
      <View className="flex-row justify-between items-center">
        <ThemedText type="smallBold" className="text-foreground">
          {title}
        </ThemedText>

        <Pressable
          onPress={onRefresh}
          disabled={loading || refreshing}
          accessibilityRole="button"
          accessibilityLabel="Refresh model files"
          className={cn(
            'px-2.5 py-1 rounded-md bg-secondary active:opacity-70',
            refreshing && 'opacity-60'
          )}
        >
          <ThemedText type="small" className="text-muted-foreground">
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </ThemedText>
        </Pressable>
      </View>

      {files.map((file) => (
        <ModelFileCard key={file.name} file={file} isLoading={loading} />
      ))}
    </View>
  );
}
