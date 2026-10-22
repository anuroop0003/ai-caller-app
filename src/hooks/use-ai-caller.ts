import { useCallback, useEffect, useRef, useState } from 'react';

import {
  getRecordingPermissionsAsync,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  useAudioRecorder,
} from 'expo-audio';

import {
  AudioArbitratorService,
  SpeechRecognitionService,
  nativeTtsService,
} from '@/services/speech';
import { callerStore, useCallerStore } from '@/stores/callerStore';
import { ttsSettingsStore } from '@/stores/ttsSettingsStore';
import type {
  CallLifecycleState,
  CallTurnState,
  CallerScenario,
  ConversationTurn,
} from '@/types/conversation';

export interface UseAiCallerResult {
  // Call State
  callId: string | null;
  lifecycleState: CallLifecycleState;
  turnState: CallTurnState;
  scenario: CallerScenario;
  history: readonly ConversationTurn[];
  activeTurnId: string | null;
  errorMessage: string | null;
  isMuted: boolean;
  isSpeakerOn: boolean;

  // Audio & Hardware State
  hasPermission: boolean | null;
  isRecording: boolean;
  isPlaying: boolean;
  recordingDurationSec: number;

  // Actions
  startCall: (scenario?: CallerScenario) => Promise<void>;
  endCall: () => Promise<void>;
  startUserTurn: () => Promise<void>;
  finishUserTurn: () => Promise<void>;
  cancelUserTurn: () => Promise<void>;
  toggleMute: () => void;
  toggleSpeaker: () => void;
  setScenario: (scenario: CallerScenario) => void;
  resetCall: () => void;
}

export function useAiCaller(): UseAiCallerResult {
  const storeState = useCallerStore();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recordingDurationSec, setRecordingDurationSec] = useState<number>(0);
  const [isRecordingState, setIsRecordingState] = useState<boolean>(false);
  const [isPlayingState, setIsPlayingState] = useState<boolean>(false);

  // Sync ref tracking recording start time for drift-free duration
  const recordingStartTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeSessionTokenRef = useRef<number>(0);
  const isBusyRef = useRef<boolean>(false);

  // Expo-audio recorder handle managed by component lifecycle
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // Check microphone permissions on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const status = await getRecordingPermissionsAsync();
        if (isMounted) {
          setHasPermission(status.granted);
        }
      } catch {
        if (isMounted) {
          setHasPermission(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    recordingStartTimeRef.current = null;
    setRecordingDurationSec(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      AudioArbitratorService.cancelAll(recorder);
    };
  }, [clearTimer, recorder]);

  const checkOrRequestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const current = await getRecordingPermissionsAsync();
      if (current.granted) {
        setHasPermission(true);
        return true;
      }
      const requested = await requestRecordingPermissionsAsync();
      setHasPermission(requested.granted);
      return requested.granted;
    } catch {
      setHasPermission(false);
      return false;
    }
  }, []);

  /**
   * Starts a simulated AI call.
   * Clears previous turns, plays initial Malayalam greeting via TTS, then opens microphone for user.
   */
  const startCall = useCallback(
    async (scenario?: CallerScenario): Promise<void> => {
      if (isBusyRef.current) return;
      isBusyRef.current = true;
      callerStore.clearError();

      try {
        const granted = await checkOrRequestPermissions();
        if (!granted) {
          callerStore.setErrorMessage(
            'മൈക്രോഫോൺ അനുമതി ആവശ്യമാണ് (Microphone permission required)'
          );
          return;
        }

        // Cancel any pending audio operations and generate a fresh session token
        await AudioArbitratorService.cancelAll(recorder);
        const token = AudioArbitratorService.acquireSessionToken();
        activeSessionTokenRef.current = token;

        // Initialize call in store (posts initial greeting turn)
        const activeScenario = scenario ?? storeState.scenario;
        const callId = callerStore.startCall(activeScenario);

        // Get greeting turn text
        const state = callerStore.getState();
        const initialTurn = state.history[0];
        if (!initialTurn) return;

        callerStore.setTurnState('speaking');
        setIsPlayingState(true);

        // Speak initial greeting turn using Android Native TTS
        const ttsConfig = ttsSettingsStore.getState();
        const isSpeakerOn = callerStore.getState().isSpeakerOn;

        try {
          await nativeTtsService.speak(initialTurn.text, {
            language: ttsConfig.preferredLanguage,
            voice: ttsConfig.selectedVoiceId ?? undefined,
            rate: ttsConfig.rate,
            pitch: ttsConfig.pitch,
            volume: isSpeakerOn ? ttsConfig.volume : 0.0,
          });
        } catch (ttsErr) {
          console.warn('[useAiCaller] Initial TTS speech failed:', ttsErr);
        }

        if (!AudioArbitratorService.isSessionValid(token)) return;

        // Transition to listening state after greeting finishes
        callerStore.setTurnState('listening');
      } finally {
        setIsPlayingState(false);
        isBusyRef.current = false;
      }
    },
    [checkOrRequestPermissions, recorder, storeState.scenario]
  );

  /**
   * Starts user voice turn recording under strict half-duplex lock.
   */
  const startUserTurn = useCallback(async (): Promise<void> => {
    const currentState = callerStore.getState();
    if (currentState.lifecycleState !== 'connected') return;
    if (currentState.turnState !== 'listening') return;
    if (currentState.isMuted) {
      callerStore.setErrorMessage('മൈക്രോഫോൺ മ്യൂട്ട് ചെയ്തിരിക്കുന്നു (Microphone is muted)');
      return;
    }
    if (isRecordingState || isBusyRef.current) return;

    callerStore.clearError();
    const token = activeSessionTokenRef.current;

    try {
      await AudioArbitratorService.startRecording(recorder, token);
      setIsRecordingState(true);

      // Start drift-free duration timer
      clearTimer();
      const startTime = Date.now();
      recordingStartTimeRef.current = startTime;
      timerRef.current = setInterval(() => {
        if (recordingStartTimeRef.current) {
          const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
          setRecordingDurationSec(elapsed);
        }
      }, 500);
    } catch (err) {
      setIsRecordingState(false);
      clearTimer();
      const msg = err instanceof Error ? err.message : String(err);
      callerStore.setErrorMessage(`റെക്കോർഡിംഗ് ആരംഭിക്കാനായില്ല: ${msg}`);
    }
  }, [clearTimer, isRecordingState, recorder]);

  /**
   * Finishes user turn: stops recording -> transcribes with STT -> runs dialogue engine -> speaks reply with TTS.
   */
  const finishUserTurn = useCallback(async (): Promise<void> => {
    if (!isRecordingState) return;

    const token = activeSessionTokenRef.current;
    const callId = callerStore.getState().callId;
    if (!callId) return;

    clearTimer();
    setIsRecordingState(false);
    callerStore.clearError();

    let recordedUri: string | null = null;
    try {
      recordedUri = await AudioArbitratorService.stopRecording(recorder, token);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      callerStore.setErrorMessage(`റെക്കോർഡിംഗ് നിർത്താനായില്ല: ${msg}`);
      callerStore.setTurnState('listening');
      return;
    }

    if (!AudioArbitratorService.isSessionValid(token)) return;

    if (!recordedUri) {
      callerStore.setErrorMessage(
        'ശബ്ദം വ്യക്തമായില്ല, ദയവായി വീണ്ടും പറയൂ (Could not capture voice)'
      );
      callerStore.setTurnState('listening');
      return;
    }

    // 1. Transcribe recorded audio
    callerStore.setTurnState('transcribing');
    let userText = '';

    try {
      const sttResult = await SpeechRecognitionService.transcribeRecordedAudio(recordedUri);
      userText = sttResult.text?.trim() || '';
    } catch (err) {
      if (!AudioArbitratorService.isSessionValid(token)) return;
      const msg = err instanceof Error ? err.message : String(err);
      callerStore.setErrorMessage(`വോയ്‌സ് തിരിച്ചറിയുന്നതിൽ തകരാർ: ${msg}`);
      callerStore.setTurnState('listening');
      return;
    }

    if (!AudioArbitratorService.isSessionValid(token)) return;

    if (!userText) {
      callerStore.setErrorMessage('ശബ്ദം വ്യക്തമായില്ല, ഒന്നുകൂടി പറയാമോ?');
      callerStore.setTurnState('listening');
      return;
    }

    // 2. Dialogue generation (user utterance -> assistant reply)
    callerStore.setTurnState('thinking');
    const assistantTurn = await callerStore.processUserUtterance(userText, callId);

    if (!assistantTurn || !AudioArbitratorService.isSessionValid(token)) {
      if (callerStore.getState().lifecycleState === 'connected') {
        callerStore.setTurnState('listening');
      }
      return;
    }

    // 3. Native speech synthesis of assistant reply
    callerStore.setTurnState('speaking');
    setIsPlayingState(true);

    const ttsConfig = ttsSettingsStore.getState();
    const isSpeakerOn = callerStore.getState().isSpeakerOn;

    try {
      await nativeTtsService.speak(assistantTurn.text, {
        language: ttsConfig.preferredLanguage,
        voice: ttsConfig.selectedVoiceId ?? undefined,
        rate: ttsConfig.rate,
        pitch: ttsConfig.pitch,
        volume: isSpeakerOn ? ttsConfig.volume : 0.0,
      });
    } catch (err) {
      console.warn('[useAiCaller] Reply TTS speech failed:', err);
    }

    setIsPlayingState(false);

    if (!AudioArbitratorService.isSessionValid(token)) return;

    // 4. Check if call should conclude
    if (assistantTurn.intent === 'call_closing') {
      callerStore.endCall();
    } else {
      callerStore.setTurnState('listening');
    }
  }, [clearTimer, isRecordingState, recorder]);

  /**
   * Cancels active user recording turn without submitting to STT.
   */
  const cancelUserTurn = useCallback(async (): Promise<void> => {
    clearTimer();
    setIsRecordingState(false);
    await AudioArbitratorService.cancelRecording(recorder);
    if (callerStore.getState().lifecycleState === 'connected') {
      callerStore.setTurnState('listening');
    }
  }, [clearTimer, recorder]);

  /**
   * Ends active call immediately and shuts down all active audio operations.
   */
  const endCall = useCallback(async (): Promise<void> => {
    clearTimer();
    setIsRecordingState(false);
    setIsPlayingState(false);
    await AudioArbitratorService.cancelAll(recorder);
    callerStore.endCall();
  }, [clearTimer, recorder]);

  const toggleMute = useCallback(() => {
    callerStore.toggleMute();
    if (isRecordingState) {
      cancelUserTurn();
    }
  }, [cancelUserTurn, isRecordingState]);

  const toggleSpeaker = useCallback(() => {
    callerStore.toggleSpeaker();
  }, []);

  const setScenario = useCallback((scenario: CallerScenario) => {
    callerStore.setScenario(scenario);
  }, []);

  const resetCall = useCallback(() => {
    clearTimer();
    setIsRecordingState(false);
    setIsPlayingState(false);
    AudioArbitratorService.cancelAll(recorder);
    callerStore.reset();
  }, [clearTimer, recorder]);

  return {
    callId: storeState.callId,
    lifecycleState: storeState.lifecycleState,
    turnState: storeState.turnState,
    scenario: storeState.scenario,
    history: storeState.history,
    activeTurnId: storeState.activeTurnId,
    errorMessage: storeState.errorMessage,
    isMuted: storeState.isMuted,
    isSpeakerOn: storeState.isSpeakerOn,
    hasPermission,
    isRecording: isRecordingState,
    isPlaying: isPlayingState,
    recordingDurationSec,
    startCall,
    endCall,
    startUserTurn,
    finishUserTurn,
    cancelUserTurn,
    toggleMute,
    toggleSpeaker,
    setScenario,
    resetCall,
  };
}
