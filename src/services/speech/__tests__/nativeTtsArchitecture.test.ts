import assert from 'node:assert/strict';
import test, { describe } from 'node:test';

import { DEFAULT_TTS_LANGUAGE_CODE, SUPPORTED_TTS_LANGUAGES } from '@/constants/ttsLanguages';
import { DEFAULT_TTS_CONFIG, ttsSettingsStore } from '@/stores/ttsSettingsStore';
import { ModelRegistry } from '@/services/models';
import { ModelReadinessService } from '@/services/models';

describe('Audio Configuration Separation & TTS Architecture', () => {
  test('1. Independent configuration models: TTS vs STT vs LLM', () => {
    // TTS configuration
    const ttsConfig = ttsSettingsStore.getState();
    assert.equal(typeof ttsConfig.preferredLanguage, 'string');
    assert.equal(typeof ttsConfig.rate, 'number');
    assert.equal(typeof ttsConfig.pitch, 'number');
    assert.equal(typeof ttsConfig.volume, 'number');

    // STT model configuration is independent
    const defaultStt = ModelRegistry.getDefaultModel('stt');
    assert.equal(defaultStt.category, 'stt');
    assert.equal(defaultStt.id, 'sherpa-onnx-indic-conformer-ml');

    // LLM model configuration is independent
    const defaultLlm = ModelRegistry.getDefaultModel('llm');
    assert.equal(defaultLlm.category, 'llm');
    assert.ok(defaultLlm.id.includes('qwen'));

    // Changing TTS configuration does NOT mutate STT or LLM configurations
    ttsSettingsStore.setRate(1.5);
    ttsSettingsStore.setPitch(1.2);
    ttsSettingsStore.setPreferredLanguage('hi-IN');

    assert.equal(ttsSettingsStore.getState().rate, 1.5);
    assert.equal(ttsSettingsStore.getState().pitch, 1.2);
    assert.equal(ttsSettingsStore.getState().preferredLanguage, 'hi-IN');

    // Verify STT and LLM models remain unmodified
    assert.equal(ModelRegistry.getDefaultModel('stt').id, 'sherpa-onnx-indic-conformer-ml');
    assert.equal(ModelRegistry.getDefaultModel('llm').id, defaultLlm.id);

    // Reset defaults
    ttsSettingsStore.resetDefaults();
    assert.equal(ttsSettingsStore.getState().rate, 1.0);
    assert.equal(ttsSettingsStore.getState().pitch, 1.0);
    assert.equal(ttsSettingsStore.getState().preferredLanguage, DEFAULT_TTS_LANGUAGE_CODE);
  });

  test('2. Per-request overrides do not mutate persisted settings', () => {
    ttsSettingsStore.resetDefaults();
    const initialConfig = ttsSettingsStore.getState();
    assert.equal(initialConfig.preferredLanguage, DEFAULT_TTS_LANGUAGE_CODE);
    assert.equal(initialConfig.rate, 1.0);
    assert.equal(initialConfig.pitch, 1.0);

    // Simulated per-request options override (e.g. for preview or benchmark test)
    const perRequestOptions = {
      language: 'ta-IN',
      rate: 1.35,
      pitch: 0.85,
      volume: 0.7,
    };

    // The store must remain untouched
    const storedAfter = ttsSettingsStore.getState();
    assert.equal(storedAfter.preferredLanguage, DEFAULT_TTS_LANGUAGE_CODE);
    assert.equal(storedAfter.rate, 1.0);
    assert.equal(storedAfter.pitch, 1.0);
    assert.equal(storedAfter.volume, 1.0);
  });

  test('3. TTS Readiness reports ready for Android Native TTS without required file downloads', async () => {
    const ttsReadiness = await ModelReadinessService.checkTtsReadiness();
    assert.equal(ttsReadiness.isReady, true);
    assert.equal(ttsReadiness.status, 'ready');
    assert.equal(ttsReadiness.category, 'tts');
    assert.equal(ttsReadiness.missingFiles.length, 0);
  });

  test('4. Supported Languages list covers all requested Indian languages & English', () => {
    const codes = SUPPORTED_TTS_LANGUAGES.map((l) => l.code);
    assert.ok(codes.includes('ml-IN'), 'Must support Malayalam');
    assert.ok(codes.includes('hi-IN'), 'Must support Hindi');
    assert.ok(codes.includes('ta-IN'), 'Must support Tamil');
    assert.ok(codes.includes('kn-IN'), 'Must support Kannada');
    assert.ok(codes.includes('te-IN'), 'Must support Telugu');
    assert.ok(codes.includes('bn-IN'), 'Must support Bengali');
    assert.ok(codes.includes('en-IN'), 'Must support Indian English');
    assert.ok(codes.includes('en-US'), 'Must support Global English');
  });

  test('5. Per-language configuration and fallback defaults', () => {
    ttsSettingsStore.resetDefaults();

    // Default language Malayalam initially inherits global defaults
    const mlConfig = ttsSettingsStore.getLanguageConfig('ml-IN');
    assert.equal(mlConfig.rate, 1.0);
    assert.equal(mlConfig.pitch, 1.0);
    assert.equal(mlConfig.voiceId, null);

    // Set custom voice, rate, and pitch for Hindi
    ttsSettingsStore.setLanguageVoice('hi-IN', 'hi-in-x-hie-local');
    ttsSettingsStore.setLanguageRate('hi-IN', 1.25);
    ttsSettingsStore.setLanguagePitch('hi-IN', 0.8);

    const hiConfig = ttsSettingsStore.getLanguageConfig('hi-IN');
    assert.equal(hiConfig.voiceId, 'hi-in-x-hie-local');
    assert.equal(hiConfig.rate, 1.25);
    assert.equal(hiConfig.pitch, 0.8);

    // Other languages still retain defaults
    const taConfig = ttsSettingsStore.getLanguageConfig('ta-IN');
    assert.equal(taConfig.rate, 1.0);
    assert.equal(taConfig.pitch, 1.0);
    assert.equal(taConfig.voiceId, null);

    // Setting Hindi as preferred language updates preferred language and selected voice
    ttsSettingsStore.setPreferredLanguage('hi-IN');
    assert.equal(ttsSettingsStore.getState().preferredLanguage, 'hi-IN');
    assert.equal(ttsSettingsStore.getState().selectedVoiceId, 'hi-in-x-hie-local');

    ttsSettingsStore.resetDefaults();
  });

  test('6. Filter cached TTS voices by requested language', async () => {
    const { nativeTtsService } = await import('@/services/speech/nativeTtsService');

    // Seed mock cached voices into nativeTtsService
    const mockVoices = [
      {
        identifier: 'ml-in-x-female-1',
        name: 'Malayalam Female',
        language: 'ml-IN',
        quality: 'Enhanced',
      },
      {
        identifier: 'ml-in-x-male-1',
        name: 'Malayalam Male',
        language: 'ml_IN',
        quality: 'Default',
      },
      {
        identifier: 'hi-in-x-female-1',
        name: 'Hindi Female',
        language: 'hi-IN',
        quality: 'Enhanced',
      },
      { identifier: 'ta-in-x-male-1', name: 'Tamil Male', language: 'ta-IN', quality: 'Default' },
      { identifier: 'en-us-x-sfg', name: 'English US', language: 'en-US', quality: 'Enhanced' },
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (nativeTtsService as any).cachedVoices = mockVoices;

    // Filter Malayalam
    const mlVoices = nativeTtsService.getCachedVoicesForLanguage('ml-IN');
    assert.ok(mlVoices);
    assert.equal(mlVoices.length, 2);
    assert.ok(mlVoices.every((v) => v.language.toLowerCase().startsWith('ml')));

    // Filter Hindi
    const hiVoices = nativeTtsService.getCachedVoicesForLanguage('hi-IN');
    assert.ok(hiVoices);
    assert.equal(hiVoices.length, 1);
    assert.equal(hiVoices[0].identifier, 'hi-in-x-female-1');

    // Filter unsupported or non-existent language
    const nonExistent = nativeTtsService.getCachedVoicesForLanguage('invalid-code');
    assert.deepEqual(nonExistent, []);
  });

  test('7. Language switching does not retain voices from the previous language', async () => {
    const { nativeTtsService } = await import('@/services/speech/nativeTtsService');

    // Mock cached voices with distinct languages
    const mockVoices = [
      { identifier: 'ml-1', name: 'ML Voice', language: 'ml-IN' },
      { identifier: 'hi-1', name: 'HI Voice', language: 'hi-IN' },
      { identifier: 'ta-1', name: 'TA Voice', language: 'ta-IN' },
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (nativeTtsService as any).cachedVoices = mockVoices;

    // Query 1: Malayalam
    const mlVoices = nativeTtsService.getCachedVoicesForLanguage('ml-IN');
    assert.ok(mlVoices?.some((v) => v.identifier === 'ml-1'));

    // Query 2: Switch to Tamil
    const taVoices = nativeTtsService.getCachedVoicesForLanguage('ta-IN');
    assert.ok(taVoices?.some((v) => v.identifier === 'ta-1'));
    // Ensure no Malayalam voices bleed into Tamil result
    assert.ok(!taVoices?.some((v) => v.identifier === 'ml-1'));

    // Query 3: Switch to Kannada (no voices installed)
    const knVoices = nativeTtsService.getCachedVoicesForLanguage('kn-IN');
    assert.deepEqual(knVoices, []);
    // Stale voices from Tamil or Malayalam are NOT retained
    assert.ok(!(knVoices as readonly any[])?.some((v) => v.identifier === 'ta-1'));
    assert.ok(!(knVoices as readonly any[])?.some((v) => v.identifier === 'ml-1'));

    // Reset cachedVoices to avoid polluting subsequent tests
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (nativeTtsService as any).cachedVoices = null;
    assert.equal(nativeTtsService.getCachedVoicesForLanguage('ml-IN'), null);
  });
});
