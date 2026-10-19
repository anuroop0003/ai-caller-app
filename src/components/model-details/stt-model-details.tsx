import { View } from 'react-native';

import { DEFAULT_SPEECH_MODEL } from '@/constants/speechModels';
import { useModelInspection } from '@/hooks/use-model-inspection';
import type { SpeechModelMetadata } from '@/types/speech';
import { cn } from '@/utils/cn';

import { ModelErrorBanner } from './model-error-banner';
import { ModelFilesSection } from './model-files-section';
import { ModelHeaderSection } from './model-header-section';
import { ModelSpecsCard } from './model-specs-card';

export interface SttModelDetailsProps {
  model?: SpeechModelMetadata;
  inspectionHook?: ReturnType<typeof useModelInspection>;
  className?: string;
}

export function SttModelDetails({
  model = DEFAULT_SPEECH_MODEL,
  inspectionHook: externalHook,
  className,
}: SttModelDetailsProps = {}) {
  const internalHook = useModelInspection(model);
  const hook = externalHook ?? internalHook;

  const {
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
    <View className={cn('bg-card border border-border rounded-md p-4 gap-4 shadow-sm', className)}>
      {/* Top row: Title & Active Badge */}
      <ModelHeaderSection
        name={model.name}
        language={model.language}
        architecture={model.architecture}
        isInstalled={isInstalled}
        statusLabel={statusLabel}
      />

      {/* Error Banner if inspection or filesystem failure */}
      <ModelErrorBanner error={error ?? inspection?.error} />

      {/* Sherpa-ONNX metadata banner */}
      <ModelSpecsCard
        modelType={model.modelType}
        sampleRate={model.sampleRate}
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
