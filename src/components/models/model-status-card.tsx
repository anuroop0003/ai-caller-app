import { useState } from 'react';
import { Alert, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ModelReadinessStatus, UnifiedModelPackage } from '@/constants/models';
import { useModelDownload } from '@/hooks/use-model-download';
import { useModelReadiness } from '@/hooks/use-model-readiness';
import { ModelFileService } from '@/services/models';
import { formatFileSize } from '@/utils/format';
import { ModelDownloadProgress } from './model-download-progress';
import {
  ModelCardActions,
  ModelCardHeader,
  ModelCardMetadata,
  ModelCardSkeleton,
  ModelManifestList,
} from './model-status-card/index';

export interface ModelStatusCardProps {
  model: UnifiedModelPackage;
  onTestModel?: () => void;
}

export function ModelStatusCard({ model, onTestModel }: ModelStatusCardProps) {
  const { downloadState, startDownload, cancelDownload, isCurrentModelActive } = useModelDownload(
    model.id
  );
  const {
    readiness,
    isReady,
    status,
    storageLocation,
    missingFiles,
    refreshReadiness,
    isCheckingInitialReadiness,
  } = useModelReadiness(model);

  const [isDeleting, setIsDeleting] = useState(false);

  if (isCheckingInitialReadiness) {
    return <ModelCardSkeleton />;
  }

  const activeStatus: ModelReadinessStatus = isCurrentModelActive
    ? downloadState.status === 'verifying'
      ? 'verifying'
      : 'downloading'
    : status;

  const formattedTotalSize = formatFileSize(model.totalSizeBytes);

  const handleDownload = async () => {
    await startDownload(model);
    await refreshReadiness();
  };

  const handleDelete = () => {
    Alert.alert(
      'Remove Model Files',
      `Are you sure you want to delete ${model.name} (${formattedTotalSize}) from private app storage? You will need to re-download it to use offline inference.`,
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

  const hasLocalFiles = Boolean(readiness?.files.some((f) => f.exists));

  return (
    <View className="rounded-md p-4 border border-border bg-card gap-3 shadow-sm">
      <ModelCardHeader
        category={model.category}
        name={model.name}
        formattedTotalSize={formattedTotalSize}
        filesCount={model.files.length}
      />

      <ThemedText type="small" className="text-muted-foreground leading-5">
        {model.description}
      </ThemedText>

      <ModelCardMetadata
        status={activeStatus}
        missingFilesCount={missingFiles.length}
        parameterSize={model.parameterSize}
        storageLocation={storageLocation}
      />

      {isCurrentModelActive && (
        <ModelDownloadProgress progressState={downloadState} onCancel={cancelDownload} />
      )}

      <ModelManifestList files={model.files} readinessFiles={readiness?.files} />

      <ModelCardActions
        modelName={model.name}
        formattedTotalSize={formattedTotalSize}
        isReady={isReady}
        isDownloading={isCurrentModelActive}
        isDeleting={isDeleting}
        activeStatus={activeStatus}
        storageLocation={storageLocation}
        hasLocalFiles={hasLocalFiles}
        onDownload={handleDownload}
        onCancel={cancelDownload}
        onDelete={handleDelete}
        onTest={onTestModel}
      />
    </View>
  );
}
