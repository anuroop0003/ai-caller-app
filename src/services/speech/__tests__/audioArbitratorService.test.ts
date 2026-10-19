import assert from 'node:assert';
import test, { describe } from 'node:test';

import { AudioArbitratorService, type IAudioRecorder } from '../audioArbitratorService';

class MockAudioRecorder implements IAudioRecorder {
  isRecording = false;
  uri: string | null = 'file:///data/cache/mock_turn.m4a';
  prepareCount = 0;
  recordCount = 0;
  stopCount = 0;

  async prepareToRecordAsync(): Promise<void> {
    this.prepareCount++;
  }

  record(): void {
    this.recordCount++;
    this.isRecording = true;
  }

  async stop(): Promise<void> {
    this.stopCount++;
    this.isRecording = false;
  }
}

describe('AudioArbitratorService - Half-Duplex Arbitration & Session Safety', () => {
  test('1. Session Token Acquisition & Invalidation', () => {
    const token1 = AudioArbitratorService.acquireSessionToken();
    assert.ok(token1 > 0);
    assert.strictEqual(AudioArbitratorService.isSessionValid(token1), true);

    const token2 = AudioArbitratorService.acquireSessionToken();
    assert.strictEqual(token2, token1 + 1);
    assert.strictEqual(AudioArbitratorService.isSessionValid(token1), false);
    assert.strictEqual(AudioArbitratorService.isSessionValid(token2), true);

    AudioArbitratorService.invalidateSession();
    assert.strictEqual(AudioArbitratorService.isSessionValid(token2), false);
  });

  test('2. Clean Recording Lifecycle', async () => {
    const mock = new MockAudioRecorder();
    const token = AudioArbitratorService.acquireSessionToken();

    assert.strictEqual(AudioArbitratorService.getAudioState(), 'idle');
    assert.strictEqual(AudioArbitratorService.isRecordingActive(), false);

    await AudioArbitratorService.startRecording(mock, token);
    assert.strictEqual(AudioArbitratorService.getAudioState(), 'recording');
    assert.strictEqual(AudioArbitratorService.isRecordingActive(), true);
    assert.strictEqual(mock.recordCount, 1);

    const recordedUri = await AudioArbitratorService.stopRecording(mock, token);
    assert.strictEqual(recordedUri, 'file:///data/cache/mock_turn.m4a');
    assert.strictEqual(AudioArbitratorService.getAudioState(), 'idle');
    assert.strictEqual(AudioArbitratorService.isRecordingActive(), false);
    assert.strictEqual(mock.stopCount, 1);
  });

  test('3. Rejects Recording with Expired Session Token', async () => {
    const mock = new MockAudioRecorder();
    const oldToken = AudioArbitratorService.acquireSessionToken();
    AudioArbitratorService.invalidateSession();

    await AudioArbitratorService.startRecording(mock, oldToken);
    assert.strictEqual(AudioArbitratorService.getAudioState(), 'idle');
    assert.strictEqual(mock.recordCount, 0);
  });

  test('4. Discards Late Recording Completion When Call Ended in Flight', async () => {
    const mock = new MockAudioRecorder();
    const token = AudioArbitratorService.acquireSessionToken();

    await AudioArbitratorService.startRecording(mock, token);
    assert.strictEqual(AudioArbitratorService.getAudioState(), 'recording');

    // Simulate call ending while user was speaking
    AudioArbitratorService.invalidateSession();

    const result = await AudioArbitratorService.stopRecording(mock, token);
    assert.strictEqual(result, null);
    assert.strictEqual(AudioArbitratorService.getAudioState(), 'idle');
  });

  test('5. cancelAll Resets Hardware State and Invalidates In-Flight Tokens', async () => {
    const mock = new MockAudioRecorder();
    const token = AudioArbitratorService.acquireSessionToken();

    await AudioArbitratorService.startRecording(mock, token);
    assert.strictEqual(AudioArbitratorService.isRecordingActive(), true);

    await AudioArbitratorService.cancelAll(mock);
    assert.strictEqual(AudioArbitratorService.getAudioState(), 'idle');
    assert.strictEqual(AudioArbitratorService.isRecordingActive(), false);
    assert.strictEqual(AudioArbitratorService.isPlaybackActive(), false);
    assert.strictEqual(AudioArbitratorService.isSessionValid(token), false);
  });
});
