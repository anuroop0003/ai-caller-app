import { View } from 'react-native';

import { DEFAULT_TTS_MODEL } from '@/constants/ttsModels';
import { useModelInspection } from '@/hooks/use-model-inspection';
import type { TtsModelMetadata } from '@/types/tts';
import { cn } from '@/utils/cn';

import { ModelErrorBanner } from './model-error-banner';
import { ModelFilesSection } from './model-files-section';
import { ModelHeaderSection } from './model-header-section';
import { ModelSpecsCard } from './model-specs-card';

export interface TtsModelDetailsProps {
  model?: TtsModelMetadata;
  inspectionHook?: ReturnType<typeof useModelInspection>;
  className?: string;
}

export function TtsModelDetails({
  model = DEFAULT_TTS_MODEL,
  inspectionHook: externalHook,
  className,
}: TtsModelDetailsProps = {}) {
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

  const personaLabel = `${model.voiceName} (${model.gender === 'female' ? 'Female' : 'Male'})`;

  return (
    <View className={cn('bg-card border border-border rounded-md p-4 gap-4 shadow-sm', className)}>
      {/* Top row: Title & Active Badge */}
      <ModelHeaderSection
        name={model.name}
        language={model.language}
        architecture="VITS / Piper Offline"
        isInstalled={isInstalled}
        statusLabel={statusLabel}
      />

      {/* Error Banner if inspection or filesystem failure */}
      <ModelErrorBanner error={error ?? inspection?.error} />

      {/* Piper VITS metadata banner */}
      <ModelSpecsCard
        persona={personaLabel}
        modelType="vits"
        sampleRate={model.sampleRate}
        storageSourceLabel={storageSourceLabel}
      />

      {/* Files in /models/vits-piper-ml_IN-meera-medium folder */}
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
