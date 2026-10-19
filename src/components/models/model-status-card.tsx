import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import type { ModelReadinessStatus, UnifiedModelPackage } from '@/constants/models';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useModelDownload } from '@/hooks/use-model-download';
import { useModelReadiness } from '@/hooks/use-model-readiness';
import { ModelFileService } from '@/services/models';
import { cn } from '@/utils/cn';
import { ModelDownloadProgress } from './model-download-progress';

export interface ModelStatusCardProps {
  model: UnifiedModelPackage;
  onTestModel?: () => void;
}

export function ModelStatusCard({ model, onTestModel }: ModelStatusCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { downloadState, startDownload, cancelDownload } = useModelDownload();
  const { readiness, isReady, status, storageLocation, missingFiles, refreshReadiness } =
    useModelReadiness(model);

  const [isDeleting, setIsDeleting] = useState(false);

  const isCurrentModelDownloading =
    downloadState.modelId === model.id &&
    (downloadState.status === 'downloading' ||
      downloadState.status === 'checking' ||
      downloadState.status === 'verifying');

  const activeStatus: ModelReadinessStatus = isCurrentModelDownloading
    ? downloadState.status === 'verifying'
      ? 'verifying'
      : 'downloading'
    : status;

  const totalMb = (model.totalSizeBytes / (1024 * 1024)).toFixed(1);

  const handleDownload = async () => {
    await startDownload(model);
    await refreshReadiness();
  };

  const handleDelete = () => {
    Alert.alert(
      'Remove Model Files',
      `Are you sure you want to delete ${model.name} (${totalMb} MB) from private app storage? You will need to re-download it to use offline inference.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await ModelFileService.deleteModel(model);
              await refreshReadiness();
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const renderStatusBadge = () => {
    switch (activeStatus) {
      case 'ready':
        return (
          <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
            <View className="w-2 h-2 rounded-full bg-emerald-500" />
            <ThemedText type="smallBold" className="text-emerald-600 dark:text-emerald-400 text-xs">
              Ready
            </ThemedText>
          </View>
        );
      case 'downloading':
        return (
          <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30">
            <ActivityIndicator size="small" color="#2563eb" />
            <ThemedText type="smallBold" className="text-blue-600 dark:text-blue-400 text-xs">
              Downloading
            </ThemedText>
          </View>
        );
      case 'verifying':
        return (
          <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30">
            <ActivityIndicator size="small" color="#9333ea" />
            <ThemedText type="smallBold" className="text-purple-600 dark:text-purple-400 text-xs">
              Verifying
            </ThemedText>
          </View>
        );
      case 'incomplete':
        return (
          <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30">
            <View className="w-2 h-2 rounded-full bg-amber-500" />
            <ThemedText type="smallBold" className="text-amber-600 dark:text-amber-400 text-xs">
              Incomplete ({missingFiles.length} missing)
            </ThemedText>
          </View>
        );
      case 'failed':
        return (
          <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30">
            <View className="w-2 h-2 rounded-full bg-rose-500" />
            <ThemedText type="smallBold" className="text-rose-600 dark:text-rose-400 text-xs">
              Failed
            </ThemedText>
          </View>
        );
      case 'not_downloaded':
      default:
        return (
          <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary border border-border">
            <View className="w-2 h-2 rounded-full bg-muted-foreground" />
            <ThemedText type="small" className="text-muted-foreground text-xs">
              Not Downloaded
            </ThemedText>
          </View>
        );
    }
  };

  return (
    <View className="p-4 rounded-2xl bg-card border border-border gap-4 shadow-sm">
      {/* Title & Badge */}
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <ThemedText type="default" className="font-semibold text-foreground">
              {model.name}
            </ThemedText>
            {model.parameterSize && (
              <View className="px-1.5 py-0.5 rounded bg-secondary border border-border">
                <ThemedText type="small" className="text-xs text-muted-foreground">
                  {model.parameterSize}
                </ThemedText>
              </View>
            )}
          </View>

          <ThemedText type="small" className="text-muted-foreground leading-5">
            {model.description}
          </ThemedText>
        </View>

        {renderStatusBadge()}
      </View>

      {/* Storage Source & Metadata Row */}
      <View className="flex-row flex-wrap items-center gap-2 pt-1 border-t border-border/50">
        <View className="flex-row items-center gap-1 px-2 py-0.5 rounded bg-secondary/80">
          <Ionicons name="cube-outline" size={12} color={isDark ? '#a1a1aa' : '#71717a'} />
          <ThemedText type="small" className="text-xs text-muted-foreground">
            Size: {totalMb} MB
          </ThemedText>
        </View>

        {storageLocation !== 'none' && (
          <View className="flex-row items-center gap-1 px-2 py-0.5 rounded bg-secondary/80">
            <Ionicons
              name={storageLocation === 'app_storage' ? 'folder-outline' : 'archive-outline'}
              size={12}
              color={isDark ? '#60a5fa' : '#2563eb'}
            />
            <ThemedText type="small" className="text-xs text-muted-foreground">
              {storageLocation === 'app_storage' ? 'Private Storage' : 'Bundled APK Asset'}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Progress View if active */}
      {isCurrentModelDownloading && (
        <ModelDownloadProgress progressState={downloadState} onCancel={cancelDownload} />
      )}

      {/* Files Checklist */}
      <View className="bg-secondary/40 rounded-xl p-3 border border-border/50 gap-1.5">
        <ThemedText
          type="smallBold"
          className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5"
        >
          Package Manifest ({model.files.length} files)
        </ThemedText>

        {model.files.map((spec) => {
          const verified = readiness?.files.find((f) => f.filename === spec.filename);
          const isFilePresent = verified?.exists ?? false;

          return (
            <View
              key={spec.filename}
              className="flex-row items-center justify-between py-1 border-b border-border/30 last:border-b-0"
            >
              <View className="flex-row items-center gap-2 flex-1 mr-2">
                <Ionicons
                  name={isFilePresent ? 'checkmark-circle' : 'ellipse-outline'}
                  size={14}
                  color={isFilePresent ? '#10b981' : isDark ? '#52525b' : '#a1a1aa'}
                />
                <ThemedText type="small" className="text-xs font-mono text-foreground truncate">
                  {spec.filename}
                </ThemedText>
              </View>

              <ThemedText type="small" className="text-xs text-muted-foreground">
                {(spec.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB
              </ThemedText>
            </View>
          );
        })}
      </View>

      {/* Controls / Actions */}
      <View className="flex-row items-center gap-2.5 pt-1">
        {isReady ? (
          <>
            {onTestModel && (
              <Pressable
                onPress={onTestModel}
                accessibilityRole="button"
                accessibilityLabel="Test model inference"
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 flex-row items-center justify-center gap-1.5 active:opacity-85"
              >
                <Ionicons name="play" size={14} color="#ffffff" />
                <ThemedText type="smallBold" className="text-white text-xs">
                  Run Diagnostics Test
                </ThemedText>
              </Pressable>
            )}

            {storageLocation === 'app_storage' && (
              <Pressable
                onPress={handleDelete}
                disabled={isDeleting}
                accessibilityRole="button"
                accessibilityLabel="Delete model files"
                className="py-2.5 px-3 rounded-xl bg-secondary border border-border flex-row items-center justify-center gap-1 active:opacity-70"
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#ef4444" />
                ) : (
                  <Ionicons name="trash-outline" size={14} color="#ef4444" />
                )}
                <ThemedText type="smallBold" className="text-rose-600 dark:text-rose-400 text-xs">
                  Remove
                </ThemedText>
              </Pressable>
            )}
          </>
        ) : isCurrentModelDownloading ? (
          <Pressable
            onPress={cancelDownload}
            accessibilityRole="button"
            className="flex-1 py-2.5 px-4 rounded-xl bg-secondary border border-border flex-row items-center justify-center gap-1.5 active:opacity-80"
          >
            <Ionicons name="close" size={14} color={isDark ? '#e4e4e7' : '#3f3f46'} />
            <ThemedText type="smallBold" className="text-foreground text-xs">
              Cancel Download
            </ThemedText>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleDownload}
            accessibilityRole="button"
            accessibilityLabel={`Download ${model.name}`}
            className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 flex-row items-center justify-center gap-1.5 active:opacity-85 shadow-sm"
          >
            <Ionicons name="download-outline" size={16} color="#ffffff" />
            <ThemedText type="smallBold" className="text-white text-xs">
              {activeStatus === 'incomplete' ? 'Repair & Redownload' : `Download (${totalMb} MB)`}
            </ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );
}
