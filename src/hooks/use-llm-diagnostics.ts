import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import {
  LLM_TEST_PROMPTS,
  type LlmPromptPreset,
} from '@/components/diagnostics/llm/llm-prompt-section';
import {
  AVAILABLE_LLM_MODELS,
  DEFAULT_LLM_MODEL,
  toLlmMetadata,
  type UnifiedModelPackage,
} from '@/constants/models';
import { useModelDownload } from '@/hooks/use-model-download';
import { useModelReadiness } from '@/hooks/use-model-readiness';
import { checkNativeLlmAvailability, LlmBenchmarkService } from '@/services/dialogue/llm';
import { ModelFileService } from '@/services/models';
import type { LlmBenchmarkResult, LlmModelMetadata } from '@/types/llm';
import { formatFileSize } from '@/utils/format';

export interface LlmModelCardState {
  model: UnifiedModelPackage;
  metadata: LlmModelMetadata;
  selectedPreset: LlmPromptPreset;
  inputText: string;
  isBenchmarking: boolean;
  benchmarkResult: LlmBenchmarkResult | null;
  benchmarkError: string | null;
  isModelReady: boolean;
  readinessStatus: string;
  missingFiles: readonly string[];
  downloadState: ReturnType<typeof useModelDownload>['downloadState'];
  isDownloading: boolean;
  isActiveCallEngine: boolean;
  onSelectPreset: (preset: LlmPromptPreset) => void;
  onChangeInputText: (text: string) => void;
  onRunBenchmark: () => Promise<void>;
  onApplyCallEngine: () => Promise<void>;
  onCancelDownload: () => Promise<void>;
  onDismissError: () => void;
}

export interface UseLlmDiagnosticsResult {
  availableModels: readonly UnifiedModelPackage[];
  allMissingFiles: readonly string[];
  isCheckingInitialReadiness: boolean;
  modelCards: readonly LlmModelCardState[];
  benchmarkingModelId: string | null;
  activeCallerModelId: string | null;
  useMockRuntime: boolean;
  setUseMockRuntime: (useMock: boolean) => void;
  freeDiskSpaceMb: number;
  nativeCheck: { available: boolean; runtimeType: string; reason?: string };
}

export function useLlmDiagnostics(): UseLlmDiagnosticsResult {
  const [useMockRuntime, setUseMockRuntime] = useState<boolean>(false);
  const [freeDiskSpaceMb, setFreeDiskSpaceMb] = useState<number>(0);
  const [benchmarkingModelId, setBenchmarkingModelId] = useState<string | null>(null);
  const [activeCallerModelId, setActiveCallerModelId] = useState<string | null>(
    LlmBenchmarkService.getActiveCallerModelId()
  );

  // Canonical LLM models
  const model05b = AVAILABLE_LLM_MODELS[0] ?? DEFAULT_LLM_MODEL;
  const model15b = AVAILABLE_LLM_MODELS[1] ?? DEFAULT_LLM_MODEL;

  // Independent readiness evaluation for both models
  const readiness05b = useModelReadiness(model05b);
  const readiness15b = useModelReadiness(model15b);

  // Independent download controllers for both models
  const download05b = useModelDownload(model05b.id);
  const download15b = useModelDownload(model15b.id);

  // Prompt and preset state per model
  const [promptStates, setPromptStates] = useState<
    Record<string, { preset: LlmPromptPreset; text: string }>
  >({
    [model05b.id]: { preset: LLM_TEST_PROMPTS[0], text: LLM_TEST_PROMPTS[0].prompt },
    [model15b.id]: { preset: LLM_TEST_PROMPTS[0], text: LLM_TEST_PROMPTS[0].prompt },
  });

  // Benchmark results and errors per model
  const [benchmarkResults, setBenchmarkResults] = useState<
    Record<string, LlmBenchmarkResult | null>
  >({
    [model05b.id]: null,
    [model15b.id]: null,
  });

  const [benchmarkErrors, setBenchmarkErrors] = useState<Record<string, string | null>>({
    [model05b.id]: null,
    [model15b.id]: null,
  });

  const nativeCheck = checkNativeLlmAvailability();

  const allMissingFiles = Array.from(
    new Set([...readiness05b.missingFiles, ...readiness15b.missingFiles])
  );

  const isCheckingInitialReadiness =
    readiness05b.isCheckingInitialReadiness || readiness15b.isCheckingInitialReadiness;

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

  const handleSelectPreset = (modelId: string, preset: LlmPromptPreset) => {
    setPromptStates((prev) => {
      const current = prev[modelId] ?? { preset: LLM_TEST_PROMPTS[0], text: '' };
      let newText = preset.prompt;
      if (preset.id === 'custom') {
        if (LLM_TEST_PROMPTS.some((p) => p.id !== 'custom' && p.prompt === current.text)) {
          newText = '';
        } else {
          newText = current.text;
        }
      }
      return {
        ...prev,
        [modelId]: { preset, text: newText },
      };
    });
  };

  const handleInputChange = (modelId: string, text: string) => {
    setPromptStates((prev) => ({
      ...prev,
      [modelId]: {
        preset: prev[modelId]?.preset ?? LLM_TEST_PROMPTS[0],
        text,
      },
    }));
  };

  const clearBenchmarkError = (modelId: string) => {
    setBenchmarkErrors((prev) => ({ ...prev, [modelId]: null }));
  };

  const handleRunBenchmark = async (model: UnifiedModelPackage) => {
    if (benchmarkingModelId) return;

    const promptText = (promptStates[model.id]?.text ?? '').trim();
    if (!promptText) {
      setBenchmarkErrors((prev) => ({
        ...prev,
        [model.id]: 'Please provide a prompt utterance to test.',
      }));
      return;
    }

    const isRealNative = nativeCheck.available && !useMockRuntime;
    const modelReadiness = model.id === model05b.id ? readiness05b : readiness15b;

    if (isRealNative && !modelReadiness.isReady) {
      setBenchmarkErrors((prev) => ({
        ...prev,
        [model.id]: `Model weights for ${model.name} are not verified in storage. Please download them first.`,
      }));
      return;
    }

    setBenchmarkingModelId(model.id);
    setBenchmarkResults((prev) => ({ ...prev, [model.id]: null }));
    setBenchmarkErrors((prev) => ({ ...prev, [model.id]: null }));

    try {
      const result = await LlmBenchmarkService.runLlmBenchmark({
        model,
        metadata: toLlmMetadata(model),
        isRealNative,
        prompt: promptText,
      });
      setBenchmarkResults((prev) => ({ ...prev, [model.id]: result }));
    } catch (err) {
      setBenchmarkErrors((prev) => ({
        ...prev,
        [model.id]: `Benchmark failed: ${String(err)}`,
      }));
    } finally {
      setBenchmarkingModelId(null);
    }
  };

  const handleApplyAsCallEngine = async (model: UnifiedModelPackage) => {
    const isRealNative = nativeCheck.available && !useMockRuntime;
    const modelReadiness = model.id === model05b.id ? readiness05b : readiness15b;

    if (isRealNative && !modelReadiness.isReady) {
      Alert.alert(
        'Model Missing',
        `Please download ${model.name} (${formatFileSize(model.totalSizeBytes)}) first before activating it for live phone calls.`
      );
      return;
    }

    try {
      await LlmBenchmarkService.activateCallerLlmEngine(model, toLlmMetadata(model), isRealNative);
      setActiveCallerModelId(LlmBenchmarkService.getActiveCallerModelId());
      Alert.alert(
        'LLM Call Engine Active',
        `Successfully switched live phone dialogue engine to ${model.name}.`
      );
    } catch (err) {
      Alert.alert(
        'Engine Activation Failed',
        `Unable to initialize LLM for phone calls: ${String(err)}`
      );
    }
  };

  const handleCancelDownload = async (modelId: string) => {
    if (modelId === model05b.id) {
      await download05b.cancelDownload();
    } else {
      await download15b.cancelDownload();
    }
  };

  // Build presentation card state for each model
  const modelCards: readonly LlmModelCardState[] = AVAILABLE_LLM_MODELS.map((model) => {
    const is05b = model.id === model05b.id;
    const readiness = is05b ? readiness05b : readiness15b;
    const download = is05b ? download05b : download15b;
    const promptState = promptStates[model.id] ?? {
      preset: LLM_TEST_PROMPTS[0],
      text: LLM_TEST_PROMPTS[0].prompt,
    };
    const isRealNative = nativeCheck.available && !useMockRuntime;
    const isModelReady = !isRealNative || readiness.isReady;

    return {
      model,
      metadata: toLlmMetadata(model),
      selectedPreset: promptState.preset,
      inputText: promptState.text,
      isBenchmarking: benchmarkingModelId === model.id,
      benchmarkResult: benchmarkResults[model.id] ?? null,
      benchmarkError: benchmarkErrors[model.id] ?? null,
      isModelReady,
      readinessStatus: readiness.status,
      missingFiles: readiness.missingFiles,
      downloadState: download.downloadState,
      isDownloading: download.isCurrentModelActive,
      isActiveCallEngine: activeCallerModelId === model.id,
      onSelectPreset: (preset) => handleSelectPreset(model.id, preset),
      onChangeInputText: (text) => handleInputChange(model.id, text),
      onRunBenchmark: () => handleRunBenchmark(model),
      onApplyCallEngine: () => handleApplyAsCallEngine(model),
      onCancelDownload: () => handleCancelDownload(model.id),
      onDismissError: () => clearBenchmarkError(model.id),
    };
  });

  return {
    availableModels: AVAILABLE_LLM_MODELS,
    allMissingFiles,
    isCheckingInitialReadiness,
    modelCards,
    benchmarkingModelId,
    activeCallerModelId,
    useMockRuntime,
    setUseMockRuntime,
    freeDiskSpaceMb,
    nativeCheck,
  };
}
