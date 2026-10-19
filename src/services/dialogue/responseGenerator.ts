import type { DialogueEngineInput, DialogueEngineOutput } from '@/types/conversation';

export type { DialogueEngineInput, DialogueEngineOutput };

/**
 * Replaceable Response Generator Interface.
 * Allows switching between deterministic offline rules and future on-device/remote LLMs (e.g. Qwen).
 */
export interface IResponseGenerator {
  readonly id: string;
  readonly name: string;
  generateResponse(input: DialogueEngineInput): Promise<DialogueEngineOutput>;
}
