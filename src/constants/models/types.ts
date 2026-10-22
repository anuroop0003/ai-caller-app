export type ModelCategory = 'stt' | 'tts' | 'llm';

export type ModelReadinessStatus =
  'not_downloaded' | 'downloading' | 'verifying' | 'ready' | 'incomplete' | 'failed';

export interface ModelFileEntry {
  readonly filename: string;
  readonly remoteUrl: string;
  readonly relativePath: string; // relative inside the model's targetDirectory
  readonly fileSizeBytes: number;
  readonly sha256?: string;
  readonly isRequired: boolean;
  readonly isArchive?: boolean;
  readonly extractedTargetDir?: string; // e.g. 'espeak-ng-data'
  readonly description?: string;
}

export interface UnifiedModelPackage {
  readonly id: string;
  readonly name: string;
  readonly category: ModelCategory;
  readonly description: string;
  readonly totalSizeBytes: number;
  readonly targetDirectory: string; // e.g. 'models/sherpa-onnx-indic-conformer-ml'
  readonly files: readonly ModelFileEntry[];
  readonly version?: string;
  // Category-specific properties
  readonly language?: string;
  readonly languageCode?: string;
  readonly sampleRate?: number;
  readonly voiceName?: string;
  readonly parameterSize?: string;
  readonly quantization?: string;
  readonly architecture?: string;
  readonly modelType?: string;
  readonly contextLength?: number;
  readonly malayalamProficiency?: 'fair' | 'good' | 'excellent';
  readonly recommendedThreads?: number;
  readonly sha256?: string;
}

export interface FileVerificationItem {
  readonly filename: string;
  readonly exists: boolean;
  readonly sizeBytes?: number;
  readonly expectedSizeBytes: number;
  readonly isValidSize: boolean;
  readonly isRequired: boolean;
  readonly isValid?: boolean;
  readonly isCorrupted?: boolean;
  readonly localPath: string;
}

export interface ModelReadinessResult {
  readonly modelId: string;
  readonly category: ModelCategory;
  readonly status: ModelReadinessStatus;
  readonly isReady: boolean;
  readonly storageLocation: 'app_storage' | 'bundled_asset' | 'none';
  readonly resolvedPath: string | null;
  readonly files: readonly FileVerificationItem[];
  readonly missingFiles: readonly string[];
  readonly errorMessage?: string;
}
