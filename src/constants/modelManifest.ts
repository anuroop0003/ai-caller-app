/**
 * Centralized Model Manifest for on-device Malayalam AI Caller models.
 * Hosted on user's Hugging Face repository for reliable, permanent CDN delivery with HTTP Range support.
 */

export interface ModelFileManifestEntry {
  readonly filename: string;
  readonly remoteUrl: string;
  readonly relativePath: string;
  readonly fileSizeBytes: number;
  readonly isArchive?: boolean; // If true, decompress after download (e.g. espeak-ng-data.tar.bz2)
}

export interface ModelPackageManifest {
  readonly id: string;
  readonly name: string;
  readonly category: 'stt' | 'tts' | 'llm';
  readonly description: string;
  readonly totalSizeBytes: number;
  readonly targetDirectory: string; // Directory under FileSystem.documentDirectory
  readonly files: readonly ModelFileManifestEntry[];
}

export const HF_BASE_REPO = process.env.EXPO_PUBLIC_HF_REPO_ID || '';
const HF_RAW_BASE = HF_BASE_REPO ? `https://huggingface.co/${HF_BASE_REPO}/resolve/main` : '';

export const STT_PACKAGE_MANIFEST: ModelPackageManifest = {
  id: 'sherpa-onnx-indic-conformer-ml',
  name: 'Sherpa-ONNX IndicConformer (Malayalam STT)',
  category: 'stt',
  description:
    'Quantized INT8 multilingual speech-to-text model optimized for Malayalam conversational turns.',
  totalSizeBytes: 141240753, // ~141.2 MB
  targetDirectory: 'models/sherpa-onnx-indic-conformer-ml',
  files: [
    {
      filename: 'model.int8.onnx',
      remoteUrl: `${HF_RAW_BASE}/stt/sherpa-onnx-indic-conformer-ml/model.int8.onnx`,
      relativePath: 'model.int8.onnx',
      fileSizeBytes: 141173148,
    },
    {
      filename: 'tokens.txt',
      remoteUrl: `${HF_RAW_BASE}/stt/sherpa-onnx-indic-conformer-ml/tokens.txt`,
      relativePath: 'tokens.txt',
      fileSizeBytes: 67605,
    },
  ],
};

export const LLM_0_5B_PACKAGE_MANIFEST: ModelPackageManifest = {
  id: 'qwen2.5-0.5b-instruct-q4_k_m',
  name: 'Qwen 2.5 0.5B Instruct (GGUF)',
  category: 'llm',
  description:
    'Ultra-compact conversational LLM optimized for low-latency Malayalam phone dialogue.',
  totalSizeBytes: 491400032, // ~468.6 MB
  targetDirectory: 'models/llm',
  files: [
    {
      filename: 'qwen2.5-0.5b-instruct-q4_k_m.gguf',
      remoteUrl: `${HF_RAW_BASE}/llm/qwen2.5-0.5b-instruct-q4_k_m.gguf`,
      relativePath: 'qwen2.5-0.5b-instruct-q4_k_m.gguf',
      fileSizeBytes: 491400032,
    },
  ],
};

export const ALL_MODEL_MANIFESTS: readonly ModelPackageManifest[] = [
  STT_PACKAGE_MANIFEST,
  LLM_0_5B_PACKAGE_MANIFEST,
];
