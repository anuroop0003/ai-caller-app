import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useModelInspection } from '@/hooks/use-model-inspection';
import type { SpeechModelMetadata } from '@/types/speech';
import { formatFileSize } from '@/utils/format';
import type { DisplayedModelFile } from '@/utils/modelInspection.utils';

import { ModelStatusBadge } from './model-status-badge';

function getFileBadgeText(file: DisplayedModelFile, isLoading: boolean): string {
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

interface ModelDetailsContentProps {
  model?: SpeechModelMetadata;
  inspectionHook?: ReturnType<typeof useModelInspection>;
}

export function ModelDetailsContent({
  model,
  inspectionHook: externalHook,
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

  return (
    <View className="bg-card border border-border rounded-md p-4 gap-4 shadow-sm">
      {/* Top row: Title & Active Badge */}
      <View className="flex-row justify-between items-start gap-3">
        <View className="flex-1 gap-0.5">
          <ThemedText type="smallBold" className="text-muted-foreground">
            Dedicated Speech Model
          </ThemedText>
          <ThemedText type="h3" className="text-card-foreground">
            {activeModel?.name ?? 'IndicConformer Malayalam'}
          </ThemedText>
          <ThemedText type="muted" className="text-muted-foreground">
            {activeModel?.language ?? 'Malayalam'} • {activeModel?.architecture ?? 'NeMo CTC'}
          </ThemedText>
        </View>

        <ModelStatusBadge status={currentStatus} />
      </View>

      {/* Error Banner if inspection or filesystem failure */}
      {(error ?? inspection?.error) ? (
        <View className="p-3 rounded-md border border-amber-500/30 bg-amber-500/10">
          <ThemedText type="small" className="text-amber-600 dark:text-amber-400">
            {error ?? inspection?.error}
          </ThemedText>
        </View>
      ) : null}

      {/* Sherpa-ONNX metadata banner */}
      <View className="p-3.5 rounded-md border border-border bg-secondary/60 gap-2">
        <View className="flex-row flex-wrap gap-2">
          <View className="px-2.5 py-1 rounded-md bg-card border border-border">
            <ThemedText type="muted" className="text-muted-foreground">
              Layout: <ThemedText type="small" className="text-foreground">{activeModel?.modelType ?? 'nemo_ctc'}</ThemedText>
            </ThemedText>
          </View>
          <View className="px-2.5 py-1 rounded-md bg-card border border-border">
            <ThemedText type="muted" className="text-muted-foreground">
              Sampling:{' '}
              <ThemedText type="small" className="text-foreground">
                {((activeModel?.sampleRate ?? 16000) / 1000)} kHz Mono
              </ThemedText>
            </ThemedText>
          </View>
          <View className="px-2.5 py-1 rounded-md bg-card border border-border">
            <ThemedText type="muted" className="text-muted-foreground">
              Format: <ThemedText type="small" className="text-foreground">ONNX Runtime</ThemedText>
            </ThemedText>
          </View>
          <View className="px-2.5 py-1 rounded-md bg-card border border-border">
            <ThemedText type="muted" className="text-muted-foreground">
              Storage:{' '}
              <ThemedText type="small" className="text-foreground">
                {storageSourceLabel}
              </ThemedText>
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Files in /models folder */}
      <View className="gap-2.5">
        <View className="flex-row justify-between items-center">
          <ThemedText type="smallBold" className="text-foreground">
            {folderContentsTitle}
          </ThemedText>

          <Pressable
            onPress={refresh}
            disabled={loading || refreshing}
            className={`px-2.5 py-1 rounded-md bg-secondary active:opacity-70 ${refreshing ? 'opacity-60' : ''
              }`}>
            <ThemedText type="small" className="text-muted-foreground">
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </ThemedText>
          </Pressable>
        </View>

        {displayedFiles.map((file) => (
          <View
            key={file.name}
            className="p-3 rounded-md border border-border bg-secondary/40 gap-1.5">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <ThemedText type="smallBold" className="text-foreground">
                  {file.name}
                </ThemedText>
              </View>

              <View
                className={`px-2 py-0.5 rounded-md border ${file.exists
                  ? 'bg-blue-500/10 border-blue-500/20'
                  : 'bg-secondary border-border'
                  }`}>
                <ThemedText
                  type="code"
                  className={
                    file.exists
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-muted-foreground'
                  }>
                  {getFileBadgeText(file, loading && !inspection)}
                </ThemedText>
              </View>
            </View>

            <ThemedText type="muted" className="text-muted-foreground">
              {file.description}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}
