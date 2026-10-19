import assert from 'node:assert';
import test, { describe } from 'node:test';

import { ConversationPromptFormatter } from '../llm/conversationPrompt';
import { checkNativeLlmAvailability, MockLlmRuntime } from '../llm/modelRuntime';
import { LocalLlmResponseGenerator } from '../llm/localLlmResponseGenerator';
import { modelDownloadService } from '../llm/modelDownloadService';
import { QWEN_2_5_0_5B_MODEL, QWEN_2_5_1_5B_MODEL } from '@/constants/llmModels';
import { callerStore } from '@/stores/callerStore';
import { defaultDialogueEngine } from '../callerDialogueEngine';

describe('Local LLM Integration & Fallback Engine', () => {
  test('1. Prompt Formatter builds ChatML structure and preserves scenario rules', () => {
    const prompt = ConversationPromptFormatter.formatQwenPrompt(
      'otp_security',
      [],
      'എന്റെ ഒടിപി എന്താണ്?'
    );

    assert.ok(prompt.includes('<|im_start|>system'));
    assert.ok(prompt.includes('7 2 0 5'));
    assert.ok(prompt.includes('<|im_start|>user\nഎന്റെ ഒടിപി എന്താണ്?\n<|im_end|>'));
    assert.ok(prompt.endsWith('<|im_start|>assistant\n'));
  });

  test('2. Response sanitizer strips residual ChatML tags and markdown', () => {
    const raw =
      '<|im_start|>assistant\n**തീർച്ചയായും**, നിങ്ങളുടെ അപ്പോയിന്റ്മെന്റ് ഉറപ്പിച്ചു.<|im_end|>';
    const cleaned = ConversationPromptFormatter.cleanGeneratedResponse(raw);
    assert.strictEqual(cleaned, 'തീർച്ചയായും, നിങ്ങളുടെ അപ്പോയിന്റ്മെന്റ് ഉറപ്പിച്ചു.');
  });

  test('3. LocalLlmResponseGenerator produces valid Malayalam replies with MockRuntime', async () => {
    const runtime = new MockLlmRuntime();
    await runtime.loadModel(QWEN_2_5_0_5B_MODEL);

    let capturedMetrics = false;
    const generator = new LocalLlmResponseGenerator({
      runtime,
      onMetricsGenerated: (metrics) => {
        capturedMetrics = metrics.tokensPerSecond > 0;
      },
    });

    const output = await generator.generateResponse({
      userUtterance: 'ഡോക്ടറെ കാണാൻ സമയം ഉണ്ടോ?',
      history: [],
      scenario: 'appointment_scheduler',
      callId: 'call_test_1',
    });

    assert.ok(output.replyText.length > 0);
    assert.ok(output.replyText.includes('അപ്പോയിന്റ്മെന്റ്'));
    assert.strictEqual(capturedMetrics, true);
    assert.strictEqual(output.source, 'llm');
    assert.ok((output.latencyMs ?? 0) >= 0);
  });

  test('4. Transparently falls back to deterministic engine when uninitialized', async () => {
    const uninitializedRuntime = new MockLlmRuntime();
    // Do NOT call loadModel() -> runtime.isInitialized() === false

    const generator = new LocalLlmResponseGenerator({
      runtime: uninitializedRuntime,
    });

    const output = await generator.generateResponse({
      userUtterance: 'നമസ്കാരം',
      history: [],
      scenario: 'general_assistant',
      callId: 'call_test_fallback',
    });

    assert.strictEqual(output.intent, 'greeting');
    assert.ok(output.replyText.includes('നമസ്കാരം'));
    assert.strictEqual(output.source, 'deterministic_fallback');
    assert.ok((output.latencyMs ?? 0) >= 0);
  });

  test('5. Seamless integration into callerStore without audio pipeline modification', async () => {
    const runtime = new MockLlmRuntime();
    await runtime.loadModel(QWEN_2_5_0_5B_MODEL);

    const generator = new LocalLlmResponseGenerator({ runtime });
    callerStore.setResponseGenerator(generator);

    callerStore.reset();
    const callId = callerStore.startCall('appointment_scheduler');

    const assistantTurn = await callerStore.processUserUtterance('നാളെ ഡോക്ടർ ഉണ്ടാകുമോ?', callId);

    assert.ok(assistantTurn !== null);
    assert.strictEqual(assistantTurn?.speaker, 'assistant');
    assert.ok(assistantTurn?.text.includes('അപ്പോയിന്റ്മെന്റ്'));

    // Verify turn appended cleanly to callerStore history
    const state = callerStore.getState();
    assert.strictEqual(state.history.length, 3); // greeting + user + assistant

    // Restore default deterministic engine
    callerStore.setResponseGenerator(defaultDialogueEngine);
    callerStore.reset();
  });

  test('6. Actively halts background generation and falls back on timeout', async () => {
    let stopCalled = false;
    const slowRuntime = new MockLlmRuntime();
    await slowRuntime.loadModel(QWEN_2_5_0_5B_MODEL);

    // Override generate to simulate slow native inference
    slowRuntime.generate = () =>
      new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              text: 'Too slow',
              metrics: {
                timeToFirstTokenMs: 500,
                totalGenerationTimeMs: 500,
                promptTokens: 10,
                completionTokens: 2,
                tokensPerSecond: 4,
              },
            }),
          300
        )
      );

    slowRuntime.stopGeneration = async () => {
      stopCalled = true;
    };

    const generator = new LocalLlmResponseGenerator({
      runtime: slowRuntime,
      timeoutMs: 50, // Fast timeout for test
    });

    const output = await generator.generateResponse({
      userUtterance: 'നമസ്കാരം',
      history: [],
      scenario: 'general_assistant',
      callId: 'call_test_timeout',
    });

    assert.strictEqual(stopCalled, true, 'stopGeneration should be called when LLM times out');
    assert.strictEqual(output.source, 'deterministic_fallback');
    assert.strictEqual(output.intent, 'greeting');
  });

  test('7. Environment inspects native availability cleanly without throwing', () => {
    const availability = checkNativeLlmAvailability();
    assert.ok(typeof availability.available === 'boolean');
    assert.ok(
      availability.runtimeType === 'native_llama_rn' || availability.runtimeType === 'unlinked'
    );
  });

  test('8. ModelDownloadService computes file paths and validates single-download lock', () => {
    const path05 = modelDownloadService.getModelFilePath(QWEN_2_5_0_5B_MODEL.filename);
    const path15 = modelDownloadService.getModelFilePath(QWEN_2_5_1_5B_MODEL.filename);

    assert.ok(path05.endsWith(QWEN_2_5_0_5B_MODEL.filename));
    assert.ok(path15.endsWith(QWEN_2_5_1_5B_MODEL.filename));
    assert.strictEqual(modelDownloadService.getActiveDownloadingModelId(), null);
  });
});
