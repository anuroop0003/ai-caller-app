export interface ModelFileSpecification {
  readonly name: string;
  readonly type: 'int8' | 'fp32' | 'tokens';
  readonly description: string;
  readonly expectedSizeBytes: number;
  readonly isRequired: boolean;
  readonly bundledByDefault: boolean;
}

export interface SpeechModelMetadata {
  readonly id: string;
  readonly name: string;
  readonly language: string;
  readonly languageCode: string;
  readonly architecture: string;
  readonly sampleRate: number;
  readonly modelType: 'nemo_ctc';
  readonly files: readonly ModelFileSpecification[];
}

export type FileStorageSource = 'bundled_asset' | 'not_found';

export interface ModelPathConfig {
  readonly type: 'asset' | 'file';
  readonly path: string;
}

export interface ModelFileInspection {
  readonly name: string;
  readonly type: 'int8' | 'fp32' | 'tokens';
  readonly description: string;
  readonly exists: boolean;
  readonly sizeBytes?: number;
  readonly source: FileStorageSource;
  readonly isRequired: boolean;
  readonly path?: string;
}

export type ModelInstallationStatus =
  'loading' | 'not_installed' | 'installed' | 'validated' | 'unavailable';

export interface ModelInspectionResult {
  readonly status: ModelInstallationStatus;
  readonly storageSource: 'bundled' | 'none';
  readonly installedCount: number;
  readonly files: readonly ModelFileInspection[];
  readonly error?: string;
}

export interface SttTranscriptionResult {
  readonly text: string;
  readonly tokens: readonly string[];
  readonly timestamps: readonly number[];
  readonly lang?: string;
  readonly emotion?: string;
  readonly event?: string;
  readonly durations?: readonly number[];
}
