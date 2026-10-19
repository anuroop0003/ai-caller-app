import { defaultDialogueEngine, detectIntent } from '../callerDialogueEngine';
import type {
  DialogueEngineInput,
  DialogueEngineOutput,
  IResponseGenerator,
} from '../responseGenerator';
import { ConversationPromptFormatter } from './conversationPrompt';
import type { ILlmRuntime, LlmInferenceMetrics } from '@/types/llm';

export interface LocalLlmGeneratorOptions {
  runtime: ILlmRuntime;
  fallbackGenerator?: IResponseGenerator;
  timeoutMs?: number;
  onMetricsGenerated?: (metrics: LlmInferenceMetrics) => void;
}

/**
 * LocalLlmResponseGenerator wraps an on-device language model behind the standard
 * IResponseGenerator interface. Automatically falls back to the deterministic dialogue engine
 * if the model is uninitialized, inference times out, or generation fails.
 *
 * Implements active cancellation on timeout to ensure timed-out native LLM inference
 * does not continue spinning background CPU / memory resources.
 */
export class LocalLlmResponseGenerator implements IResponseGenerator {
  readonly id = 'local_llm_generator';
  readonly name = 'Local LLM Response Generator';

  private runtime: ILlmRuntime;
  private fallback: IResponseGenerator;
  private timeoutMs: number;
  private onMetrics?: (metrics: LlmInferenceMetrics) => void;

  constructor(options: LocalLlmGeneratorOptions) {
    this.runtime = options.runtime;
    this.fallback = options.fallbackGenerator ?? defaultDialogueEngine;
    this.timeoutMs = options.timeoutMs ?? 3500;
    this.onMetrics = options.onMetricsGenerated;
  }

  setRuntime(runtime: ILlmRuntime): void {
    this.runtime = runtime;
  }

  getRuntime(): ILlmRuntime {
    return this.runtime;
  }

  async generateResponse(input: DialogueEngineInput): Promise<DialogueEngineOutput> {
    const startTime = Date.now();

    // If runtime is not initialized, instantly delegate to deterministic engine
    if (!this.runtime.isInitialized()) {
      const fallbackResult = await this.fallback.generateResponse(input);
      return {
        ...fallbackResult,
        source: 'deterministic_fallback',
        latencyMs: Math.max(1, Date.now() - startTime),
      };
    }

    try {
      const prompt = ConversationPromptFormatter.formatQwenPrompt(
        input.scenario,
        input.history,
        input.userUtterance
      );

      // Timeout race to protect conversational voice turnaround
      const generationPromise = this.runtime.generate(prompt, {
        maxTokens: 40,
        temperature: 0.6,
        stopTokens: ['<|im_end|>', '<|endoftext|>'],
      });

      let timeoutTimer: ReturnType<typeof setTimeout> | null = null;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutTimer = setTimeout(
          () => reject(new Error(`LLM inference timed out after ${this.timeoutMs}ms`)),
          this.timeoutMs
        );
      });

      let result;
      try {
        result = await Promise.race([generationPromise, timeoutPromise]);
      } finally {
        if (timeoutTimer) {
          clearTimeout(timeoutTimer);
        }
      }

      if (this.onMetrics) {
        this.onMetrics(result.metrics);
      }

      const cleanReply = ConversationPromptFormatter.cleanGeneratedResponse(result.text);

      if (!cleanReply) {
        // Empty response from LLM -> fallback
        const fallbackResult = await this.fallback.generateResponse(input);
        return {
          ...fallbackResult,
          source: 'deterministic_fallback',
          latencyMs: Math.max(1, Date.now() - startTime),
        };
      }

      // Check intent to evaluate call closing or scenario actions
      const { intent, confidence } = detectIntent(cleanReply, input.scenario);
      const shouldEndCall = intent === 'call_closing';

      return {
        replyText: cleanReply,
        intent,
        confidence,
        shouldEndCall,
        source: 'llm',
        latencyMs: Math.max(1, Date.now() - startTime),
      };
    } catch (err) {
      console.warn(
        '[LocalLlmResponseGenerator] Inference failed or timed out, stopping background completion and falling back:',
        err
      );

      // Actively cancel background native completion so it does not continue consuming CPU/battery
      try {
        await this.runtime.stopGeneration();
      } catch (stopErr) {
        console.warn('[LocalLlmResponseGenerator] Failed to stop native completion:', stopErr);
      }

      const fallbackResult = await this.fallback.generateResponse(input);
      return {
        ...fallbackResult,
        source: 'deterministic_fallback',
        latencyMs: Math.max(1, Date.now() - startTime),
      };
    }
  }
}
