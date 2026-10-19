import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import type { ModelReadinessStatus } from '@/constants/models';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ModelStatusBadge } from './model-status-badge';

export interface ModelCardMetadataProps {
  status: ModelReadinessStatus;
  missingFilesCount?: number;
  parameterSize?: string;
  storageLocation: 'app_storage' | 'bundled_asset' | 'none';
}

export function ModelCardMetadata({
  status,
  missingFilesCount,
  parameterSize,
  storageLocation,
}: ModelCardMetadataProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-row flex-wrap items-center gap-2">
      <ModelStatusBadge status={status} missingFilesCount={missingFilesCount} />

      {parameterSize ? (
        <View className="h-6 flex-row items-center justify-center px-2 rounded-md bg-secondary border border-border">
          <ThemedText type="code" className="text-xs text-muted-foreground leading-none">
            {parameterSize}
          </ThemedText>
        </View>
      ) : null}

      {storageLocation !== 'none' && (
        <View className="h-6 flex-row items-center justify-center gap-1.5 px-2 rounded-md bg-secondary border border-border">
          <Ionicons
            name={storageLocation === 'app_storage' ? 'folder-outline' : 'archive-outline'}
            size={12}
            color={isDark ? '#60a5fa' : '#2563eb'}
          />
          <ThemedText type="code" className="text-xs text-muted-foreground leading-none">
            {storageLocation === 'app_storage' ? 'Private Storage' : 'Bundled APK Asset'}
          </ThemedText>
        </View>
      )}

      <View className="h-6 flex-row items-center justify-center gap-1.5 px-2 rounded-md bg-secondary border border-border">
        <Ionicons name="cloud-outline" size={12} color={isDark ? '#a1a1aa' : '#71717a'} />
        <ThemedText type="code" className="text-xs text-muted-foreground leading-none">
          Hugging Face
        </ThemedText>
      </View>
    </View>
  );
}
