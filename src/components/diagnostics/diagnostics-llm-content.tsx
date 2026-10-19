import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

import { DiagnosticsAlertBanner } from './diagnostics-alert-banner';
import {
  LlmActionButtons,
  LlmCallEngineBanner,
  LlmEnvironmentBanner,
  LlmHeader,
  LlmMetricsPanel,
  LlmPromptSection,
  LlmRuntimeTabs,
  MALAYALAM_LLM_PRESETS,
  type LlmPromptPreset,
  type SelectedEngineOption,
} from './llm';
import { MissingModelFilesCard, ModelDownloadProgress } from '@/components/models';
import { LLM_QWEN_0_5B_MODEL, LLM_QWEN_1_5B_MODEL } from '@/constants/models';
import { QWEN_2_5_0_5B_MODEL, QWEN_2_5_1_5B_MODEL } from '@/constants/llmModels';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useModelDownload } from '@/hooks/use-model-download';
import { useModelReadiness } from '@/hooks/use-model-readiness';
import { defaultDialogueEngine } from '@/services/dialogue/callerDialogueEngine';
import {
  checkNativeLlmAvailability,
  LlamaCppNativeRuntime,
  LocalLlmResponseGenerator,
  MockLlmRuntime,
} from '@/services/dialogue/llm';
import { ModelFileService } from '@/services/models';
import { callerStore } from '@/stores/callerStore';
import type { ILlmRuntime, LlmBenchmarkResult, LlmModelMetadata } from '@/types/llm';
import { formatFileSize } from '@/utils/format';

function buildChatMlPrompt(userText: string): string {
  return `<|im_start|>system\nനീ ഒരു മലയാളം AI കോൾ അസിസ്റ്റന്റാണ്. 1-2 വാചകത്തിൽ മാത്രം മറുപടി നൽകുക.\n<|im_end|>\n<|im_start|>user\n${userText.trim()}\n<|im_end|>\n<|im_start|>assistant\n`;
}

export function DiagnosticsLlmContent() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [selectedEngine, setSelectedEngine] = useState<SelectedEngineOption>('deterministic');
  const [useMockRuntime, setUseMockRuntime] = useState<boolean>(false);
  const [freeDiskSpaceMb, setFreeDiskSpaceMb] = useState<number>(0);
  const [selectedPreset, setSelectedPreset] = useState<LlmPromptPreset>(MALAYALAM_LLM_PRESETS[0]);
  const [inputText, setInputText] = useState<string>(MALAYALAM_LLM_PRESETS[0].prompt);
  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);
  const [benchmarkResult, setBenchmarkResult] = useState<LlmBenchmarkResult | null>(null);
  const [benchmarkError, setBenchmarkError] = useState<string | null>(null);
  const [activeCallEngineId, setActiveCallEngineId] = useState<string>(
    callerStore.getResponseGenerator().id
  );

  const nativeCheck = checkNativeLlmAvailability();

  // Model Package references for unified downloads and readiness
  const selectedUnifiedModel =
    selectedEngine === 'qwen_0_5b'
      ? LLM_QWEN_0_5B_MODEL
      : selectedEngine === 'qwen_1_5b'
        ? LLM_QWEN_1_5B_MODEL
        : null;

  const selectedModelMetadata: LlmModelMetadata | null =
    selectedEngine === 'qwen_0_5b'
      ? QWEN_2_5_0_5B_MODEL
      : selectedEngine === 'qwen_1_5b'
        ? QWEN_2_5_1_5B_MODEL
        : null;

  // Unified download & readiness state for selected LLM model
  const {
    isReady: isModelReady,
    status: readinessStatus,
    missingFiles,
    refreshReadiness,
  } = useModelReadiness(selectedUnifiedModel ?? LLM_QWEN_0_5B_MODEL);

  const { downloadState, startDownload, cancelDownload, isCurrentModelActive } = useModelDownload(
    selectedUnifiedModel?.id
  );

  // Load disk storage
  useEffect(() => {
    let isMounted = true;
    void ModelFileService.getFreeDiskStorageBytes().then((bytes) => {
      if (isMounted) {
        setFreeDiskSpaceMb(Math.round(bytes / (1024 * 1024)));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectPreset = (preset: LlmPromptPreset) => {
    setSelectedPreset(preset);
    setInputText(preset.prompt);
  };

  const handleDownloadModel = async () => {
    if (!selectedUnifiedModel) return;
    try {
      await startDownload(selectedUnifiedModel);
      await refreshReadiness();
    } catch (err) {
      setBenchmarkError(`Download failed: ${String(err)}`);
    }
  };

  /**
   * Run sequential benchmark:
   * 1. Release active RAM locks.
   * 2. Initialize runtime (native or mock).
   * 3. Run prompt and record TTFT, tok/s, latency.
   * 4. Unload runtime afterwards to restore device memory.
   */
  const runSequentialBenchmark = async () => {
    if (isBenchmarking) return;
    setIsBenchmarking(true);
    setBenchmarkResult(null);
    setBenchmarkError(null);

    const promptText = inputText.trim();
    if (!promptText) {
      setBenchmarkError('Please provide a Malayalam prompt utterance.');
      setIsBenchmarking(false);
      return;
    }

    if (selectedEngine === 'deterministic') {
      try {
        const startTime = Date.now();
        const res = await defaultDialogueEngine.generateResponse({
          userUtterance: promptText,
          history: [],
          scenario: 'appointment_scheduler',
          callId: 'bench_det',
        });
        const latencyMs = Math.max(1, Date.now() - startTime);

        setBenchmarkResult({
          modelId: 'deterministic-offline-v1',
          modelName: 'Deterministic Dialogue Engine',
          runtimeType: 'mock',
          prompt: promptText,
          response: res.replyText,
          loadTimeMs: 0,
          timeToFirstTokenMs: latencyMs,
          generationTimeMs: latencyMs,
          totalTurnaroundMs: latencyMs,
          tokensPerSecond: 1000,
          completionTokens: Math.max(1, Math.round(res.replyText.length / 3)),
          timestamp: Date.now(),
        });
      } catch (err) {
        setBenchmarkError(`Deterministic evaluation failed: ${String(err)}`);
      } finally {
        setIsBenchmarking(false);
      }
      return;
    }

    if (!selectedUnifiedModel || !selectedModelMetadata) {
      setIsBenchmarking(false);
      return;
    }

    const isRealNative = nativeCheck.available && !useMockRuntime;

    if (isRealNative && !isModelReady) {
      setBenchmarkError(
        `Model weights for ${selectedUnifiedModel.name} are not verified in storage. Please download them first.`
      );
      setIsBenchmarking(false);
      return;
    }

    let runtime: ILlmRuntime | null = null;
    try {
      const loadStart = Date.now();
      if (isRealNative) {
        runtime = new LlamaCppNativeRuntime();
        const localPath = ModelFileService.getFilePath(
          selectedUnifiedModel,
          selectedUnifiedModel.files[0].relativePath
        );
        await runtime.loadModel(selectedModelMetadata, localPath);
      } else {
        runtime = new MockLlmRuntime();
        await runtime.loadModel(selectedModelMetadata);
      }
      const loadTimeMs = Date.now() - loadStart;

      const formattedPrompt = buildChatMlPrompt(promptText);
      const genStart = Date.now();
      const result = await runtime.generate(formattedPrompt, {
        maxTokens: 40,
        temperature: 0.6,
        stopTokens: ['<|im_end|>', '<|endoftext|>'],
      });
      const totalTurnaroundMs = Date.now() - genStart;

      setBenchmarkResult({
        modelId: selectedUnifiedModel.id,
        modelName: selectedUnifiedModel.name,
        runtimeType: isRealNative ? 'native_llama_rn' : 'mock',
        prompt: promptText,
        response: result.text.trim(),
        loadTimeMs,
        timeToFirstTokenMs: result.metrics.timeToFirstTokenMs,
        generationTimeMs: result.metrics.totalGenerationTimeMs,
        totalTurnaroundMs,
        tokensPerSecond: result.metrics.tokensPerSecond,
        completionTokens: result.metrics.completionTokens,
        timestamp: Date.now(),
      });
    } catch (err) {
      setBenchmarkError(`Benchmark failed: ${String(err)}`);
    } finally {
      if (runtime) {
        await runtime.destroy().catch(() => {});
      }
      setIsBenchmarking(false);
    }
  };

  /**
   * Applies the selected configuration as the active response generator in callerStore.
   */
  const applyAsCallEngine = async () => {
    if (selectedEngine === 'deterministic') {
      callerStore.setResponseGenerator(defaultDialogueEngine);
      setActiveCallEngineId(defaultDialogueEngine.id);
      Alert.alert(
        'Call Engine Set',
        'Deterministic rule engine is now the active conversational engine for live calls.'
      );
      return;
    }

    if (!selectedUnifiedModel || !selectedModelMetadata) return;

    const isRealNative = nativeCheck.available && !useMockRuntime;
    const runtime: ILlmRuntime = isRealNative ? new LlamaCppNativeRuntime() : new MockLlmRuntime();

    if (isRealNative) {
      if (!isModelReady) {
        Alert.alert(
          'Model Not Downloaded',
          `Download ${selectedUnifiedModel.name} before setting as live call engine.`
        );
        return;
      }
      try {
        const localPath = ModelFileService.getFilePath(
          selectedUnifiedModel,
          selectedUnifiedModel.files[0].relativePath
        );
        await runtime.loadModel(selectedModelMetadata, localPath);
      } catch (err) {
        Alert.alert('Initialization Error', `Failed to load native model: ${String(err)}`);
        return;
      }
    } else {
      await runtime.loadModel(selectedModelMetadata);
    }

    const llmGenerator = new LocalLlmResponseGenerator({
      runtime,
      fallbackGenerator: defaultDialogueEngine,
      timeoutMs: 3500,
    });

    callerStore.setResponseGenerator(llmGenerator);
    setActiveCallEngineId(llmGenerator.id);

    Alert.alert(
      'Call Engine Set',
      `${selectedUnifiedModel.name} (${isRealNative ? 'Native' : 'Mock'}) is now the active response generator with 3.5s deterministic fallback.`
    );
  };

  const isActiveCallEngine =
    selectedEngine === 'deterministic'
      ? activeCallEngineId === 'deterministic-offline-v1'
      : activeCallEngineId === 'local_llm_generator';

  const isRealNative = nativeCheck.available && !useMockRuntime;
  const needsDownload = selectedEngine !== 'deterministic' && isRealNative && !isModelReady;

  const formattedModelSize = selectedUnifiedModel
    ? formatFileSize(selectedUnifiedModel.totalSizeBytes)
    : '';

  const engineHeaderConfig = {
    deterministic: {
      title: 'Deterministic Dialogue Engine',
      subtitle: 'Rule-Based Intent Matching • 0 MB RAM • Offline',
      icon: 'flash' as const,
      status: 'ready' as const,
      missingFilesCount: 0,
    },
    qwen_0_5b: {
      title: LLM_QWEN_0_5B_MODEL.name,
      subtitle: 'Q4_K_M • 468 MB • 2048 Context • Low RAM',
      icon: 'hardware-chip' as const,
      status: isCurrentModelActive ? ('downloading' as const) : readinessStatus,
      missingFilesCount: missingFiles.length,
    },
    qwen_1_5b: {
      title: LLM_QWEN_1_5B_MODEL.name,
      subtitle: 'Q4_K_M • 1.04 GB • High Fluency • >= 6GB RAM',
      icon: 'sparkles' as const,
      status: isCurrentModelActive ? ('downloading' as const) : readinessStatus,
      missingFilesCount: missingFiles.length,
    },
  }[selectedEngine];

  return (
    <View className="gap-3">
      {/* 1. Missing Model Files Guard (Matches STT and TTS Tabs) */}
      {selectedEngine !== 'deterministic' &&
        selectedUnifiedModel &&
        !isModelReady &&
        missingFiles.length > 0 && (
          <MissingModelFilesCard
            category="llm"
            modelName={selectedUnifiedModel.name}
            missingFiles={missingFiles}
          />
        )}

      {/* 2. Runtime Environment & Device Overview Banner (Matches Models Overview) */}
      <LlmEnvironmentBanner
        isRealNative={nativeCheck.available}
        useMockRuntime={useMockRuntime}
        freeDiskSpaceMb={freeDiskSpaceMb}
        onToggleMock={nativeCheck.available ? () => setUseMockRuntime(!useMockRuntime) : undefined}
      />

      {/* 3. Runtime Engine Selector Tabs (STT & TTS Tab-bar Theming) */}
      <LlmRuntimeTabs
        selectedEngine={selectedEngine}
        onSelectEngine={(engine) => {
          setSelectedEngine(engine);
          setBenchmarkResult(null);
          setBenchmarkError(null);
        }}
        disabled={isBenchmarking}
      />

      {/* 4. Benchmark Error Banner */}
      {benchmarkError ? (
        <DiagnosticsAlertBanner
          type="error"
          title="Benchmark Error"
          message={benchmarkError}
          onDismiss={() => setBenchmarkError(null)}
        />
      ) : null}

      {/* 5. Main Benchmark & Dialogue Card (Matches TtsBenchmarkCard & SampleCard) */}
      <View className="rounded-md p-4 border border-border bg-card gap-3 shadow-sm">
        <LlmHeader
          title={engineHeaderConfig.title}
          subtitle={engineHeaderConfig.subtitle}
          icon={engineHeaderConfig.icon}
          status={engineHeaderConfig.status}
          missingFilesCount={engineHeaderConfig.missingFilesCount}
        />

        {/* Download Progress Bar if active download */}
        {isCurrentModelActive && (
          <ModelDownloadProgress progressState={downloadState} onCancel={cancelDownload} />
        )}

        {/* Prompt Presets & Editable Input */}
        <LlmPromptSection
          selectedPresetId={selectedPreset.id}
          inputText={inputText}
          onSelectPreset={handleSelectPreset}
          onChangeText={setInputText}
          isDark={isDark}
          disabled={isBenchmarking}
        />

        {/* Metrics & Generation Output Panel */}
        <LlmMetricsPanel isBenchmarking={isBenchmarking} result={benchmarkResult} />

        {/* Action Buttons: Apply Engine + Run Sequential Turn / Download */}
        <LlmActionButtons
          isBenchmarking={isBenchmarking}
          canBenchmark={inputText.trim().length > 0 && (!needsDownload || !isRealNative)}
          isActiveCallEngine={isActiveCallEngine}
          isDownloading={isCurrentModelActive}
          needsDownload={needsDownload}
          downloadLabel={`Download (${formattedModelSize})`}
          onApplyCallEngine={applyAsCallEngine}
          onRunBenchmark={runSequentialBenchmark}
          onDownloadModel={handleDownloadModel}
        />
      </View>

      {/* 6. Active Live Call Engine Banner (Matches STT Tested Metric Summary) */}
      <LlmCallEngineBanner
        engineName={
          activeCallEngineId === 'deterministic-offline-v1'
            ? 'Deterministic Engine'
            : 'Local LLM (Qwen)'
        }
        engineType={
          activeCallEngineId === 'deterministic-offline-v1' ? 'Rule-Based' : 'Offline GGUF'
        }
      />
    </View>
  );
}
