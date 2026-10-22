# AGENTS.md

## Purpose

This file is the mandatory entry point for AI coding agents working on the AI Caller application.

The project maintains its engineering documentation in the `engineering/` directory (mirrored to `docs/engineering/`). Before reviewing, refactoring, implementing features, fixing bugs, or changing architecture, consult the relevant documentation and follow its conventions.

---

## 1. Mandatory Documentation Review

Before making code changes:

1. Read **[engineering/README.md](engineering/README.md)** to understand the available documentation.
2. Read **[engineering/ARCHITECTURE.md](engineering/ARCHITECTURE.md)** to understand module boundaries, dependency direction, and separation of responsibilities.
3. Read **[engineering/CODING_STANDARDS.md](engineering/CODING_STANDARDS.md)** to follow established coding conventions.
4. Read **[engineering/TESTING.md](engineering/TESTING.md)** to understand required validation.
5. Read the relevant module documentation (**[engineering/MODELS_MODULE.md](engineering/MODELS_MODULE.md)**) before changing that module.
6. Read **[engineering/NATIVE_INTEGRATIONS.md](engineering/NATIVE_INTEGRATIONS.md)** before changing native modules, audio processing, STT, TTS, LLM runtimes, or Android-specific behavior.
7. Read **[engineering/DECISIONS.md](engineering/DECISIONS.md)** before changing an established architectural decision.

If a referenced file does not exist, identify that fact and continue using the applicable available documentation. Do not invent undocumented rules.

---

## 2. Source Code Is the Implementation Authority

Documentation describes intended architecture; source code represents the current implementation.

Before making changes:

- Inspect the actual implementation and its dependencies.
- Compare the implementation with the engineering documentation.
- Identify discrepancies between the documentation and the source.
- Do not assume that a documented feature, file, API, or abstraction exists without verifying it.
- Report material discrepancies before making risky architectural changes.
- Update documentation when an approved change alters architecture, module responsibilities, or established conventions.

Do not blindly follow outdated documentation or silently introduce architectural changes.

---

## 3. Architecture and Separation of Concerns

Maintain clear boundaries between:

- UI components and presentation.
- Screens and route orchestration.
- Hooks and UI-facing state coordination.
- Business logic and domain operations.
- Services and external or native integrations.
- Model metadata, configuration, and application state.
- Native runtime lifecycle and resource management.

Specific rules:

- Keep route and screen files focused on composition and navigation.
- Keep reusable UI components presentational whenever practical.
- Do not place substantial business logic, filesystem operations, model downloads, inference, benchmarking, or native runtime management inside UI components.
- Put logic in the appropriate existing service, hook, or domain module.
- Reuse established services and canonical metadata (`src/constants/models/`) instead of creating duplicate implementations.
- Follow the project's existing state-management conventions.
- Avoid unnecessary abstractions, wrappers, indirection, and one-use files that do not improve separation or maintainability.
- Preserve clear dependency direction and avoid circular dependencies.
- Do not refactor unrelated modules without a demonstrated need.

Follow the detailed architecture rules in **[engineering/ARCHITECTURE.md](engineering/ARCHITECTURE.md)**.

---

## 4. Diagnostics & Benchmark Architecture Rules

When working on the Diagnostics module (`src/app/diagnostics.tsx`, `src/components/diagnostics/`):

1. **Screen & Content Composition:** Route files (`src/app/diagnostics.tsx`) and container components (`DiagnosticsContent`, `DiagnosticsLlmContent`, `DiagnosticsSttContent`, `DiagnosticsTtsContent`) must only handle layout composition, tab switching, and hook wiring.
2. **Strict Layer Separation:** Presentation cards (`LlmBenchmarkCard`, `SampleCard`, `TtsBenchmarkCard`) must remain purely presentational. All state, validation, and actions belong in dedicated hooks (`useLlmDiagnostics`, `useDiagnostics`, `useTtsBenchmark`) and benchmark services.
3. **Canonical Model Sourcing:** Sourcing models for STT, TTS, or LLM benchmarks must strictly use canonical catalogs (`src/constants/models/`). Do not hardcode model lists or bypass `ModelReadinessService`.
4. **Decoupled Benchmark Orchestration:** All LLM inference and timing logic must reside in `LlmBenchmarkService` (and `AudioBenchmarkService` for STT). Never instantiate native runtime classes (`new LlamaCppNativeRuntime()`, `createSTT()`) directly within UI components or hooks.
5. **Direct Listing of LLM Testing Cards:** Directly render common LLM testing cards (`LlmBenchmarkCard`) for each canonical model (`AVAILABLE_LLM_MODELS`) without segmented model-picker buttons or active/selected model state indirection. Each card features prompt selection (Malayalam presets, English preset, custom prompt), real runtime metrics (TTFT, tok/s, latency), and download/call-engine integration.
6. **Live-Call Fallback Boundary (Deterministic Engine):** The deterministic rule-based dialogue engine (`callerDialogueEngine.ts`) is strictly the offline fallback engine for `callerStore` and `localLlmResponseGenerator`. It must never be presented as an LLM model candidate in the LLM benchmark UI or diagnostics selection.
7. **Visual Consistency:** Match existing application theming (`bg-card`, `border-border`, neutral/blue header icons, emerald status panels, NativeWind utilities) across all tabs and cards. Avoid bespoke per-tab color schemes.

---

## 5. Preserve Existing Behavior

Refactoring must preserve existing user-visible behavior unless the task explicitly requests a behavior change.

Before changing code, identify relevant:

- UI states and interactions.
- Loading, empty, error, and success states.
- Persistence and settings behavior.
- Model readiness and availability checks.
- Download, deletion, and cleanup flows.
- Runtime initialization and disposal.
- Fallback behavior.
- Native module assumptions.
- Navigation and cross-module dependencies.

Do not remove functionality merely because it appears redundant without verifying all its callers and dependencies.

Do not replace real implementations with mocks, placeholders, fabricated metrics, or silent fallbacks.

---

## 6. Native Integration Safety

Treat STT, TTS, LLM, filesystem access, audio recording and playback, and Android native modules as lifecycle-sensitive integrations.

Before changing them:

- Inspect the installed package APIs and actual native implementation where necessary.
- Verify model paths, asset packaging, native module availability, and platform constraints.
- Handle initialization failures and resource cleanup explicitly.
- Prevent duplicate initialization, conflicting runtime instances, and use-after-disposal errors.
- Verify that deleting a model cannot leave an active runtime using deleted files.
- Preserve offline operation unless the task explicitly changes that requirement.
- Do not assume an Expo Go environment supports custom native modules.
- Avoid adding native dependencies without a clear requirement and compatibility review.

Follow **[engineering/NATIVE_INTEGRATIONS.md](engineering/NATIVE_INTEGRATIONS.md)** and the applicable module documentation.

---

## 7. Refactoring Workflow

For substantial refactoring, use this workflow:

1. **Inspect:** Read relevant documentation and trace the existing implementation, dependencies, callers, and tests.
2. **Audit:** Identify concrete problems and distinguish confirmed issues from potential risks.
3. **Plan:** Describe the proposed changes, target responsibilities, affected files, risks, and validation steps.
4. **Refactor:** Make focused, incremental changes that preserve behavior.
5. **Test:** Add or update tests for the changed responsibilities and regression risks.
6. **Validate:** Run the relevant test, type-check, formatting, lint, and build commands.
7. **Review:** Inspect the final diff for regressions, duplicate logic, dead code, circular dependencies, and unnecessary abstractions.
8. **Document:** Update engineering documentation if the approved changes alter the documented architecture.

For large or cross-module changes, complete the audit and plan before proceeding with broad modifications.

---

## 8. Required Validation and Reporting

Use the scripts defined in `package.json` and the requirements in **[engineering/TESTING.md](engineering/TESTING.md)**.

- Run relevant automated tests (`npm test`).
- Run TypeScript checks (`npx tsc --noEmit`).
- Run formatting and lint checks (`npm run format:check`).
- Run an Android/native build (`npx expo run:android`) when the change affects native integration, build configuration, or bundled assets and the environment permits it.
- Verify important user flows on a device when automated checks cannot establish correctness.
- Report commands that were not run and explain why.
- Never claim a check passed unless its result was actually observed.
- Do not hide pre-existing failures; distinguish them from regressions introduced by the changes.

At completion, summarize the changes, architectural improvements, tests and checks performed, remaining risks, and documentation updates.

---

## 9. Scope Control

- Avoid unrelated cleanup during a focused task.
- Do not rewrite working modules solely to match a preferred architecture.
- Do not introduce a new state-management library, dependency-injection framework, service layer, or native library without a concrete justification.
- Preserve established project conventions unless there is a documented reason to change them.
- Prefer the smallest maintainable change that fully addresses the problem.

---

## 10. Documentation Maintenance

The `engineering/` directory is the shared engineering reference for future development.

When changing an architectural decision:

1. Identify the affected documentation.
2. Update it to reflect the verified implementation and approved design.
3. Keep **[engineering/README.md](engineering/README.md)** and its links accurate.
4. Add significant long-term decisions to **[engineering/DECISIONS.md](engineering/DECISIONS.md)**.
5. Avoid duplicating the same detailed explanation across multiple documents; link to the canonical explanation instead.

---

## 11. Final Principle

**Understand first, plan before broad changes, refactor by responsibility, preserve behavior, validate claims, and keep the documentation aligned with the code.**

These rules apply to all AI-assisted development in this repository.

---

## 12. Expo & React Native SDK Guidelines

### Expo has changed — do not trust outdated training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json` (currently **SDK 57**).
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v57.0.0/`
3. For anything else, fetch `https://docs.expo.dev/llms.txt` — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

### Standard Commands

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
npm test                    # run unit and regression test suite
npm run format:check        # check Prettier formatting
```

### Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

### Native Constraints

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
