import { useCallback, useState } from 'react';

import { SpeechRecognitionService } from '@/services/speech';
import type { SttTranscriptionResult } from '@/types/speech';
import { createTestWaveFile } from '@/utils/audioSample';

export interface QuickDiagnosticTestState {
  isTestingEngine: boolean;
  testResult: SttTranscriptionResult | null;
  testError: string | null;
  runDiagnosticTest: () => Promise<void>;
  resetDiagnosticTest: () => void;
}

/**
 * Hook to execute and manage quick on-device Sherpa-ONNX STT engine diagnostics.
 * Reuses the existing synthetic 16kHz WAV generator and speech recognition service.
 */
export function useQuickDiagnosticTest(): QuickDiagnosticTestState {
  const [isTestingEngine, setIsTestingEngine] = useState(false);
  const [testResult, setTestResult] = useState<SttTranscriptionResult | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const resetDiagnosticTest = useCallback(() => {
    setTestResult(null);
    setTestError(null);
  }, []);

  const runDiagnosticTest = useCallback(async () => {
    if (isTestingEngine) {
      return;
    }

    setIsTestingEngine(true);
    setTestError(null);
    setTestResult(null);

    try {
      const sampleWavPath = await createTestWaveFile();
      const result = await SpeechRecognitionService.transcribeFile(sampleWavPath);
      setTestResult(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setTestError(message);
    } finally {
      setIsTestingEngine(false);
    }
  }, [isTestingEngine]);

  return {
    isTestingEngine,
    testResult,
    testError,
    runDiagnosticTest,
    resetDiagnosticTest,
  };
}
