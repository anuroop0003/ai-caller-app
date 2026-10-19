import { useSyncExternalStore } from 'react';

import { defaultDialogueEngine } from '@/services/dialogue/callerDialogueEngine';
import { CALLER_SCENARIOS, DEFAULT_CALLER_SCENARIO } from '@/services/dialogue/callerScenarios';
import type { IResponseGenerator } from '@/services/dialogue/responseGenerator';
import type {
  CallLifecycleState,
  CallTurnState,
  CallerScenario,
  ConversationTurn,
} from '@/types/conversation';

const MAX_HISTORY_TURNS = 30;

export interface CallerState {
  readonly callId: string | null;
  readonly lifecycleState: CallLifecycleState;
  readonly turnState: CallTurnState;
  readonly scenario: CallerScenario;
  readonly history: readonly ConversationTurn[];
  readonly activeTurnId: string | null;
  readonly errorMessage: string | null;
  readonly isMuted: boolean;
  readonly isSpeakerOn: boolean;
}

const INITIAL_STATE: CallerState = {
  callId: null,
  lifecycleState: 'idle',
  turnState: 'idle',
  scenario: DEFAULT_CALLER_SCENARIO,
  history: [],
  activeTurnId: null,
  errorMessage: null,
  isMuted: false,
  isSpeakerOn: true,
};

type Listener = () => void;

class CallerStore {
  private state: CallerState = INITIAL_STATE;
  private listeners = new Set<Listener>();
  private responseGenerator: IResponseGenerator = defaultDialogueEngine;
  private currentCallId: string | null = null;

  getState = (): CallerState => {
    return this.state;
  };

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private setState(partial: Partial<CallerState>): void {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Inject or swap the response generator (e.g. for offline Qwen LLM).
   */
  setResponseGenerator(generator: IResponseGenerator): void {
    this.responseGenerator = generator;
  }

  getResponseGenerator(): IResponseGenerator {
    return this.responseGenerator;
  }

  /**
   * Starts a new simulated AI call.
   * Completely resets previous turns and posts the scenario's initial greeting.
   */
  startCall(scenario: CallerScenario = DEFAULT_CALLER_SCENARIO): string {
    const callId = `call_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    this.currentCallId = callId;

    const scenarioConfig = CALLER_SCENARIOS[scenario] ?? CALLER_SCENARIOS.general_assistant;

    const initialTurn: ConversationTurn = {
      id: `turn_${Date.now()}_greeting`,
      callId,
      speaker: 'assistant',
      text: scenarioConfig.initialGreeting,
      timestamp: Date.now(),
      intent: 'greeting',
    };

    this.setState({
      callId,
      lifecycleState: 'connected',
      turnState: 'listening',
      scenario,
      history: [initialTurn],
      activeTurnId: initialTurn.id,
      errorMessage: null,
      isMuted: false,
    });

    return callId;
  }

  /**
   * Ends active call and prevents any subsequent turns from being appended.
   */
  endCall(): void {
    this.currentCallId = null;
    this.setState({
      lifecycleState: 'ended',
      turnState: 'idle',
      activeTurnId: null,
    });
  }

  /**
   * Resets store back to initial idle state.
   */
  reset(): void {
    this.currentCallId = null;
    this.setState(INITIAL_STATE);
  }

  /**
   * Sets current turn state (e.g., listening, transcribing, speaking).
   */
  setTurnState(turnState: CallTurnState): void {
    if (this.state.lifecycleState !== 'connected') {
      return;
    }
    this.setState({ turnState });
  }

  /**
   * Toggles microphone mute.
   */
  toggleMute(): void {
    this.setState({ isMuted: !this.state.isMuted });
  }

  /**
   * Toggles speaker output.
   */
  toggleSpeaker(): void {
    this.setState({ isSpeakerOn: !this.state.isSpeakerOn });
  }

  /**
   * Sets or updates error message with recoverable state.
   */
  setErrorMessage(errorMessage: string | null): void {
    this.setState({ errorMessage });
  }

  /**
   * Clears error message.
   */
  clearError(): void {
    this.setState({ errorMessage: null });
  }

  /**
   * Selects active scenario before a call starts.
   */
  setScenario(scenario: CallerScenario): void {
    if (this.state.lifecycleState === 'idle' || this.state.lifecycleState === 'ended') {
      this.setState({ scenario });
    }
  }

  /**
   * Processes a recognized user utterance, appends turn, and generates reply.
   * Guarded against late turns arriving after a call has ended.
   */
  async processUserUtterance(
    text: string,
    callIdToCheck?: string
  ): Promise<ConversationTurn | null> {
    const activeCallId = this.state.callId;

    // Guard: Call must be active and match the target call ID
    if (!activeCallId || this.state.lifecycleState !== 'connected') {
      return null;
    }
    if (callIdToCheck && callIdToCheck !== activeCallId) {
      return null;
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return null;
    }

    const userTurnId = `turn_${Date.now()}_user`;
    const userTurn: ConversationTurn = {
      id: userTurnId,
      callId: activeCallId,
      speaker: 'user',
      text: trimmed,
      timestamp: Date.now(),
    };

    // Append user turn and set thinking state
    const updatedHistory = [...this.state.history, userTurn].slice(-MAX_HISTORY_TURNS);
    this.setState({
      history: updatedHistory,
      turnState: 'thinking',
      activeTurnId: userTurnId,
      errorMessage: null,
    });

    const startTime = Date.now();

    try {
      const output = await this.responseGenerator.generateResponse({
        userUtterance: trimmed,
        history: updatedHistory,
        scenario: this.state.scenario,
        callId: activeCallId,
      });

      // Guard again: verify call was NOT ended while response was generating
      if (this.currentCallId !== activeCallId || this.state.lifecycleState !== 'connected') {
        return null;
      }

      const assistantTurnId = `turn_${Date.now()}_assistant`;
      const assistantTurn: ConversationTurn = {
        id: assistantTurnId,
        callId: activeCallId,
        speaker: 'assistant',
        text: output.replyText,
        timestamp: Date.now(),
        intent: output.intent,
        latencyMs: Date.now() - startTime,
      };

      const finalHistory = [...updatedHistory, assistantTurn].slice(-MAX_HISTORY_TURNS);

      if (output.shouldEndCall) {
        this.setState({
          history: finalHistory,
          turnState: 'speaking',
          activeTurnId: assistantTurnId,
        });
      } else {
        this.setState({
          history: finalHistory,
          turnState: 'speaking',
          activeTurnId: assistantTurnId,
        });
      }

      return assistantTurn;
    } catch (err) {
      if (this.currentCallId !== activeCallId || this.state.lifecycleState !== 'connected') {
        return null;
      }

      const msg = err instanceof Error ? err.message : String(err);
      this.setState({
        turnState: 'error',
        errorMessage: `Dialogue error: ${msg}`,
      });
      return null;
    }
  }
}

export const callerStore = new CallerStore();

/**
 * React hook for observing CallerStore state with React 18/19 useSyncExternalStore.
 */
export function useCallerStore(): CallerState {
  return useSyncExternalStore(callerStore.subscribe, callerStore.getState);
}
