import { View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import type { FileVerificationItem, ModelFileEntry } from '@/constants/models';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatFileSize } from '@/utils/format';

export interface ModelManifestListProps {
  files: readonly ModelFileEntry[];
  readinessFiles?: readonly FileVerificationItem[];
}

export function ModelManifestList({ files, readinessFiles }: ModelManifestListProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const verifiedFilesCount = files.filter((spec) => {
    const file = readinessFiles?.find((f) => f.filename === spec.filename);
    return file ? (file.isValid ?? file.exists) : false;
  }).length;

  return (
    <View className="bg-secondary/40 rounded-md p-3 border border-border gap-1.5">
      <View className="flex-row items-center justify-between pb-0.5">
        <ThemedText type="smallBold" className="text-xs text-muted-foreground tracking-wider">
          Package Manifest ({files.length} files)
        </ThemedText>
        <ThemedText type="code" className="text-xs text-muted-foreground">
          {verifiedFilesCount}/{files.length} verified
        </ThemedText>
      </View>

      {files.map((spec) => {
        const verified = readinessFiles?.find((f) => f.filename === spec.filename);
        const isFilePresent = verified ? (verified.isValid ?? verified.exists) : false;

        return (
          <View key={spec.filename} className="flex-row items-center justify-between py-1">
            <View className="flex-row items-center gap-2 flex-1 mr-2">
              <Ionicons
                name={isFilePresent ? 'checkmark-circle' : 'ellipse-outline'}
                size={14}
                color={isFilePresent ? '#10b981' : isDark ? '#52525b' : '#a1a1aa'}
              />
              <ThemedText type="code" className="text-xs text-foreground flex-1" numberOfLines={1}>
                {spec.filename}
              </ThemedText>
            </View>

            <ThemedText type="muted" className="text-xs font-mono">
              {formatFileSize(spec.fileSizeBytes)}
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}
