/**
 * Types and interfaces for local on-device LLM inference and dialogue generation.
 */

export type LlmModelArchitecture = 'qwen2.5' | 'llama3' | 'gemma2';

export type LlmQuantizationType = 'q4_k_m' | 'q5_k_m' | 'q8_0' | 'int4' | 'int8' | 'fp16';

export interface LlmModelMetadata {
  readonly id: string;
  readonly name: string;
  readonly parameterSize: string; // e.g. "0.5B", "1.5B"
  readonly architecture: LlmModelArchitecture;
  readonly quantization: LlmQuantizationType;
  readonly fileSizeBytes: number;
  readonly filename: string;
  readonly downloadUrl: string;
  readonly sha256?: string;
  readonly contextLength: number;
  readonly description: string;
  readonly malayalamProficiency: 'fair' | 'good' | 'excellent';
  readonly recommendedThreads: number;
}

export interface LlmInferenceOptions {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  stopTokens?: string[];
  timeoutMs?: number;
}

export interface LlmInferenceMetrics {
  readonly timeToFirstTokenMs: number;
  readonly totalGenerationTimeMs: number;
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly tokensPerSecond: number;
}

export interface LlmGenerationResult {
  readonly text: string;
  readonly metrics: LlmInferenceMetrics;
}

export type LlmRuntimeType = 'native_llama_rn' | 'mock' | 'unlinked';

/**
 * Low-level model runtime interface.
 * Abstracts llama.cpp, ONNX GenAI, or mock testing engines.
 */
export interface ILlmRuntime {
  readonly runtimeType: LlmRuntimeType;
  isInitialized(): boolean;
  getActiveModel(): LlmModelMetadata | null;
  loadModel(model: LlmModelMetadata, modelFilePath?: string): Promise<void>;
  generate(prompt: string, options?: LlmInferenceOptions): Promise<LlmGenerationResult>;
  stopGeneration(): Promise<void>;
  destroy(): Promise<void>;
}

export type ModelDownloadStatus =
  'idle' | 'checking' | 'downloading' | 'verifying' | 'ready' | 'error';

export interface ModelDownloadProgress {
  status: ModelDownloadStatus;
  bytesDownloaded: number;
  totalBytes: number;
  progressPercent: number;
  speedBytesPerSec?: number;
  error?: string;
}

export interface LlmBenchmarkResult {
  readonly modelId: string;
  readonly modelName: string;
  readonly runtimeType: LlmRuntimeType;
  readonly prompt: string;
  readonly response: string;
  readonly loadTimeMs: number;
  readonly timeToFirstTokenMs: number;
  readonly generationTimeMs: number;
  readonly totalTurnaroundMs: number;
  readonly tokensPerSecond: number;
  readonly completionTokens: number;
  readonly timestamp: number;
}

export interface LlmRuntimeStatusInfo {
  readonly runtimeType: LlmRuntimeType;
  readonly isRealNativeAvailable: boolean;
  readonly activeModelId: string | null;
  readonly isModelLoaded: boolean;
  readonly nativeBridgeDetails?: string;
}
