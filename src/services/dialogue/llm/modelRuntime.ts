import type {
  ILlmRuntime,
  LlmGenerationResult,
  LlmInferenceOptions,
  LlmModelMetadata,
  LlmRuntimeStatusInfo,
  LlmRuntimeType,
} from '@/types/llm';

/**
 * Checks whether native llama.rn bindings are present and callable in the current runtime environment.
 */
export function checkNativeLlmAvailability(): {
  available: boolean;
  runtimeType: 'native_llama_rn' | 'unlinked';
  reason?: string;
} {
  try {
    // In Node.js environment, native JSI bridges are not loaded
    if (typeof process !== 'undefined' && process.versions?.node) {
      return {
        available: false,
        runtimeType: 'unlinked',
        reason: 'Running in Node.js test environment (Native JSI bindings unavailable)',
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const llamaRn = require('llama.rn');
    if (typeof llamaRn?.initLlama === 'function') {
      return {
        available: true,
        runtimeType: 'native_llama_rn',
      };
    }

    return {
      available: false,
      runtimeType: 'unlinked',
      reason: 'llama.rn loaded but initLlama JSI binding is missing in binary',
    };
  } catch (err) {
    return {
      available: false,
      runtimeType: 'unlinked',
      reason: `llama.rn native module not linked: ${String(err)}`,
    };
  }
}

/**
 * Native llama.rn / llama.cpp bridge runtime implementation.
 * Safely guards native module loading to avoid crashes when running outside native builds.
 */
export class LlamaCppNativeRuntime implements ILlmRuntime {
  readonly runtimeType: LlmRuntimeType = 'native_llama_rn';

  private activeModel: LlmModelMetadata | null = null;
  private isLoaded = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private nativeContext: any = null;

  isInitialized(): boolean {
    return this.isLoaded && this.nativeContext !== null;
  }

  getActiveModel(): LlmModelMetadata | null {
    return this.activeModel;
  }

  async loadModel(model: LlmModelMetadata, modelFilePath?: string): Promise<void> {
    // If another model or the same model is already loaded, release it first to avoid OOM
    if (this.isLoaded) {
      await this.destroy();
    }

    try {
      // Dynamic import to avoid static resolution failure in environments without llama.rn
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const llamaRn = require('llama.rn');
      if (typeof llamaRn?.initLlama === 'function') {
        const rawPath = modelFilePath || model.filename;
        const resolvedPath = rawPath.startsWith('file://')
          ? rawPath.replace('file://', '')
          : rawPath;

        this.nativeContext = await llamaRn.initLlama({
          model: resolvedPath,
          use_mlock: true,
          n_ctx: model.contextLength,
          n_threads: model.recommendedThreads,
          n_gpu_layers: 0, // CPU NEON baseline for uniform thermal stability
        });
        this.activeModel = model;
        this.isLoaded = true;
        return;
      }
    } catch (err) {
      throw new Error(
        `Failed to initialize llama.rn native context for model "${model.name}": ${String(err)}`
      );
    }

    throw new Error(
      `llama.rn native module not linked in runtime. Model "${model.name}" requires GGUF native bridge.`
    );
  }

  async generate(prompt: string, options?: LlmInferenceOptions): Promise<LlmGenerationResult> {
    if (!this.isInitialized()) {
      throw new Error('LLM runtime is not initialized. Call loadModel() first.');
    }

    const startTime = Date.now();
    let ttft = 0;
    let tokenCount = 0;

    const stopTokens = options?.stopTokens ?? ['<|im_end|>', '<|endoftext|>'];
    const maxTokens = options?.maxTokens ?? 64;
    const temperature = options?.temperature ?? 0.7;

    const result = await this.nativeContext.completion(
      {
        prompt,
        n_predict: maxTokens,
        temperature,
        stop: stopTokens,
      },
      (_data: { token?: string }) => {
        tokenCount++;
        if (tokenCount === 1) {
          ttft = Date.now() - startTime;
        }
      }
    );

    const totalTimeMs = Math.max(1, Date.now() - startTime);
    const tokensPerSecond = tokenCount > 0 ? tokenCount / (totalTimeMs / 1000) : 0;

    return {
      text: result.text ?? '',
      metrics: {
        timeToFirstTokenMs: ttft || totalTimeMs,
        totalGenerationTimeMs: totalTimeMs,
        promptTokens: Math.round(prompt.length / 4),
        completionTokens: tokenCount,
        tokensPerSecond: Math.round(tokensPerSecond * 10) / 10,
      },
    };
  }

  async stopGeneration(): Promise<void> {
    if (this.nativeContext && typeof this.nativeContext.stopCompletion === 'function') {
      try {
        await this.nativeContext.stopCompletion();
      } catch (err) {
        console.warn('[LlamaCppNativeRuntime] stopCompletion error:', err);
      }
    }
  }

  async destroy(): Promise<void> {
    if (this.nativeContext) {
      try {
        if (typeof this.nativeContext.release === 'function') {
          await this.nativeContext.release();
        }
      } catch (err) {
        console.warn('[LlamaCppNativeRuntime] release error:', err);
      }
      this.nativeContext = null;
    }
    this.isLoaded = false;
    this.activeModel = null;
  }
}

/**
 * Mock LLM runtime for unit testing, offline benchmarking, and latency measurement without native C++ libraries.
 */
export class MockLlmRuntime implements ILlmRuntime {
  readonly runtimeType: LlmRuntimeType = 'mock';

  private isLoaded = false;
  private activeModel: LlmModelMetadata | null = null;
  private responseGenerator: (prompt: string) => string;

  constructor(customResponder?: (prompt: string) => string) {
    this.responseGenerator =
      customResponder ??
      ((prompt: string) => {
        if (prompt.includes('അപ്പോയിന്റ്മെന്റ്') || prompt.includes('doctor')) {
          return 'തീർച്ചയായും, നിങ്ങളുടെ അപ്പോയിന്റ്മെന്റ് ഞങ്ങൾ കൃത്യമായി രേഖപ്പെടുത്തിയിട്ടുണ്ട്.';
        }
        if (prompt.includes('സന്ദേശം') || prompt.includes('മീറ്റിംഗ്')) {
          return 'ശരി, നിങ്ങളുടെ സന്ദേശം അദ്ദേഹത്തിന് കൈമാറാം. ഉടൻ ബന്ധപ്പെടും.';
        }
        return 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ സംഭാഷണം ശ്രദ്ധിക്കുന്നുണ്ട്. എനിക്ക് എങ്ങനെ സഹായിക്കാനാകും?';
      });
  }

  isInitialized(): boolean {
    return this.isLoaded;
  }

  getActiveModel(): LlmModelMetadata | null {
    return this.activeModel;
  }

  async loadModel(model: LlmModelMetadata): Promise<void> {
    this.activeModel = model;
    this.isLoaded = true;
  }

  async generate(prompt: string, _options?: LlmInferenceOptions): Promise<LlmGenerationResult> {
    const startTime = Date.now();
    const text = this.responseGenerator(prompt);
    const completionTokens = Math.max(1, Math.round(text.length / 3));

    return {
      text,
      metrics: {
        timeToFirstTokenMs: 25,
        totalGenerationTimeMs: Math.max(1, Date.now() - startTime + 40),
        promptTokens: Math.round(prompt.length / 4),
        completionTokens,
        tokensPerSecond: 32.5,
      },
    };
  }

  async stopGeneration(): Promise<void> {
    return Promise.resolve();
  }

  async destroy(): Promise<void> {
    this.isLoaded = false;
    this.activeModel = null;
  }
}

export function getRuntimeStatusInfo(runtime: ILlmRuntime): LlmRuntimeStatusInfo {
  const nativeCheck = checkNativeLlmAvailability();
  return {
    runtimeType: runtime.runtimeType,
    isRealNativeAvailable: nativeCheck.available,
    activeModelId: runtime.getActiveModel()?.id ?? null,
    isModelLoaded: runtime.isInitialized(),
    nativeBridgeDetails: nativeCheck.reason,
  };
}
