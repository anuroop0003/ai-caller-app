import type { ModelInspectionResult, SpeechModelMetadata } from '@/types/speech';
import type { TtsModelMetadata } from '@/types/tts';

export interface DisplayedModelFile {
  name: string;
  description: string;
  exists: boolean;
  sizeBytes?: number;
  isRequired: boolean;
}

export function getDisplayedModelFiles(
  model: SpeechModelMetadata | TtsModelMetadata,
  inspection: ModelInspectionResult | null
): ReadonlyArray<DisplayedModelFile> {
  if (inspection) {
    return inspection.files;
  }

  return (model?.files ?? []).map((file) => ({
    name: file.name,
    description: file.description,
    exists: false,
    sizeBytes: file.expectedSizeBytes,
    isRequired: file.isRequired,
  }));
}

export function getStorageSourceLabel(
  inspection: ModelInspectionResult | null,
  isLoading: boolean
): string {
  if (isLoading) {
    return 'Inspecting...';
  }

  return inspection?.storageSource === 'bundled' ? 'Bundled APK Asset' : 'Not Installed';
}

export function getFolderContentsTitle(
  inspection: ModelInspectionResult | null,
  isLoading: boolean
): string {
  if (isLoading) {
    return 'Folder Contents (Checking...)';
  }

  return `Folder Contents (${inspection?.installedCount ?? 0} Assets Installed)`;
}
