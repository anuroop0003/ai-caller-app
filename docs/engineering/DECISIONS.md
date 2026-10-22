# Architectural Decision Records (ADRs)

This document records the confirmed architectural decisions, design rationale, and trade-offs for **AI Caller**.

---

## ADR 1: Completely Offline-First Voice & Dialogue Pipeline

- **Status:** Confirmed
- **Context:** Phone call assistance in low-connectivity or high-latency mobile environments requires immediate, deterministic responsiveness without relying on cloud APIs.
- **Decision:** All core components (STT, Dialogue generation, and TTS) run on-device. No external cloud servers or remote API keys are required for real-time call handling.
- **Consequences:**
  - Zero network egress latency during live phone calls.
  - Device storage and RAM must be managed carefully (requiring quantized INT8 ONNX models and 4-bit GGUF weights).

---

## ADR 2: Android Native System TTS instead of Neural Piper Models

- **Status:** Confirmed
- **Context:** Bundling or downloading neural VITS/Piper models for every Indian language requires several hundred megabytes per voice, increases cold-start synthesis latency, and demands high CPU usage on low-end devices.
- **Decision:** Utilize the native Android OS Speech Synthesis engine (`expo-speech`) backed by Google Speech Services or OEM TTS.
- **Consequences:**
  - 0 MB download footprint for speech synthesis.
  - Hardware-accelerated playback with minimal battery drain.
  - Multi-language support (Malayalam, Hindi, Tamil, Telugu, Kannada, Marathi, Bengali, English).
  - Users lacking voice data for an Indian language are guided to install it via system settings (`expo-intent-launcher`).

---

## ADR 3: Canonical Model Catalog in `src/constants/models/`

- **Status:** Confirmed
- **Context:** Early implementations maintained parallel model constant files (`src/constants/llmModels.ts`, `src/constants/speechModels.ts`, `src/constants/ttsModels.ts`), leading to fragmented types and conflicting imports.
- **Decision:** Establish `src/constants/models/` as the single canonical source of truth for model descriptors (`UnifiedModelPackage`).
- **Consequences:**
  - Single catalog for all model metadata, target directories, filenames, and byte sizes.
  - Legacy constant paths remain as pure re-export adapters, guaranteeing backward compatibility.

---

## ADR 4: Dual Dialogue Strategy (Deterministic Engine + Local LLM Fallback)

- **Status:** Confirmed
- **Context:** On-device LLM inference can experience varying latency depending on mobile CPU throttling, background load, or thermal state. A phone call cannot tolerate multi-second dead silence.
- **Decision:** Implement a dual-engine strategy:
  1. Primary: Local LLM (`llama.rn` running Qwen 2.5 0.5B / 1.5B GGUF) for natural conversational variety.
  2. Fallback: Fast deterministic rule-based dialogue engine (`callerDialogueEngine.ts`, <5 ms latency).
  3. Strict Timeout: A 3,500 ms inference timeout is enforced. If the LLM does not return a token within the window, background inference is actively halted (`stopCompletion()`) and the deterministic response is returned immediately.
- **Consequences:** The user always receives a coherent response within acceptable conversational latency.

---

## ADR 5: Half-Duplex Audio Arbitration with Session Tokens

- **Status:** Confirmed
- **Context:** Concurrent microphone capture and speaker output on Android can cause acoustic echo loops and audio focus errors.
- **Decision:** Implement `AudioArbitratorService` to enforce half-duplex operation:
  - Microphone capture is locked while TTS is speaking.
  - TTS playback is locked while the microphone is recording.
  - Every recording cycle is bound to a cryptographic session token. In-flight audio buffers are discarded if the token is revoked due to call termination or user interruption.
- **Consequences:** Safe audio hardware transitions without race conditions.

---

## ADR 6: Authoritative Model Readiness with Pub/Sub Event Broadcasts

- **Status:** Confirmed
- **Context:** Having screens, cards, and diagnostics independently inspect filesystem paths caused inconsistent UI states and race conditions during asset deletion or download completion.
- **Decision:** `ModelReadinessService` is the single source of truth for model readiness. Any deletion, download state transition, or cache invalidation broadcasts an event to subscribers, triggering instant UI updates.
- **Consequences:** UI cards, diagnostics screens, and background services remain perfectly synchronized.
