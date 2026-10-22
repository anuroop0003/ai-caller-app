# Native Integrations & Android Runtime Architecture

This document covers the native libraries, Android platform integrations, and build constraints for **AI Caller**.

---

## 1. Native Framework & Build System

- **Expo SDK Version:** Expo SDK 57 (`~57.0.30`)
- **React Native Version:** React Native 0.86.3 with React 19.2.3
- **Native Architecture:** React Native New Architecture (TurboModules & JSI bridges enabled)
- **Continuous Native Generation (CNG):** The `android/` and `ios/` folders are generated. Configuration must be applied in `app.json` or through Expo Config Plugins—never edit native directories manually.
- **Expo Go Incompatibility:** Custom native TurboModules (`react-native-sherpa-onnx`, `llama.rn`) require a development build (`npx expo run:android` or EAS Build). Expo Go cannot execute offline STT or local LLM inference.

---

## 2. Speech Recognition (STT): `react-native-sherpa-onnx`

- **Library:** `react-native-sherpa-onnx` (`^0.4.4`)
- **Engine Type:** NeMo CTC Conformer (`modelType: 'nemo_ctc'`)
- **Model Format:** Quantized INT8 ONNX (`model.int8.onnx`) + tokens vocabulary (`tokens.txt`)
- **Sample Rate:** Strictly 16,000 Hz, mono channel, 16-bit PCM.
- **Filesystem Path Resolution:**
  - When loading from app-private storage, the native engine requires absolute filesystem paths without the `file://` URI prefix (e.g. `/data/user/0/com.anonymous.aicallerapp/files/models/...`).
  - When loading bundled APK assets, `react-native-sherpa-onnx` resolves assets using `{ type: 'asset', path: 'models/sherpa-onnx-indic-conformer-ml' }`.
- **Runtime Teardown:** Must call `engine.destroy()` via `SpeechRecognitionService.destroy()` when switching models, deleting assets, or tearing down audio sessions to release C++ native memory.

---

## 3. Local Language Model (LLM): `llama.rn`

- **Library:** `llama.rn` (`^0.13.0-rc.7`)
- **Engine Architecture:** llama.cpp C++ core compiled for ARM64 with NEON SIMD optimizations
- **Model Weights:** GGUF Q4_K_M quantized format (`qwen2.5-0.5b-instruct-q4_k_m.gguf` ~468 MB, `qwen2.5-1.5b-instruct-q4_k_m.gguf` ~1.04 GB)
- **Execution Lifecycle:**
  - Model loading is managed through `LlamaCppNativeRuntime.loadModel(model, filePath)`.
  - Inference runs via `context.completion(params)`.
  - Active timeout protection: `LocalLlmResponseGenerator` enforces a 3,500 ms timeout. When a turn times out, `context.stopCompletion()` is immediately dispatched to stop background CPU/RAM churn before falling back to the deterministic dialogue engine.
  - Runtime cleanup: Before deleting weights or swapping engines, `context.release()` must be executed.
- **Memory Requirements:**
  - Qwen 0.5B requires ~600 MB free RAM during inference.
  - Qwen 1.5B requires >= 1.5 GB free RAM and devices with at least 6 GB total physical RAM.

---

## 4. Speech Synthesis (TTS): Android Native Engine

- **Library:** `expo-speech` (`~57.0.3`) and `expo-intent-launcher` (`~57.0.1`)
- **Strategy:** Hardware-accelerated native Android system TTS (Google Speech Services / Samsung TTS / OEM engine) instead of heavy neural Piper models.
- **Zero-Download Architecture:** Relies on system-installed voices already present on the Android device.
- **Multilingual Support:** Supports 7 Indian languages and English (`ml-IN`, `hi-IN`, `ta-IN`, `te-IN`, `kn-IN`, `mr-IN`, `bn-IN`, `en-IN`).
- **Voice Installation Intent:** If an Indian language voice data package is missing on the device, `NativeTtsService.openTtsSettings()` launches the Android system settings via `expo-intent-launcher` (`com.android.settings.TTS_SETTINGS` / `android.speech.tts.engine.INSTALL_TTS_DATA`).

---

## 5. Audio Arbitration & Half-Duplex Safety

- **Manager:** `AudioArbitratorService` ([src/services/speech/audioArbitratorService.ts](file:///home/anuroop-tm/ai-caller-app/src/services/speech/audioArbitratorService.ts))
- **Half-Duplex Hardware Constraint:** On mobile devices, simultaneous microphone recording and speaker playback causes acoustic feedback loops and audio focus contention.
- **Arbitration Rules:**
  1. The microphone cannot record while TTS is speaking.
  2. TTS playback cannot begin while the microphone is recording.
  3. Every recording session acquires a unique cryptographic session token. If the call ends or TTS starts while recording is in flight, the token is invalidated, and late audio buffers are discarded safely.

---

## 6. Verification Boundaries: Node vs. Device

| Component                                    | Verified in Node Test Runner | Requires Physical / Emulator Android Build |
| -------------------------------------------- | ---------------------------- | ------------------------------------------ |
| Model registry, descriptors & paths          | ✅ Tested                    | N/A                                        |
| Download state, speed tracker & mutex        | ✅ Tested                    | N/A                                        |
| Readiness state machine & missing files      | ✅ Tested                    | N/A                                        |
| Prompt ChatML formatting & sanitization      | ✅ Tested                    | N/A                                        |
| Audio arbitration session tokens & lifecycle | ✅ Tested                    | N/A                                        |
| Deterministic dialogue engine fallback       | ✅ Tested                    | N/A                                        |
| Sherpa-ONNX C++ Conformer STT inference      | ❌ Native JSI                | ✅ Required (`npx expo run:android`)       |
| llama.rn GGUF ARM NEON model execution       | ❌ Native JSI                | ✅ Required (`npx expo run:android`)       |
| Android OS System TTS audio output           | ❌ Platform API              | ✅ Required (`npx expo run:android`)       |
