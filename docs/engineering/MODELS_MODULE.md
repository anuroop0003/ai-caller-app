# Models & Asset Management Module

This document details the architecture, metadata, readiness evaluation, download pipeline, lifecycle management, and diagnostics integration of the **Models Module**.

---

## 1. Module Overview & Component Hierarchy

The Models module provides a unified, cross-category hub for managing on-device models across **STT** (Speech Recognition), **TTS** (Speech Synthesis), and **LLM** (Conversational Language Model).

```
src/app/models.tsx (Screen Route)
└── ScreenContainer (src/components/layout/)
    ├── ScreenHeader
    └── ModelDetailsContent (src/components/model-details/)
        ├── ModelCategoryTabs (STT | TTS | LLM)
        ├── Category Overview Banner
        │
        ├── [STT / LLM Tabs]:
        │   └── ModelStatusCard (src/components/models/)
        │       ├── ModelCardHeader
        │       ├── ModelCardMetadata
        │       ├── ModelDownloadProgress (when active)
        │       ├── ModelManifestList
        │       └── ModelCardActions (Download / Cancel / Delete / Test)
        │
        └── [TTS Tab]:
            └── TtsModelsHub (src/components/speech/tts/)
                ├── TtsEngineCard (Android system engine status)
                ├── Language Filter Tabs (All / Malayalam / Hindi / Tamil...)
                └── TtsLanguageCard (Voice picker, Rate/Pitch sliders, Preview)
```

---

## 2. Canonical Model Catalog (`src/constants/models/`)

The single source of truth for model specifications is located in `src/constants/models/`.

### Core Data Structure: `UnifiedModelPackage`

Defined in [src/constants/models/types.ts](file:///home/anuroop-tm/ai-caller-app/src/constants/models/types.ts):

- `id`: Unique identifier across the entire application (e.g. `sherpa-onnx-indic-conformer-ml`, `android-system-tts`, `qwen2.5-0.5b-instruct-q4_k_m`).
- `category`: `'stt' | 'tts' | 'llm'`.
- `totalSizeBytes`: Cumulative package download size in bytes.
- `targetDirectory`: Storage directory relative to `FileSystem.documentDirectory`.
- `files`: Array of `ModelFileEntry` items specifying filename, remote URL, expected byte size, SHA-256 hash, and decompression instructions.
- Category-specific fields: `architecture`, `languageCode`, `parameterSize`, `quantization`, `contextLength`, `malayalamProficiency`, `recommendedThreads`.

### Canonical Models

- **STT:** `STT_INDIC_CONFORMER_MODEL` ([sttModels.ts](file:///home/anuroop-tm/ai-caller-app/src/constants/models/sttModels.ts)) — Quantized INT8 NeMo CTC Conformer model (~141.2 MB) optimized for Malayalam and Indic speech recognition.
- **TTS:** `TTS_ANDROID_SYSTEM_MODEL` ([ttsModels.ts](file:///home/anuroop-tm/ai-caller-app/src/constants/models/ttsModels.ts)) — Native Android hardware-accelerated speech synthesis engine supporting system voices across Indian languages. (Requires 0 MB downloads).
- **LLM:** `LLM_QWEN_0_5B_MODEL` (~468 MB) and `LLM_QWEN_1_5B_MODEL` (~1.04 GB) ([llmModels.ts](file:///home/anuroop-tm/ai-caller-app/src/constants/models/llmModels.ts)) — Quantized GGUF Q4_K_M weights for on-device phone dialogue.

### Backward-Compatibility Adapters

Legacy constant paths remain in place as direct re-exports:

- `src/constants/llmModels.ts`: Re-exports `QWEN_2_5_0_5B_MODEL` and `QWEN_2_5_1_5B_MODEL` from `src/constants/models/llmModels.ts`.
- `src/constants/ttsModels.ts`: Re-exports `TTS_ANDROID_SYSTEM_MODEL` while preserving `MALAYALAM_TTS_PRESETS`.
- `src/constants/speechModels.ts`: Preserves `INDIC_CONFORMER_ML_MODEL`.

---

## 3. Model Readiness Source of Truth

Model readiness is evaluated exclusively by `ModelReadinessService` ([src/services/models/modelReadinessService.ts](file:///home/anuroop-tm/ai-caller-app/src/services/models/modelReadinessService.ts)).

### Evaluation Flow

1. **TTS Bypass:** If `model.category === 'tts'`, it reports `ready: true`, `status: 'ready'`, and `resolvedPath: 'android_system_tts'` immediately because it relies on the Android OS engine.
2. **App-Private Storage Check:** For STT and LLM, `ModelFileService.verifyModelFiles(model)` verifies every required file on disk against its expected file size (allowing ±2% tolerance for non-text files).
3. **Bundled Asset Fallback:** If STT files are not found in app storage, `ModelReadinessService.isModelBundledInApkAssets(model.id)` queries the native `react-native-sherpa-onnx` asset manager to check if pre-bundled APK assets exist.
4. **Status States:**
   - `'ready'`: All required files exist and pass size verification.
   - `'incomplete'`: Some required files exist, but others are missing.
   - `'not_downloaded'`: No required files exist on disk.
   - `'downloading'`: Active download in progress (coordinated via `useModelDownload`).
   - `'failed'`: An unhandled filesystem error occurred during inspection.

### Pub/Sub Event Invalidation

`ModelReadinessService` maintains a set of `readinessListeners`. Whenever a model is downloaded, cancelled, or deleted via `ModelFileService.deleteModel()`, `ModelReadinessService.notifyModelChanged(modelId)` is dispatched. The `useModelReadiness` hook listens to these broadcasts and automatically refreshes UI state.

---

## 4. Download & Storage Pipeline

Managed by `modelDownloadService` ([src/services/models/modelDownloadService.ts](file:///home/anuroop-tm/ai-caller-app/src/services/models/modelDownloadService.ts)):

- **Single-Download Mutex:** Only one model download can run at any given moment. Attempting to start a download while another is active throws a concurrency error.
- **Storage Safety Buffer:** Before initiating a download, device free space is checked via `ModelFileService.getFreeDiskStorageBytes()`. The package size plus a mandatory 150 MB safety margin must be available.
- **Resumable Downloads:** Uses `FileSystem.createDownloadResumable()` with progress tracking via `DownloadSpeedTracker` (measuring speed in bytes/sec, downloaded bytes, and percentage).
- **Archive Extraction:** If a model entry has `isArchive: true` (e.g. tar/tar.bz2 archives), `ModelArchiveExtractor` handles background decompression.

---

## 5. Deletion & Native Runtime Teardown

Deleting a model must be done through `ModelFileService.deleteModel(model)` ([src/services/models/modelFileService.ts](file:///home/anuroop-tm/ai-caller-app/src/services/models/modelFileService.ts)):

1. **Active STT Teardown:** If `model.category === 'stt'`, `SpeechRecognitionService.destroy()` is awaited, releasing native C++ recognizer locks.
2. **Active TTS Teardown:** If `model.category === 'tts'`, `nativeTtsService.stop()` cancels any in-flight speech synthesis.
3. **Active LLM Teardown:** If `model.category === 'llm'`, `callerStore.getResponseGenerator()` is checked. If it is an active `LocalLlmResponseGenerator`, its runtime `.destroy()` method is executed, unloading native llama.rn contexts before reverting the store to `defaultDialogueEngine`.
4. **Physical Disk Deletion:** The entire target directory under `FileSystem.documentDirectory` is removed idempotently via `FsAdapter.deleteAsync()`.
5. **Readiness Invalidation:** `ModelReadinessService.notifyModelChanged(model.id)` is called to trigger instant re-renders in all mounted cards and diagnostics.

---

## 6. Integration with Diagnostics

The Diagnostics page (`src/app/diagnostics.tsx`) directly reuses the Models module's authoritative services:

- **STT Diagnostics:** Uses `useModelReadiness('stt')`. If files are missing, `SampleCard` disables transcription actions and displays `'Model Missing'`. Furthermore, `AudioBenchmarkService.runBenchmark()` asserts readiness upfront before touching audio assets. During unresolved initial readiness evaluation, renders `<SttTabSkeleton />` matching the sample cards and controls layout.
- **TTS Diagnostics:** Uses `useTtsBenchmark()`. Validates system voice installation and allows testing custom speech rates and Indian language phrases without downloading neural assets. During asynchronous engine and voice discovery, renders `<TtsTabSkeleton />` matching the speech benchmark card layout.
- **LLM Diagnostics:** Uses `useLlmDiagnostics()`, `LlmBenchmarkCard`, and `LlmBenchmarkService`. Directly lists benchmark cards for each canonical LLM model (`Qwen 2.5 0.5B` and `Qwen 2.5 1.5B`) without model-picker button bars or selected-model state toggling. A single combined missing files guard at the top of the tab lists any missing model files across both models simultaneously. Each card independently presents its readiness status, download progress, prompt presets, execution metrics, and action buttons. If model weights are missing on disk, benchmark actions are disabled with the label `'Model Missing'` and `warning-outline` icon, matching the STT tab's `SampleCard` behavior. Deterministic mode is reserved exclusively as the phone call fallback engine and is not presented as an LLM benchmark candidate. During initial readiness evaluation, renders `<LlmTabSkeleton />` matching the two-card layout.

### 6.1 Readiness Caching & Flicker-Free Navigation

`ModelReadinessService` maintains an in-memory cache of evaluated model readiness states (`getCachedReadiness(modelId)`). When `useModelReadiness` initializes, it seeds its state from this cache synchronously if available (`isCheckingInitialReadiness = !cachedResult`). Invalidation occurs upon model download completion, cancellation, failure, or deletion. Transient filesystem errors return a failure status but bypass the readiness cache so subsequent calls can re-attempt verification. Similarly, `NativeTtsService` caches discovered system voices and provides language-scoped lookups (`getCachedVoicesForLanguage(languageCode)`), allowing `useTtsBenchmark` to initialize and switch languages synchronously without showing voices from prior languages or flashing skeletons on subsequent tab switches. Skeletons are displayed strictly while readiness is genuinely unresolved, never as a stand-in for missing or un-downloaded models.
