import type { ModelFileSpecification } from './speech';

export interface TtsModelMetadata {
  readonly id: string;
  readonly name: string;
  readonly language: string;
  readonly languageCode: string;
  readonly voiceName: string;
  readonly gender?: 'female' | 'male';
  readonly architecture?: string;
  readonly sampleRate?: number;
  readonly modelType?: string;
  readonly files?: readonly ModelFileSpecification[];
}

export interface TtsSynthesisResult {
  readonly audioUri: string;
  readonly rawPath: string;
  readonly sampleRate: number;
  readonly samplesCount: number;
  readonly durationSec: number;
  readonly synthesisTimeMs: number;
  readonly rtf: number;
}
