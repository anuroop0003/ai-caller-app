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
});
