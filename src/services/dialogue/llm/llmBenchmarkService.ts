import type { UnifiedModelPackage } from '@/constants/models';
import { defaultDialogueEngine } from '@/services/dialogue/callerDialogueEngine';
import { LocalLlmResponseGenerator } from '@/services/dialogue/llm/localLlmResponseGenerator';
import {
  checkNativeLlmAvailability,
  LlamaCppNativeRuntime,
  MockLlmRuntime,
} from '@/services/dialogue/llm/modelRuntime';
import { ModelFileService } from '@/services/models/modelFileService';
import { callerStore } from '@/stores/callerStore';
import type { ILlmRuntime, LlmBenchmarkResult, LlmModelMetadata } from '@/types/llm';

export interface LlmBenchmarkExecutionOptions {
  model: UnifiedModelPackage;
  metadata: LlmModelMetadata;
  isRealNative: boolean;
  prompt: string;
}

/**
 * Builds standard ChatML formatted prompt for on-device conversational turn.
 */
export function buildChatMlPrompt(userText: string): string {
  return `<|im_start|>system\nനീ ഒരു മലയാളം AI കോൾ അസിസ്റ്റന്റാണ്. 1-2 വാചകത്തിൽ മാത്രം മറുപടി നൽകുക.\n<|im_end|>\n<|im_start|>user\n${userText.trim()}\n<|im_end|>\n<|im_start|>assistant\n`;
}

/**
 * Service encapsulating LLM runtime benchmarking, prompt execution,
 * and engine switching for diagnostics and test workflows.
 */
export class LlmBenchmarkService {
  /**
   * Evaluates the deterministic offline engine for latency and reply baseline.
   */
  static async runDeterministicBenchmark(promptText: string): Promise<LlmBenchmarkResult> {
    const startTime = Date.now();
    const res = await defaultDialogueEngine.generateResponse({
      userUtterance: promptText,
      history: [],
      scenario: 'appointment_scheduler',
      callId: 'bench_det',
    });
    const latencyMs = Math.max(1, Date.now() - startTime);

    return {
      modelId: 'deterministic-offline-v1',
      modelName: 'Deterministic Dialogue Engine',
      runtimeType: 'mock',
      prompt: promptText,
      response: res.replyText,
      loadTimeMs: 0,
      timeToFirstTokenMs: latencyMs,
      generationTimeMs: latencyMs,
      totalTurnaroundMs: latencyMs,
      tokensPerSecond: 1000,
      completionTokens: Math.max(1, Math.round(res.replyText.length / 3)),
      timestamp: Date.now(),
    };
  }

  /**
   * Executes a sequential benchmark for a selected LLM model:
   * 1. Initializes runtime (native or mock).
   * 2. Measures cold-load duration.
   * 3. Formats prompt and executes inference to measure TTFT and generation rate.
   * 4. Destroys benchmark runtime to restore device memory.
   */
  static async runLlmBenchmark(options: LlmBenchmarkExecutionOptions): Promise<LlmBenchmarkResult> {
    const { model, metadata, isRealNative, prompt } = options;
    let runtime: ILlmRuntime | null = null;

    try {
      const loadStart = Date.now();
      if (isRealNative) {
        runtime = new LlamaCppNativeRuntime();
        const primaryFile = model.files[0];
        const localPath = ModelFileService.getFilePath(
          model,
          primaryFile?.relativePath ?? `${model.id}.gguf`
        );
        await runtime.loadModel(metadata, localPath);
      } else {
        runtime = new MockLlmRuntime();
        await runtime.loadModel(metadata);
      }
      const loadTimeMs = Date.now() - loadStart;

      const formattedPrompt = buildChatMlPrompt(prompt);
      const genStart = Date.now();
      const result = await runtime.generate(formattedPrompt, {
        maxTokens: 40,
        temperature: 0.6,
      });
      const totalGenMs = Math.max(1, Date.now() - genStart);

      return {
        modelId: model.id,
        modelName: model.name,
        runtimeType: runtime.runtimeType,
        prompt,
        response: result.text,
        loadTimeMs,
        timeToFirstTokenMs: result.metrics.timeToFirstTokenMs,
        generationTimeMs: result.metrics.totalGenerationTimeMs,
        totalTurnaroundMs: loadTimeMs + totalGenMs,
        tokensPerSecond: result.metrics.tokensPerSecond,
        completionTokens: result.metrics.completionTokens,
        timestamp: Date.now(),
      };
    } finally {
      if (runtime) {
        try {
          await runtime.destroy();
        } catch (e) {
          console.warn('[LlmBenchmarkService] Error destroying benchmark runtime:', e);
        }
      }
    }
  }

  /**
   * Switches the active caller engine in callerStore to the specified LLM.
   */
  static async activateCallerLlmEngine(
    model: UnifiedModelPackage,
    metadata: LlmModelMetadata,
    isRealNative: boolean
  ): Promise<void> {
    let runtime: ILlmRuntime;
    if (isRealNative) {
      runtime = new LlamaCppNativeRuntime();
      const primaryFile = model.files[0];
      const localPath = ModelFileService.getFilePath(
        model,
        primaryFile?.relativePath ?? `${model.id}.gguf`
      );
      await runtime.loadModel(metadata, localPath);
    } else {
      runtime = new MockLlmRuntime();
      await runtime.loadModel(metadata);
    }

    const generator = new LocalLlmResponseGenerator({
      runtime,
      fallbackGenerator: defaultDialogueEngine,
      timeoutMs: 3500,
    });

    callerStore.setResponseGenerator(generator);
  }

  /**
   * Resets active caller engine in callerStore back to the deterministic engine.
   */
  static activateCallerDeterministicEngine(): void {
    callerStore.setResponseGenerator(defaultDialogueEngine);
  }

  /**
   * Returns ID of current active engine in callerStore.
   */
  static getActiveCallerEngineId(): string {
    return callerStore.getResponseGenerator().id;
  }

  /**
   * Returns ID of the active model if LocalLlmResponseGenerator is the active engine.
   */
  static getActiveCallerModelId(): string | null {
    const generator = callerStore.getResponseGenerator();
    if (generator instanceof LocalLlmResponseGenerator) {
      return generator.getRuntime().getActiveModel()?.id ?? null;
    }
    return null;
  }
}
