import assert from 'node:assert/strict';
import test from 'node:test';

import {
  LLM_QWEN_0_5B_MODEL,
  LLM_QWEN_1_5B_MODEL,
  STT_INDIC_CONFORMER_MODEL,
  TTS_PIPER_MEERA_MODEL,
} from '@/constants/models';
import {
  ModelFileService,
  ModelReadinessService,
  ModelRegistry,
  modelDownloadService,
} from '@/services/models';

test('1. ModelRegistry', async (t) => {
  await t.test('returns all registered STT, TTS, and LLM models', () => {
    const all = ModelRegistry.getAllModels();
    assert.ok(all.length >= 4);

    const ids = all.map((m) => m.id);
    assert.ok(ids.includes('sherpa-onnx-indic-conformer-ml'));
    assert.ok(ids.includes('vits-piper-ml_IN-meera-medium'));
    assert.ok(ids.includes('qwen2.5-0.5b-instruct-q4_k_m'));
    assert.ok(ids.includes('qwen2.5-1.5b-instruct-q4_k_m'));
  });

  await t.test('filters models by category', () => {
    const stt = ModelRegistry.getModelsByCategory('stt');
    assert.equal(stt.length, 1);
    assert.equal(stt[0].category, 'stt');

    const tts = ModelRegistry.getModelsByCategory('tts');
    assert.equal(tts.length, 1);
    assert.equal(tts[0].category, 'tts');

    const llm = ModelRegistry.getModelsByCategory('llm');
    assert.equal(llm.length, 2);
    assert.ok(llm.every((m) => m.category === 'llm'));
  });

  await t.test('retrieves default models for all 3 categories', () => {
    const defaultStt = ModelRegistry.getDefaultModel('stt');
    assert.equal(defaultStt.id, STT_INDIC_CONFORMER_MODEL.id);

    const defaultTts = ModelRegistry.getDefaultModel('tts');
    assert.equal(defaultTts.id, TTS_PIPER_MEERA_MODEL.id);

    const defaultLlm = ModelRegistry.getDefaultModel('llm');
    assert.equal(defaultLlm.id, LLM_QWEN_0_5B_MODEL.id);
  });

  await t.test('throws descriptive error on unknown or invalid category', () => {
    assert.throws(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      () => ModelRegistry.getDefaultModel('invalid_category' as any),
      /\[ModelRegistry\] Unsupported or invalid model category/
    );
  });

  await t.test('finds individual models by id', () => {
    const model = ModelRegistry.getModelById('qwen2.5-1.5b-instruct-q4_k_m');
    assert.ok(model);
    assert.equal(model?.name, 'Qwen 2.5 1.5B Instruct');
    assert.equal(model?.parameterSize, '1.5B');
  });
});

test('2. ModelFileService Path Computation & Validation', async (t) => {
  await t.test('computes relative model storage directory', () => {
    const sttDir = ModelFileService.getModelDir(STT_INDIC_CONFORMER_MODEL);
    assert.ok(sttDir.includes('models/sherpa-onnx-indic-conformer-ml/'));

    const llmDir = ModelFileService.getModelDir(LLM_QWEN_0_5B_MODEL);
    assert.ok(llmDir.includes('models/llm/'));
  });

  await t.test('computes target file paths accurately', () => {
    const filePath = ModelFileService.getFilePath(STT_INDIC_CONFORMER_MODEL, 'model.int8.onnx');
    assert.ok(filePath.endsWith('models/sherpa-onnx-indic-conformer-ml/model.int8.onnx'));
  });

  await t.test('reports free disk storage with safety margin', async () => {
    const freeBytes = await ModelFileService.getFreeDiskStorageBytes();
    assert.ok(freeBytes > 0);
  });
});

test('3. ModelReadinessService Evaluation & Missing Files Detection', async (t) => {
  await t.test('reports not_downloaded with missing files list when files absent', async () => {
    const readiness = await ModelReadinessService.checkModelReadiness(LLM_QWEN_1_5B_MODEL);
    assert.equal(readiness.category, 'llm');
    assert.equal(readiness.status, 'not_downloaded');
    assert.equal(readiness.isReady, false);
    assert.ok(readiness.missingFiles.includes('qwen2.5-1.5b-instruct-q4_k_m.gguf'));
  });

  await t.test('independent readiness evaluation does not cascade failure', async () => {
    const sttReadiness = await ModelReadinessService.checkSttReadiness();
    const llmReadiness = await ModelReadinessService.checkLlmReadiness();

    assert.equal(sttReadiness.category, 'stt');
    assert.equal(llmReadiness.category, 'llm');
    assert.notEqual(sttReadiness.modelId, llmReadiness.modelId);
  });

  await t.test('full pipeline check summarizes all missing components', async () => {
    const pipeline = await ModelReadinessService.checkFullPipelineReadiness();
    assert.ok(typeof pipeline.isReady === 'boolean');
    assert.ok(Array.isArray(pipeline.missingSummary));
  });
});

test('4. ModelDownloadService Subscription & Concurrency Safety', async (t) => {
  await t.test('allows subscribing and unsubscribing from download progress', () => {
    let capturedState: any = null;
    const unsubscribe = modelDownloadService.subscribe((state) => {
      capturedState = state;
    });

    assert.ok(capturedState);
    assert.equal(capturedState.status, 'idle');
    unsubscribe();
  });

  await t.test('cancelling download resets state cleanly', async () => {
    await modelDownloadService.cancelDownload();
    const state = modelDownloadService.getCurrentState();
    assert.equal(state.status, 'idle');
    assert.equal(state.modelId, null);
  });
});

test('5. Internal Model Service Utilities', async (t) => {
  const { DownloadSpeedTracker } = await import('../internal/downloadSpeedTracker');
  const { FsAdapter } = await import('../internal/fsAdapter');
  const { ModelArchiveExtractor } = await import('../internal/modelArchiveExtractor');

  await t.test('DownloadSpeedTracker clamps progress and tracks cumulative bytes', () => {
    const tracker = new DownloadSpeedTracker(1000);

    const snapshot1 = tracker.update(250);
    assert.equal(snapshot1.bytesDownloaded, 250);
    assert.equal(snapshot1.progressPercent, 25);

    tracker.addCompletedFileBytes(500);
    const snapshot2 = tracker.update(500);
    assert.equal(snapshot2.bytesDownloaded, 1000);
    assert.equal(snapshot2.progressPercent, 100);

    // Overflow protection: clamped to 100%
    const snapshotOverflow = tracker.update(1000);
    assert.equal(snapshotOverflow.progressPercent, 100);

    // Edge case: zero total bytes
    const zeroTracker = new DownloadSpeedTracker(0);
    const zeroSnapshot = zeroTracker.update(0);
    assert.equal(zeroSnapshot.progressPercent, 0);
  });

  await t.test('FsAdapter provides safe headless fallbacks in Node', async () => {
    const docDir = FsAdapter.getDocumentDirectory();
    assert.ok(docDir.length > 0);

    const freeStorage = await FsAdapter.getFreeDiskStorageAsync();
    assert.ok(freeStorage > 0);

    const info = await FsAdapter.getInfoAsync('/non/existent/path');
    assert.equal(info.exists, false);
    assert.equal(info.size, 0);
  });

  await t.test('ModelArchiveExtractor shares in-flight Promise and cleans up', async () => {
    const isExtractingBefore = ModelArchiveExtractor.isExtracting(
      '/path/archive.tar.bz2',
      '/target'
    );
    assert.equal(isExtractingBefore, false);

    // In Node test runner, extraction returns false, but concurrent calls must share the same Promise
    const [res1, res2] = await Promise.all([
      ModelArchiveExtractor.extractArchiveIfPossible('/path/archive.tar.bz2', '/target'),
      ModelArchiveExtractor.extractArchiveIfPossible('/path/archive.tar.bz2', '/target'),
    ]);

    assert.equal(res1, res2);

    // After completion, lock is released allowing subsequent attempts
    const isExtractingAfter = ModelArchiveExtractor.isExtracting(
      '/path/archive.tar.bz2',
      '/target'
    );
    assert.equal(isExtractingAfter, false);
  });
});
