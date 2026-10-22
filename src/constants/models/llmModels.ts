import type { LlmModelMetadata } from '@/types/llm';
import type { UnifiedModelPackage } from './types';

const HF_REPO_ID =
  process.env.EXPO_PUBLIC_HF_REPO_ID || 'anuroop0003/malayalam-speech-studio-models';
const HF_RAW_BASE = `https://huggingface.co/${HF_REPO_ID}/resolve/main`;

export const LLM_QWEN_0_5B_MODEL: UnifiedModelPackage = {
  id: 'qwen2.5-0.5b-instruct-q4_k_m',
  name: 'Qwen 2.5 0.5B Instruct',
  category: 'llm',
  parameterSize: '0.5B',
  architecture: 'qwen2.5',
  quantization: 'q4_k_m',
  contextLength: 2048,
  malayalamProficiency: 'good',
  recommendedThreads: 4,
  sha256: '0663b826e09042345d6e2069d9655cd3ae84812d8f39a5894bed7b24fc0e86cc',
  description:
    'Ultra-compact conversational LLM (~468 MB) optimized for low-latency Malayalam phone dialogue with minimal RAM usage.',
  totalSizeBytes: 491400032,
  targetDirectory: 'models/llm',
  files: [
    {
      filename: 'qwen2.5-0.5b-instruct-q4_k_m.gguf',
      remoteUrl: `${HF_RAW_BASE}/llm/qwen2.5-0.5b-instruct-q4_k_m.gguf`,
      relativePath: 'qwen2.5-0.5b-instruct-q4_k_m.gguf',
      fileSizeBytes: 491400032,
      sha256: '0663b826e09042345d6e2069d9655cd3ae84812d8f39a5894bed7b24fc0e86cc',
      isRequired: true,
      description: 'GGUF quantized weights for ARM64 llama.cpp NEON execution',
    },
  ],
};

export const LLM_QWEN_1_5B_MODEL: UnifiedModelPackage = {
  id: 'qwen2.5-1.5b-instruct-q4_k_m',
  name: 'Qwen 2.5 1.5B Instruct',
  category: 'llm',
  parameterSize: '1.5B',
  architecture: 'qwen2.5',
  quantization: 'q4_k_m',
  contextLength: 2048,
  malayalamProficiency: 'excellent',
  recommendedThreads: 4,
  sha256: '6ca5463cf24c16cd56d7ad7461524d813b07b3f29889b2fbdbb8286a7e97a14a',
  description:
    'High-fidelity conversational LLM (~1.04 GB) with superior Malayalam grammar, natural phrasing, and Manglish code-mixing.',
  totalSizeBytes: 1117320736,
  targetDirectory: 'models/llm',
  files: [
    {
      filename: 'qwen2.5-1.5b-instruct-q4_k_m.gguf',
      remoteUrl:
        'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf',
      relativePath: 'qwen2.5-1.5b-instruct-q4_k_m.gguf',
      fileSizeBytes: 1117320736,
      sha256: '6ca5463cf24c16cd56d7ad7461524d813b07b3f29889b2fbdbb8286a7e97a14a',
      isRequired: true,
      description: 'GGUF quantized weights (higher nuance, requires device with >= 6GB RAM)',
    },
  ],
};

export function toLlmMetadata(pkg: UnifiedModelPackage): LlmModelMetadata {
  const primaryFile = pkg.files[0];
  return {
    id: pkg.id,
    name: pkg.name,
    parameterSize: pkg.parameterSize ?? '0.5B',
    architecture: (pkg.architecture as 'qwen2.5' | 'llama3' | 'gemma2') ?? 'qwen2.5',
    quantization: (pkg.quantization as 'q4_k_m') ?? 'q4_k_m',
    fileSizeBytes: primaryFile?.fileSizeBytes ?? pkg.totalSizeBytes,
    filename: primaryFile?.filename ?? `${pkg.id}.gguf`,
    downloadUrl: primaryFile?.remoteUrl ?? '',
    sha256: primaryFile?.sha256 ?? pkg.sha256,
    contextLength: pkg.contextLength ?? 2048,
    description: pkg.description,
    malayalamProficiency: pkg.malayalamProficiency ?? 'good',
    recommendedThreads: pkg.recommendedThreads ?? 4,
  };
}

export const QWEN_2_5_0_5B_MODEL: LlmModelMetadata = toLlmMetadata(LLM_QWEN_0_5B_MODEL);
export const QWEN_2_5_1_5B_MODEL: LlmModelMetadata = toLlmMetadata(LLM_QWEN_1_5B_MODEL);

export const AVAILABLE_LLM_MODELS: readonly UnifiedModelPackage[] = [
  LLM_QWEN_0_5B_MODEL,
  LLM_QWEN_1_5B_MODEL,
];

export const DEFAULT_LLM_MODEL = LLM_QWEN_0_5B_MODEL;
