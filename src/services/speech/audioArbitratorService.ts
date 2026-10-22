export type AudioArbitratorState = 'idle' | 'recording' | 'playing';

export interface AudioPlaybackResult {
  completed: boolean;
  durationSec: number;
  reason?: 'finished' | 'interrupted' | 'cancelled' | 'error';
}

/**
 * Interface representing recorder controls needed by AudioArbitratorService.
 * Mirrors expo-audio's AudioRecorder interface.
 */
export interface IAudioRecorder {
  isRecording?: boolean;
  uri?: string | null;
  prepareToRecordAsync: () => Promise<void>;
  record: () => void;
  stop: () => Promise<void>;
}

/**
 * AudioArbitratorService enforces strict half-duplex conversational audio arbitration:
 * - Only one audio state (recording OR playing) can be active at any time.
 * - Starting playback stops and cancels any active recording.
 * - Starting recording stops any active audio playback.
 * - Monotonically increasing session tokens protect against late turns and orphaned audio callbacks.
 * - Safe for SSR, web, and Node.js testing environments where native ExpoAudio is unavailable.
 */
export class AudioArbitratorService {
  private static currentState: AudioArbitratorState = 'idle';
  private static sessionToken: number = 0;
  private static isNativeSupported: boolean | null = null;

  // Active audio player reference and listener subscription
  private static activePlayer: {
    play: () => void;
    pause?: () => void;
    remove?: () => void;
    volume?: number;
    addListener: (
      event: string,
      callback: (status: { didJustFinish?: boolean; duration?: number }) => void
    ) => { remove: () => void };
  } | null = null;
  private static activeSubscription: { remove: () => void } | null = null;
  private static activePlaybackResolver: ((result: AudioPlaybackResult) => void) | null = null;

  /**
   * Diagnostic check for native ExpoAudio module support.
   */
  static checkNativeSupport(): boolean {
    if (this.isNativeSupported !== null) {
      return this.isNativeSupported;
    }

    // In Node.js testing or web environments, native ExpoAudio is unavailable
    if (typeof process !== 'undefined' && process.versions?.node) {
      this.isNativeSupported = false;
      return false;
    }

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.isNativeSupported = false;
      return false;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { requireOptionalNativeModule } = require('expo-modules-core');
      this.isNativeSupported = Boolean(requireOptionalNativeModule('ExpoAudio'));
    } catch {
      this.isNativeSupported = false;
    }

    return this.isNativeSupported ?? false;
  }

  /**
   * Returns current audio hardware state.
   */
  static getAudioState(): AudioArbitratorState {
    return this.currentState;
  }

  /**
   * Returns whether audio speaker playback is currently active.
   */
  static isPlaybackActive(): boolean {
    return this.currentState === 'playing';
  }

  /**
   * Returns whether microphone recording is currently active.
   */
  static isRecordingActive(): boolean {
    return this.currentState === 'recording';
  }

  /**
   * Generates and returns a new session token, invalidating any previous in-flight turns.
   */
  static acquireSessionToken(): number {
    this.sessionToken += 1;
    return this.sessionToken;
  }

  /**
   * Checks whether a session token matches the active session.
   */
  static isSessionValid(token: number): boolean {
    return token === this.sessionToken;
  }

  /**
   * Invalidates the active session token to discard all pending async callbacks.
   */
  static invalidateSession(): void {
    this.sessionToken += 1;
  }

  /**
   * Configures global audio session mode.
   */
  static async setAudioMode(options: { allowsRecording: boolean }): Promise<void> {
    if (!this.checkNativeSupport()) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { setAudioModeAsync } = require('expo-audio');
      await setAudioModeAsync({
        allowsRecording: options.allowsRecording,
        playsInSilentMode: true,
      });
    } catch (err) {
      console.warn('[AudioArbitratorService] Could not set audio mode:', err);
    }
  }

  /**
   * Starts user voice recording under strict half-duplex lock.
   * Immediately stops any active audio playback and switches audio mode to recording.
   */
  static async startRecording(recorder: IAudioRecorder, sessionToken?: number): Promise<void> {
    if (sessionToken !== undefined && !this.isSessionValid(sessionToken)) {
      return;
    }

    // Stop playback if active
    if (this.currentState === 'playing') {
      await this.stopPlayback();
    }

    await this.setAudioMode({ allowsRecording: true });

    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
      this.currentState = 'recording';
    } catch (err) {
      await this.setAudioMode({ allowsRecording: false });
      this.currentState = 'idle';
      throw err;
    }
  }

  /**
   * Stops active voice recording cleanly and restores audio session for speaker output.
   */
  static async stopRecording(
    recorder: IAudioRecorder,
    sessionToken?: number
  ): Promise<string | null> {
    if (this.currentState !== 'recording') {
      return null;
    }

    try {
      await recorder.stop();
      await this.setAudioMode({ allowsRecording: false });
      this.currentState = 'idle';

      if (sessionToken !== undefined && !this.isSessionValid(sessionToken)) {
        return null;
      }

      return recorder.uri ?? null;
    } catch (err) {
      await this.setAudioMode({ allowsRecording: false });
      this.currentState = 'idle';
      throw err;
    }
  }

  /**
   * Cancels active voice recording without returning an audio file.
   */
  static async cancelRecording(recorder: IAudioRecorder): Promise<void> {
    if (this.currentState === 'recording') {
      try {
        await recorder.stop();
      } catch {
        // Ignore stop error on cancellation
      } finally {
        await this.setAudioMode({ allowsRecording: false });
        this.currentState = 'idle';
      }
    }
  }

  /**
   * Plays audio through expo-audio AudioPlayer with playback completion resolution.
   * Cancels active recording before starting playback.
   */
  static async playAudio(
    audioUri: string,
    options?: { volume?: number; sessionToken?: number }
  ): Promise<AudioPlaybackResult> {
    if (options?.sessionToken !== undefined && !this.isSessionValid(options.sessionToken)) {
      return { completed: false, durationSec: 0, reason: 'cancelled' };
    }

    // Stop any in-flight playback
    await this.stopPlayback();

    // If native audio is not supported (e.g. Node tests), resolve immediately
    if (!this.checkNativeSupport()) {
      return { completed: true, durationSec: 0, reason: 'finished' };
    }

    await this.setAudioMode({ allowsRecording: false });

    return new Promise<AudioPlaybackResult>((resolve) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { createAudioPlayer } = require('expo-audio');
        const player = createAudioPlayer(audioUri);

        this.activePlayer = player;
        this.currentState = 'playing';

        if (typeof options?.volume === 'number' && typeof player.volume === 'number') {
          player.volume = Math.max(0, Math.min(1, options.volume));
        }

        this.activePlaybackResolver = resolve;

        this.activeSubscription = player.addListener(
          'playbackStatusUpdate',
          (status: { didJustFinish?: boolean; duration?: number }) => {
            if (status.didJustFinish) {
              const duration = status.duration ?? 0;
              this.cleanupPlayer();
              this.currentState = 'idle';
              resolve({ completed: true, durationSec: duration, reason: 'finished' });
            }
          }
        );

        player.play();
      } catch (err) {
        this.cleanupPlayer();
        this.currentState = 'idle';
        resolve({ completed: false, durationSec: 0, reason: 'error' });
      }
    });
  }

  /**
   * Immediately stops active audio playback and clears native player resources.
   */
  static async stopPlayback(): Promise<void> {
    if (this.activePlaybackResolver) {
      const resolver = this.activePlaybackResolver;
      this.activePlaybackResolver = null;
      resolver({ completed: false, durationSec: 0, reason: 'interrupted' });
    }

    if (typeof process === 'undefined' || !process.versions?.node) {
      try {
        const { nativeTtsService } = await import('./nativeTtsService');
        await nativeTtsService.stop();
      } catch {
        // Ignore native TTS stop error
      }
    }

    this.cleanupPlayer();
    this.currentState = 'idle';
  }

  /**
   * Cancels all in-flight recording, stops playback, and invalidates the session token.
   */
  static async cancelAll(recorder?: IAudioRecorder): Promise<void> {
    this.invalidateSession();

    if (recorder) {
      await this.cancelRecording(recorder);
    }

    await this.stopPlayback();
    await this.setAudioMode({ allowsRecording: false });
    this.currentState = 'idle';
  }

  /**
   * Internal helper to clean up active player instance and subscription.
   */
  private static cleanupPlayer(): void {
    if (this.activeSubscription) {
      try {
        this.activeSubscription.remove();
      } catch {
        // Ignore unsubscription error
      }
      this.activeSubscription = null;
    }

    if (this.activePlayer) {
      try {
        if (typeof this.activePlayer.pause === 'function') {
          this.activePlayer.pause();
        }
        if (typeof this.activePlayer.remove === 'function') {
          this.activePlayer.remove();
        }
      } catch {
        // Ignore disposal error
      }
      this.activePlayer = null;
    }

    this.activePlaybackResolver = null;
  }
}
