import type { UnifiedModelPackage } from './types';

const HF_REPO_ID =
  process.env.EXPO_PUBLIC_HF_REPO_ID || 'anuroop0003/malayalam-speech-studio-models';
const HF_RAW_BASE = `https://huggingface.co/${HF_REPO_ID}/resolve/main`;

export const LLM_QWEN_0_5B_MODEL: UnifiedModelPackage = {
  id: 'qwen2.5-0.5b-instruct-q4_k_m',
  name: 'Qwen 2.5 0.5B Instruct',
  category: 'llm',
  parameterSize: '0.5B',
  quantization: 'q4_k_m',
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
  quantization: 'q4_k_m',
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

export const AVAILABLE_LLM_MODELS: readonly UnifiedModelPackage[] = [
  LLM_QWEN_0_5B_MODEL,
  LLM_QWEN_1_5B_MODEL,
];

export const DEFAULT_LLM_MODEL = LLM_QWEN_0_5B_MODEL;
