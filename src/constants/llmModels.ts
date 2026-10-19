import type { LlmModelMetadata } from '@/types/llm';

const HF_REPO_ID = process.env.EXPO_PUBLIC_HF_REPO_ID || '';

export const QWEN_2_5_0_5B_MODEL: LlmModelMetadata = {
  id: 'qwen2.5-0.5b-instruct-q4_k_m',
  name: 'Qwen 2.5 0.5B Instruct',
  parameterSize: '0.5B',
  architecture: 'qwen2.5',
  quantization: 'q4_k_m',
  filename: 'qwen2.5-0.5b-instruct-q4_k_m.gguf',
  downloadUrl: HF_REPO_ID
    ? `https://huggingface.co/${HF_REPO_ID}/resolve/main/llm/qwen2.5-0.5b-instruct-q4_k_m.gguf`
    : '',
  fileSizeBytes: 491400032, // 468.6 MB
  sha256: '0663b826e09042345d6e2069d9655cd3ae84812d8f39a5894bed7b24fc0e86cc',
  contextLength: 2048,
  description:
    'Ultra-compact multilingual model optimized for low-latency on-device phone dialogue and short conversational turns.',
  malayalamProficiency: 'good',
  recommendedThreads: 4,
};

export const QWEN_2_5_1_5B_MODEL: LlmModelMetadata = {
  id: 'qwen2.5-1.5b-instruct-q4_k_m',
  name: 'Qwen 2.5 1.5B Instruct',
  parameterSize: '1.5B',
  architecture: 'qwen2.5',
  quantization: 'q4_k_m',
  filename: 'qwen2.5-1.5b-instruct-q4_k_m.gguf',
  downloadUrl:
    'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf',
  fileSizeBytes: 1117320736, // 1.04 GB
  sha256: '6ca5463cf24c16cd56d7ad7461524d813b07b3f29889b2fbdbb8286a7e97a14a',
  contextLength: 2048,
  description:
    'High-fidelity multilingual conversational model with superior Malayalam syntax and natural code-mixed Manglish understanding.',
  malayalamProficiency: 'excellent',
  recommendedThreads: 4,
};

export const DEFAULT_LLM_MODEL: LlmModelMetadata = QWEN_2_5_0_5B_MODEL;

export const AVAILABLE_LLM_MODELS: readonly LlmModelMetadata[] = [
  QWEN_2_5_0_5B_MODEL,
  QWEN_2_5_1_5B_MODEL,
];
