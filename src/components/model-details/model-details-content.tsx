import { View } from 'react-native';

import { useModelInspection } from '@/hooks/use-model-inspection';
import type { SpeechModelMetadata } from '@/types/speech';
import { cn } from '@/utils/cn';

import { ModelErrorBanner } from './model-error-banner';
import { ModelFilesSection } from './model-files-section';
import { ModelHeaderSection } from './model-header-section';
import { ModelSpecsCard } from './model-specs-card';

export interface ModelDetailsContentProps {
  model?: SpeechModelMetadata;
  inspectionHook?: ReturnType<typeof useModelInspection>;
  className?: string;
}

export function ModelDetailsContent({
  model,
  inspectionHook: externalHook,
  className,
}: ModelDetailsContentProps) {
  const internalHook = useModelInspection(model);
  const hook = externalHook ?? internalHook;

  const {
    model: activeModel,
    loading,
    refreshing = false,
    inspection,
    error,
    currentStatus,
    displayedFiles,
    storageSourceLabel,
    folderContentsTitle,
    refresh,
  } = hook;

  const isInstalled = currentStatus === 'installed' || currentStatus === 'validated';
  const statusLabel =
    loading && !inspection
      ? 'Checking...'
      : isInstalled
        ? 'Installed'
        : currentStatus === 'loading'
          ? 'Checking...'
          : 'Not installed';

  return (
    <View
      className={cn(
        'bg-card border border-border rounded-md p-4 gap-4 shadow-sm',
        className
      )}>
      {/* Top row: Title & Active Badge */}
      <ModelHeaderSection
        name={activeModel?.name}
        language={activeModel?.language}
        architecture={activeModel?.architecture}
        isInstalled={isInstalled}
        statusLabel={statusLabel}
      />

      {/* Error Banner if inspection or filesystem failure */}
      <ModelErrorBanner error={error ?? inspection?.error} />

      {/* Sherpa-ONNX metadata banner */}
      <ModelSpecsCard
        modelType={activeModel?.modelType}
        sampleRate={activeModel?.sampleRate}
        storageSourceLabel={storageSourceLabel}
      />

      {/* Files in /models folder */}
      <ModelFilesSection
        title={folderContentsTitle}
        files={displayedFiles}
        loading={loading && !inspection}
        refreshing={refreshing}
        onRefresh={refresh}
      />
    </View>
  );
}
