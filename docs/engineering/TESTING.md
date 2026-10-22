# Testing & Quality Assurance Guide

This document details the test suites, verification commands, and regression testing workflows for **AI Caller**.

---

## 1. Verification Scripts

All test and validation commands are defined in `package.json`:

```bash
# 1. Run all unit and regression tests (Node.js test runner via tsx)
npm test

# 2. Strict TypeScript type check (no code emitted)
npx tsc --noEmit

# 3. Check code formatting against Prettier
npm run format:check

# 4. Automatically format all files with Prettier
npm run format

# 5. Lint codebase with Expo linter
npm run lint
```

---

## 2. Test Architecture: Node.js Native Runner

The test suite uses Node.js native test runner (`node:test` and `node:assert/strict`) executed with `tsx` (`npx tsx --test src/**/*.test.ts`).

### Headless Isolation Strategy

Because Node.js does not load native Android C++ shared libraries (`react-native-sherpa-onnx.so`, `libllama.so`) or React Native Flow files:

- **Filesystem Headless Fallback:** `FsAdapter` ([src/services/models/internal/fsAdapter.ts](file:///home/anuroop-tm/ai-caller-app/src/services/models/internal/fsAdapter.ts)) safely provides memory/temporary directory fallbacks when `expo-file-system` is unavailable.
- **Lazy Native Requires:** Native modules (`expo-asset`, `llama.rn`, `react-native-sherpa-onnx`) are imported lazily inside methods so that service business logic can be tested in Node without crashes.
- **Mock Runtimes:** `MockLlmRuntime` implements `ILlmRuntime` with simulated latency and deterministic tokens for testing turn generation without loading GGUF weights.

---

## 3. Verified Regression Test Suites

The current suite contains **67 tests across 7 main test files**:

1. **Utterance Normalization:**
   - Stripping punctuation, trimming whitespace, and removing Zero-Width Non-Joiner (ZWNJ) / Zero-Width Joiner (ZWJ) characters from Malayalam script.
   - Normalizing mixed-case English and Manglish tokens.
2. **Intent Detection:**
   - Detecting appointment confirm vs. reschedule in clinic scenarios.
   - Detecting call screening, OTP repetition, call closing, and fallback clarification.
3. **Deterministic Response Generation:**
   - Testing polite responses, call termination flags, and turn transitions.
4. **CallerStore Lifecycle:**
   - New call resets, turn appending in order, and blocking late responses after call end.
5. **Local LLM Integration & Fallback:**
   - Prompt ChatML structure preservation.
   - Response sanitization (stripping residual `<|im_start|>` tags and markdown).
   - Instant fallback to deterministic engine on inference timeout (3,500 ms).
6. **Model Management (`modelManagement.test.ts`):**
   - ModelRegistry queries across STT, TTS, and LLM categories.
   - Path computation, storage directory isolation, and free disk storage checks.
   - Readiness status transitions (`not_downloaded`, `incomplete`, `ready`).
   - Download mutex subscription, cancellation, and speed tracker overflow clamping.
   - Coordinated model deletion: active STT unload, LLM runtime `.destroy()` execution, and pub/sub readiness invalidation.
7. **Diagnostics Prerequisite Guards:**
   - Verifying that `AudioBenchmarkService.runBenchmark()` rejects execution upfront when STT model files are missing on disk.
8. **Decoupled LLM Benchmark Service:**
   - ChatML prompt marker formatting.
   - Sequential benchmark execution with timing metrics and memory cleanup.
9. **Audio Arbitrator & Half-Duplex Safety:**
   - Session token acquisition, cancellation, and invalidation on call termination.
10. **TTS Configuration & Voice Management:**
    - Per-language voice selection, speed rate, pitch persistence, and system voice isolation.

---

## 4. Device Verification Checklist (Android)

Automated tests in Node verify business rules, path computation, and state transitions, but **device-level verification** via `npx expo run:android` is required for:

1. **Sherpa-ONNX STT:** Real-time audio recognition using live microphone input or bundled `.wav` test audio.
2. **llama.rn LLM:** In-memory execution of GGUF weights using ARM NEON SIMD kernels on physical mobile hardware.
3. **Android System TTS:** Voice audio output through device speakers and launching system voice download settings via `expo-intent-launcher`.
