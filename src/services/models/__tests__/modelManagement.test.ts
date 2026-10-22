import assert from 'node:assert/strict';
import test from 'node:test';

import {
  LLM_QWEN_0_5B_MODEL,
  LLM_QWEN_1_5B_MODEL,
  QWEN_2_5_0_5B_MODEL,
  STT_INDIC_CONFORMER_MODEL,
  TTS_ANDROID_SYSTEM_MODEL,
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
    assert.ok(ids.includes('android-system-tts'));
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
    assert.equal(defaultTts.id, TTS_ANDROID_SYSTEM_MODEL.id);

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

test('6. Model Lifecycle, Coordinated Deletion & Readiness Synchronization', async (t) => {
  const { SpeechRecognitionService } = await import('@/services/speech/speechRecognitionService');

  await t.test(
    'SpeechRecognitionService.initialize rejects and prevents execution when model files are missing on disk',
    async () => {
      // In Node test runner without downloaded files, initialization must fail cleanly
      await assert.rejects(
        () => SpeechRecognitionService.initialize(),
        /Required STT model files.*are missing on disk/
      );
    }
  );

  await t.test(
    'ModelReadinessService.checkTtsReadiness reports ready for Android System TTS',
    async () => {
      const readiness = await ModelReadinessService.checkTtsReadiness();
      assert.equal(readiness.isReady, true);
      assert.equal(readiness.category, 'tts');
      assert.equal(readiness.status, 'ready');
    }
  );

  await t.test(
    'ModelFileService.deleteModel unloads STT engine and broadcasts readiness invalidation',
    async () => {
      let notifiedModelId: string | undefined;
      const unsubscribe = ModelReadinessService.subscribe((modelId) => {
        notifiedModelId = modelId;
      });

      try {
        await ModelFileService.deleteModel(STT_INDIC_CONFORMER_MODEL);
        assert.equal(notifiedModelId, STT_INDIC_CONFORMER_MODEL.id);
      } finally {
        unsubscribe();
      }
    }
  );

  await t.test(
    'ModelFileService.deleteModel unloads LLM generator and calls destroy on active runtime',
    async () => {
      const { callerStore } = await import('@/stores/callerStore');
      const { LlmBenchmarkService } = await import('@/services/dialogue/llm');

      let wasRuntimeDestroyed = false;
      const mockRuntime = {
        runtimeType: 'mock' as const,
        isInitialized: () => true,
        getActiveModel: () => QWEN_2_5_0_5B_MODEL,
        loadModel: async () => {},
        generate: async () => ({
          text: 'test',
          metrics: {
            timeToFirstTokenMs: 10,
            totalGenerationTimeMs: 20,
            promptTokens: 5,
            completionTokens: 5,
            tokensPerSecond: 250,
          },
        }),
        stopGeneration: async () => {},
        destroy: async () => {
          wasRuntimeDestroyed = true;
        },
      };

      const { LocalLlmResponseGenerator } = await import('@/services/dialogue/llm');
      const generator = new LocalLlmResponseGenerator({ runtime: mockRuntime });
      callerStore.setResponseGenerator(generator);
      assert.equal(callerStore.getResponseGenerator().id, 'local_llm_generator');

      await ModelFileService.deleteModel(LLM_QWEN_0_5B_MODEL);

      assert.equal(wasRuntimeDestroyed, true);
      assert.equal(callerStore.getResponseGenerator().id, 'deterministic-offline-v1');
    }
  );
});

test('7. Diagnostics Prerequisite & Lifecycle Protection', async (t) => {
  const { AudioBenchmarkService } = await import('@/services/speech/audioBenchmarkService');

  await t.test(
    'AudioBenchmarkService.runBenchmark rejects before execution when STT model files are absent',
    async () => {
      const mockSample = {
        id: 'test-sample',
        title: 'Mock Sample',
        asset: 1,
        language: 'Malayalam',
        languageCode: 'ml' as const,
        speakerGender: 'male' as const,
        speakerLabel: 'Speaker',
        durationSeconds: 1.5,
        durationLabel: '1.5s',
        description: 'Mock audio test sample',
        transcript: 'നമസ്കാരം',
        category: 'conversational' as const,
      };

      await assert.rejects(
        () => AudioBenchmarkService.runBenchmark(mockSample),
        /Required speech model is not ready/
      );
    }
  );
});

test('8. LlmBenchmarkService Decoupled Orchestration & Prompting', async (t) => {
  const { LlmBenchmarkService, buildChatMlPrompt } = await import('@/services/dialogue/llm');

  await t.test('buildChatMlPrompt generates valid ChatML markers', () => {
    const prompt = buildChatMlPrompt('നമസ്കാരം');
    assert.ok(prompt.includes('<|im_start|>system'));
    assert.ok(prompt.includes('<|im_start|>user\nനമസ്കാരം\n<|im_end|>'));
    assert.ok(prompt.endsWith('<|im_start|>assistant\n'));
  });

  await t.test('runDeterministicBenchmark produces valid result and metrics', async () => {
    const result = await LlmBenchmarkService.runDeterministicBenchmark('ഡോക്ടറെ കാണണം');
    assert.equal(result.modelId, 'deterministic-offline-v1');
    assert.ok(result.response.length > 0);
    assert.ok(result.totalTurnaroundMs >= 0);
    assert.ok(result.tokensPerSecond > 0);
  });

  await t.test('runLlmBenchmark executes mock runtime and cleans up resources', async () => {
    const result = await LlmBenchmarkService.runLlmBenchmark({
      model: LLM_QWEN_0_5B_MODEL,
      metadata: QWEN_2_5_0_5B_MODEL,
      isRealNative: false,
      prompt: 'ഹലോ',
    });

    assert.equal(result.modelId, LLM_QWEN_0_5B_MODEL.id);
    assert.equal(result.runtimeType, 'mock');
    assert.ok(result.response.length > 0);
    assert.ok(result.completionTokens > 0);
  });

  await t.test('canonical AVAILABLE_LLM_MODELS contains valid Qwen packages', async () => {
    const { AVAILABLE_LLM_MODELS, toLlmMetadata } = await import('@/constants/models');
    assert.equal(AVAILABLE_LLM_MODELS.length, 2);

    for (const model of AVAILABLE_LLM_MODELS) {
      assert.equal(model.category, 'llm');
      assert.ok(model.files.length > 0);
      assert.ok(model.files[0].relativePath.endsWith('.gguf'));

      const meta = toLlmMetadata(model);
      assert.equal(meta.id, model.id);
      assert.equal(meta.architecture, 'qwen2.5');
      assert.equal(meta.quantization, 'q4_k_m');
    }
  });
});

test('9. Diagnostics Skeletons & Readiness Cache Transitions', async (t) => {
  const { ModelReadinessService, ModelRegistry } = await import('@/services/models');

  await t.test(
    'ModelReadinessService caches evaluated result and evicts on notification',
    async () => {
      const sttModel = ModelRegistry.getDefaultModel('stt');

      // 1. Evict any previous cache
      ModelReadinessService.clearCache(sttModel.id);
      assert.equal(ModelReadinessService.getCachedReadiness(sttModel.id), null);

      // 2. Perform check
      const checked = await ModelReadinessService.checkModelReadiness(sttModel);
      assert.ok(checked);

      // 3. Cache must now be populated
      const cached = ModelReadinessService.getCachedReadiness(sttModel.id);
      assert.ok(cached);
      assert.equal(cached.modelId, sttModel.id);

      // 4. Invalidate via notification
      ModelReadinessService.notifyModelChanged(sttModel.id);
      assert.equal(ModelReadinessService.getCachedReadiness(sttModel.id), null);
    }
  );

  await t.test(
    'ModelReadinessService caches TTS readiness synchronously without file checks',
    async () => {
      const ttsModel = ModelRegistry.getDefaultModel('tts');
      ModelReadinessService.clearCache(ttsModel.id);

      const checked = await ModelReadinessService.checkModelReadiness(ttsModel);
      assert.equal(checked.isReady, true);
      assert.equal(checked.status, 'ready');

      const cached = ModelReadinessService.getCachedReadiness(ttsModel.id);
      assert.ok(cached);
      assert.equal(cached.isReady, true);
    }
  );

  await t.test(
    'ModelReadinessService caches LLM readiness and clears globally on notifyModelChanged without id',
    async () => {
      const llmModel = ModelRegistry.getDefaultModel('llm');

      const checked = await ModelReadinessService.checkModelReadiness(llmModel);
      assert.ok(checked);
      assert.ok(ModelReadinessService.getCachedReadiness(llmModel.id));

      // Global cache invalidation
      ModelReadinessService.notifyModelChanged();
      assert.equal(ModelReadinessService.getCachedReadiness(llmModel.id), null);
    }
  );

  await t.test(
    'Successful model download invalidates readiness cache and causes a recheck',
    async () => {
      const llmModel = ModelRegistry.getDefaultModel('llm');

      // 1. Initial readiness check caches missing status
      const initial = await ModelReadinessService.checkModelReadiness(llmModel);
      assert.equal(initial.status, 'not_downloaded');
      assert.ok(ModelReadinessService.getCachedReadiness(llmModel.id));

      // 2. Track readiness invalidation notification
      let notifiedId: string | undefined = undefined;
      const unsub = ModelReadinessService.subscribe((id) => {
        notifiedId = id;
      });

      try {
        // 3. Simulating download completion: ModelReadinessService.notifyModelChanged is triggered
        ModelReadinessService.notifyModelChanged(llmModel.id);
        assert.equal(notifiedId, llmModel.id);

        // 4. Cache must be completely evicted
        assert.equal(ModelReadinessService.getCachedReadiness(llmModel.id), null);

        // 5. Subsequent call executes a real re-check rather than returning stale cache
        const recheck = await ModelReadinessService.checkModelReadiness(llmModel);
        assert.ok(recheck);
        assert.equal(recheck.modelId, llmModel.id);
      } finally {
        unsub();
      }
    }
  );

  await t.test(
    'Cancelled and failed downloads do not incorrectly mark a model as ready',
    async () => {
      const { modelDownloadService } = await import('@/services/models');
      const llmModel = ModelRegistry.getDefaultModel('llm');

      // 1. Cancelled download check
      await modelDownloadService.cancelDownload();
      const afterCancel = await ModelReadinessService.checkModelReadiness(llmModel);
      assert.equal(afterCancel.isReady, false);
      assert.notEqual(afterCancel.status, 'ready');

      // 2. Failed download check (mock assertStorageAvailable failure)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const downloadServiceAny = modelDownloadService as any;
      const originalAssert = downloadServiceAny.assertStorageAvailable;
      downloadServiceAny.assertStorageAvailable = async () => {
        throw new Error('Disk full simulation');
      };

      try {
        const success = await modelDownloadService.downloadModel(llmModel);
        assert.equal(success, false);
        assert.equal(modelDownloadService.getCurrentState().status, 'error');

        // After failure, readiness check must still report unready
        const afterFailure = await ModelReadinessService.checkModelReadiness(llmModel);
        assert.equal(afterFailure.isReady, false);
        assert.notEqual(afterFailure.status, 'ready');
      } finally {
        downloadServiceAny.assertStorageAvailable = originalAssert;
      }
    }
  );

  await t.test(
    'Unexpected filesystem exceptions produce failure result without unhandled rejections in pipeline',
    async () => {
      const { ModelFileService } = await import('@/services/models');

      const originalVerify = ModelFileService.verifyModelFiles;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ModelFileService as any).verifyModelFiles = async () => {
        throw new Error('EIO: hardware disk I/O failure');
      };

      try {
        // Full pipeline check aggregate operation must NOT reject with unhandled rejection
        const pipeline = await ModelReadinessService.checkFullPipelineReadiness();
        assert.equal(pipeline.isReady, false);
        assert.equal(pipeline.stt.status, 'failed');
        assert.ok(pipeline.stt.errorMessage?.includes('hardware disk I/O failure'));
        assert.equal(pipeline.llm.status, 'failed');
        assert.ok(pipeline.missingSummary.includes('STT (Speech Recognition)'));
      } finally {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ModelFileService as any).verifyModelFiles = originalVerify;
      }
    }
  );

  await t.test(
    'Transient filesystem errors are not cached as confirmed missing models',
    async () => {
      const { ModelFileService } = await import('@/services/models');
      const llmModel = ModelRegistry.getDefaultModel('llm');

      // Ensure cache is clear
      ModelReadinessService.clearCache(llmModel.id);
      assert.equal(ModelReadinessService.getCachedReadiness(llmModel.id), null);

      // 1. Transient failure occurs during filesystem read
      const originalVerify = ModelFileService.verifyModelFiles;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ModelFileService as any).verifyModelFiles = async () => {
        throw new Error('EBUSY: resource temporarily unavailable');
      };

      try {
        const failedCheck = await ModelReadinessService.checkModelReadiness(llmModel);
        assert.equal(failedCheck.status, 'failed');
        assert.equal(failedCheck.isReady, false);

        // 2. CRITICAL: Cache must NOT have retained this transient failure as a permanent missing model
        assert.equal(
          ModelReadinessService.getCachedReadiness(llmModel.id),
          null,
          'Transient error must not be cached'
        );
      } finally {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ModelFileService as any).verifyModelFiles = originalVerify;
      }

      // 3. Transient error resolved: next check returns genuine state and caches it
      const recoveredCheck = await ModelReadinessService.checkModelReadiness(llmModel);
      assert.equal(recoveredCheck.status, 'not_downloaded');
      assert.equal(
        ModelReadinessService.getCachedReadiness(llmModel.id)?.status,
        'not_downloaded',
        'Genuine missing model state is now cached'
      );
    }
  );
});
