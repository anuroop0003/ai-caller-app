/**
 * Core domain types for AI Caller dialogue, turn management, and call lifecycle.
 */

export type CallLifecycleState = 'idle' | 'ringing' | 'connected' | 'ended';

export type CallTurnState =
  'idle' | 'listening' | 'transcribing' | 'thinking' | 'speaking' | 'error';

export type CallerScenario =
  'general_assistant' | 'appointment_scheduler' | 'call_screener' | 'otp_security';

export type CallerIntentType =
  | 'greeting'
  | 'repeat_request'
  | 'appointment_confirm'
  | 'appointment_reschedule'
  | 'call_screening_busy'
  | 'call_screening_message'
  | 'otp_received'
  | 'otp_repeat'
  | 'affirmative'
  | 'negative'
  | 'call_closing'
  | 'clarification'
  | 'unknown';

export interface ConversationTurn {
  readonly id: string;
  readonly callId: string;
  readonly speaker: 'user' | 'assistant';
  readonly text: string;
  readonly timestamp: number;
  readonly intent?: CallerIntentType;
  readonly latencyMs?: number;
}

export interface CallerScenarioConfig {
  readonly id: CallerScenario;
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly initialGreeting: string;
  readonly supportedIntents: readonly CallerIntentType[];
}

export interface DialogueEngineInput {
  readonly userUtterance: string;
  readonly history: readonly ConversationTurn[];
  readonly scenario: CallerScenario;
  readonly callId: string;
}

export interface DialogueEngineOutput {
  readonly replyText: string;
  readonly intent: CallerIntentType;
  readonly confidence: number;
  readonly shouldEndCall?: boolean;
  readonly source?: 'llm' | 'deterministic_fallback' | 'deterministic';
  readonly latencyMs?: number;
}
