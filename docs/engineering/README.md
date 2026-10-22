# AI Caller — Engineering Documentation

Welcome to the engineering documentation for **AI Caller**, a high-performance offline-first Expo React Native Android application for on-device voice processing, speech recognition (STT), speech synthesis (TTS), and local LLM conversational dialogue in Malayalam and Indian languages.

---

## 1. Documentation Index

| Document                                           | Purpose                                                    | Key Topics                                                                                       |
| -------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| [ARCHITECTURE.md](./ARCHITECTURE.md)               | High-level system architecture and data flow               | Directory structure, layer boundaries, dependency flow, state ownership, error conventions.      |
| [MODELS_MODULE.md](./MODELS_MODULE.md)             | Deep dive into the Models and Asset management module      | Model catalog, readiness checks, download pipeline, deletion lifecycle, Diagnostics integration. |
| [NATIVE_INTEGRATIONS.md](./NATIVE_INTEGRATIONS.md) | Native bridges and Android runtime constraints             | `react-native-sherpa-onnx`, `llama.rn`, `expo-speech`, audio arbitration, New Architecture.      |
| [CODING_STANDARDS.md](./CODING_STANDARDS.md)       | Enforceable engineering patterns and rules                 | Separation of concerns, TypeScript strictness, anti-patterns to avoid, refactoring rules.        |
| [TESTING.md](./TESTING.md)                         | Test suites, validation scripts, and verification commands | Node test runner, TypeScript checks, formatting, Android build verification, device testing.     |
| [DECISIONS.md](./DECISIONS.md)                     | Architecture Decision Records (ADRs)                       | Confirmed architectural choices, constraints, trade-offs, and superseded approaches.             |

---

## 2. Which Document to Consult

- **Adding or modifying a model?** Read [MODELS_MODULE.md](./MODELS_MODULE.md) and [CODING_STANDARDS.md](./CODING_STANDARDS.md).
- **Working on Diagnostics (STT, TTS, LLM benchmarks)?** Read [MODELS_MODULE.md](./MODELS_MODULE.md) (Section 6), [ARCHITECTURE.md](./ARCHITECTURE.md), and [CODING_STANDARDS.md](./CODING_STANDARDS.md).
- **Touching native modules or Gradle?** Read [NATIVE_INTEGRATIONS.md](./NATIVE_INTEGRATIONS.md).
- **Refactoring or decoupling components?** Read [ARCHITECTURE.md](./ARCHITECTURE.md) and [CODING_STANDARDS.md](./CODING_STANDARDS.md).
- **Running or expanding test suites?** Read [TESTING.md](./TESTING.md).
- **Reviewing architectural history and trade-offs?** Read [DECISIONS.md](./DECISIONS.md).

---

## 3. Maintenance Rules

1. **Source Code Precedence:** The active source code is the ultimate ground truth. When documentation and active code diverge, investigate whether the discrepancy is an intentional change or an architectural regression.
2. **Update on Change:** Whenever public interfaces, lifecycle contracts, model descriptors, or architectural layers change, update the matching document in this directory.
3. **No Phantom Code:** Never document hypothetical, unmerged, or simulated implementations as existing functionality. Always link to real source paths and symbols.
