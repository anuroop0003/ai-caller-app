export interface TtsModelMetadata {
  readonly id: string;
  readonly name: string;
  readonly language: string;
  readonly languageCode: string;
  readonly voiceName: string;
  readonly gender: 'female' | 'male';
  readonly architecture: 'vits';
  readonly sampleRate: number;
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
