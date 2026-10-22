# Coding Standards & Architecture Invariants

This document establishes enforceable engineering patterns and conventions for **AI Caller**.

---

## 1. Separation of Concerns & Prohibited Anti-Patterns

### ✅ Correct Pattern

```
UI Component (JSX) ──> Custom Hook ──> Domain Service ──> Infrastructure Adapter ──> Native Bridge
```

### ❌ Anti-Patterns (Strictly Prohibited)

1. **No Direct Filesystem Access in UI:**
   Components must never call `expo-file-system` directly. All path queries and file inspections belong in `ModelFileService` or `ModelReadinessService`.
2. **No Native Runtime Instantiation in JSX:**
   Never write `new LlamaCppNativeRuntime()` or call `createSTT()` inside a component or render cycle. Use dedicated services (`LlmBenchmarkService`, `SpeechRecognitionService`).
3. **No Duplicate Model Registries:**
   All models must be registered in [src/constants/models/](file:///home/anuroop-tm/ai-caller-app/src/constants/models). Do not create ad-hoc model catalogs in feature folders.
4. **No Multiple Competing Download Managers:**
   All background file downloading must proceed through `modelDownloadService` in `src/services/models/` to respect the single-download lock and free storage buffers.
5. **No Monolithic "God" Hooks:**
   Do not bundle download progress, model deletion, benchmark timers, and audio arbitration into one giant hook. Keep hooks focused (e.g. `useModelReadiness`, `useModelDownload`, `useLlmDiagnostics`).

---

## 2. TypeScript & Type Safety

- **No Unjustified `any`:** Avoid `any` types. When interfacing with untyped native TurboModules, wrap calls with explicit TypeScript interfaces (e.g. `ILlmRuntime`, `SttEngine`).
- **Immutable Model Descriptors:** Model descriptors in `src/constants/models/` must use `readonly` properties and `as const` assertions to prevent accidental runtime mutation.
- **Single Source of Truth for Types:**
  - Model packages: [src/constants/models/types.ts](file:///home/anuroop-tm/ai-caller-app/src/constants/models/types.ts)
  - LLM interfaces: [src/types/llm.ts](file:///home/anuroop-tm/ai-caller-app/src/types/llm.ts)
  - Speech & STT types: [src/types/speech.ts](file:///home/anuroop-tm/ai-caller-app/src/types/speech.ts)
  - TTS settings: [src/types/ttsSettings.ts](file:///home/anuroop-tm/ai-caller-app/src/types/ttsSettings.ts)

---

## 3. Asynchronous Safety & Concurrency Guards

1. **Synchronous Execution Guards:**
   When triggering asynchronous operations from user interactions (e.g. starting a benchmark or download), always use a synchronous `useRef` guard to prevent double-clicks before React re-renders:
   ```ts
   const isRunningRef = useRef(false);
   const handleRun = async () => {
     if (isRunningRef.current) return;
     isRunningRef.current = true;
     try {
       await execute();
     } finally {
       isRunningRef.current = false;
     }
   };
   ```
2. **Preventing Stale State Overwrites:**
   Asynchronous hooks that fetch data on parameter changes (such as `useModelReadiness`) must track active request IDs or use a mounted ref to prevent outdated network/FS responses from overwriting newer state:
   ```ts
   const activeRequestIdRef = useRef(0);
   const check = async () => {
     const requestId = ++activeRequestIdRef.current;
     const result = await fetch();
     if (isMountedRef.current && requestId === activeRequestIdRef.current) {
       setState(result);
     }
   };
   ```
3. **Synchronous State Reset on Key Change:**
   When switching models, reset readiness state immediately during the render pass to prevent 1-frame stale flashes.

---

## 4. Deletion & Resource Disposal Requirements

Any operation that deletes an on-disk model package **must**:

1. Check whether that model is currently in memory.
2. Call `.destroy()` or `.stop()` on the active native engine.
3. Remove physical files via `FsAdapter.deleteAsync()`.
4. Notify readiness listeners via `ModelReadinessService.notifyModelChanged(modelId)`.

---

## 5. Pre-Commit / Pre-PR Verification

Before considering any refactoring or feature complete, you must run:

1. `npm test` — Ensure all unit tests pass with 0 failures.
2. `npx tsc --noEmit` — Ensure 0 TypeScript errors.
3. `npm run format:check` — Ensure Prettier formatting is 100% compliant.
