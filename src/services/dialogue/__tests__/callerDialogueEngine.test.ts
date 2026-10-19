import assert from 'node:assert';
import test, { describe } from 'node:test';

import {
  DeterministicCallerEngine,
  detectIntent,
  normalizeUtterance,
} from '../callerDialogueEngine';
import { CALLER_SCENARIOS } from '../callerScenarios';
import { callerStore } from '@/stores/callerStore';

describe('1. Utterance Normalization', () => {
  test('strips punctuation, trims whitespace, and removes ZWNJ/ZWJ characters', () => {
    // Malayalam with Zero-Width Non-Joiner (U+200C) and punctuation
    const raw = 'നമസ്കാരം! സുഖമാണോ?\u200C   ';
    const normalized = normalizeUtterance(raw);
    assert.strictEqual(normalized, 'നമസ്കാരം സുഖമാണോ');
  });

  test('normalizes mixed case English/Manglish tokens', () => {
    const raw = '  Hello, CAN you Repeat please??  ';
    const normalized = normalizeUtterance(raw);
    assert.strictEqual(normalized, 'hello can you repeat please');
  });
});

describe('2. Intent Detection across Malayalam & Manglish', () => {
  test('detects greeting intent', () => {
    assert.strictEqual(detectIntent('നമസ്കാരം', 'general_assistant').intent, 'greeting');
    assert.strictEqual(detectIntent('ഹലോ സുഖമാണോ', 'general_assistant').intent, 'greeting');
    assert.strictEqual(detectIntent('namaskaram', 'general_assistant').intent, 'greeting');
    assert.strictEqual(detectIntent('hello', 'general_assistant').intent, 'greeting');
  });

  test('detects repeat request intent', () => {
    assert.strictEqual(
      detectIntent('ഒന്നുകൂടി പറയുമോ', 'general_assistant').intent,
      'repeat_request'
    );
    assert.strictEqual(detectIntent('മനസ്സിലായില്ല', 'general_assistant').intent, 'repeat_request');
    assert.strictEqual(detectIntent('repeat please', 'general_assistant').intent, 'repeat_request');
  });

  test('detects appointment confirm vs reschedule in clinic scenario', () => {
    assert.strictEqual(
      detectIntent('ഞാൻ വരാം', 'appointment_scheduler').intent,
      'appointment_confirm'
    );
    assert.strictEqual(
      detectIntent('സമയത്ത് എത്താം', 'appointment_scheduler').intent,
      'appointment_confirm'
    );
    // General affirmative in clinic scenario maps to appointment_confirm
    assert.strictEqual(detectIntent('ശരി', 'appointment_scheduler').intent, 'appointment_confirm');
    // Negative in clinic scenario maps to reschedule
    assert.strictEqual(
      detectIntent('പറ്റില്ല', 'appointment_scheduler').intent,
      'appointment_reschedule'
    );
    assert.strictEqual(
      detectIntent('മറ്റൊരു ദിവസം മാറ്റണം', 'appointment_scheduler').intent,
      'appointment_reschedule'
    );
  });

  test('detects call screening message vs busy', () => {
    assert.strictEqual(
      detectIntent('ഒരു സന്ദേശം അറിയിക്കാനുണ്ട്', 'call_screener').intent,
      'call_screening_message'
    );
    assert.strictEqual(
      detectIntent('തിരിച്ചു വിളിക്കാൻ പറയൂ', 'call_screener').intent,
      'call_screening_message'
    );
    assert.strictEqual(
      detectIntent('പിന്നീട് വിളിക്കാം', 'call_screener').intent,
      'call_screening_busy'
    );
  });

  test('detects OTP repeat and OTP received in security scenario', () => {
    assert.strictEqual(detectIntent('കോഡ് പറയൂ', 'otp_security').intent, 'otp_repeat');
    assert.strictEqual(detectIntent('ശരി', 'otp_security').intent, 'otp_repeat');
    assert.strictEqual(detectIntent('കോഡ് കിട്ടി', 'otp_security').intent, 'otp_received');
  });

  test('detects call closing intent', () => {
    assert.strictEqual(detectIntent('നന്ദി', 'general_assistant').intent, 'call_closing');
    assert.strictEqual(detectIntent('ശരി ബൈ', 'general_assistant').intent, 'call_closing');
    assert.strictEqual(detectIntent('thank you', 'general_assistant').intent, 'call_closing');
  });

  test('handles unknown utterances gracefully with clarification fallback', () => {
    const result = detectIntent('xyz abc random text 12345', 'general_assistant');
    assert.strictEqual(result.intent, 'unknown');
    assert.strictEqual(result.confidence, 0);
  });
});

describe('3. Deterministic Engine Response Generation', () => {
  const engine = new DeterministicCallerEngine();

  test('generates polite repeat response incorporating scenario greeting', async () => {
    const output = await engine.generateResponse({
      userUtterance: 'ഒന്നുകൂടി പറയൂ',
      history: [],
      scenario: 'appointment_scheduler',
      callId: 'call_test',
    });

    assert.strictEqual(output.intent, 'repeat_request');
    assert.ok(output.replyText.includes('തീർച്ചയായും, ഒരിക്കൽക്കൂടി പറയാം.'));
    assert.ok(output.replyText.includes(CALLER_SCENARIOS.appointment_scheduler.initialGreeting));
  });

  test('generates confirmation response and sets shouldEndCall flag', async () => {
    const output = await engine.generateResponse({
      userUtterance: 'ഞാൻ വരാം ഉറപ്പിച്ചു',
      history: [],
      scenario: 'appointment_scheduler',
      callId: 'call_test',
    });

    assert.strictEqual(output.intent, 'appointment_confirm');
    assert.strictEqual(output.shouldEndCall, true);
    assert.ok(output.replyText.includes('ഉറപ്പിച്ചിട്ടുണ്ട്'));
  });

  test('provides clarification response on unknown input without ending call', async () => {
    const output = await engine.generateResponse({
      userUtterance: 'ബ്ല ബ്ല ബ്ല',
      history: [],
      scenario: 'general_assistant',
      callId: 'call_test',
    });

    assert.strictEqual(output.intent, 'clarification');
    assert.strictEqual(output.shouldEndCall, undefined);
    assert.ok(output.replyText.includes('വ്യക്തമായില്ല'));
  });
});

describe('4. CallerStore Turn Lifecycle & Concurrency Guards', () => {
  test('starting a new call resets previous conversation and sets initial greeting', () => {
    callerStore.reset();
    const callId = callerStore.startCall('appointment_scheduler');

    const state = callerStore.getState();
    assert.strictEqual(state.callId, callId);
    assert.strictEqual(state.lifecycleState, 'connected');
    assert.strictEqual(state.turnState, 'listening');
    assert.strictEqual(state.history.length, 1);
    assert.strictEqual(state.history[0].speaker, 'assistant');
    assert.strictEqual(state.history[0].intent, 'greeting');
  });

  test('processing user utterance appends turns in order', async () => {
    const stateBefore = callerStore.getState();
    const callId = stateBefore.callId!;

    const replyTurn = await callerStore.processUserUtterance('നമസ്കാരം, സുഖമാണോ?', callId);
    assert.ok(replyTurn !== null);
    assert.strictEqual(replyTurn?.speaker, 'assistant');
    assert.strictEqual(replyTurn?.intent, 'greeting');

    const stateAfter = callerStore.getState();
    assert.strictEqual(stateAfter.history.length, 3); // greeting + user + assistant
    assert.strictEqual(stateAfter.history[1].speaker, 'user');
    assert.strictEqual(stateAfter.history[1].text, 'നമസ്കാരം, സുഖമാണോ?');
    assert.strictEqual(stateAfter.history[2].speaker, 'assistant');
  });

  test('ending a call sets state to ended', () => {
    callerStore.endCall();
    const state = callerStore.getState();
    assert.strictEqual(state.lifecycleState, 'ended');
    assert.strictEqual(state.turnState, 'idle');
  });

  test('late or repeated responses cannot append turns after a call has ended', async () => {
    const stateAtEnd = callerStore.getState();
    assert.strictEqual(stateAtEnd.lifecycleState, 'ended');

    // Attempt to process a turn after endCall
    const result = await callerStore.processUserUtterance('ഹലോ ഞാൻ ഇപ്പോഴും സംസാരിക്കുന്നു');
    assert.strictEqual(result, null);

    // History count must remain unchanged
    const finalState = callerStore.getState();
    assert.strictEqual(finalState.history.length, stateAtEnd.history.length);
  });

  test('starting another new call completely resets history', () => {
    const newCallId = callerStore.startCall('call_screener');
    const state = callerStore.getState();
    assert.strictEqual(state.callId, newCallId);
    assert.strictEqual(state.history.length, 1);
    assert.strictEqual(state.scenario, 'call_screener');
    assert.ok(state.history[0].text.includes('മീറ്റിംഗിലാണ്'));
  });
});
