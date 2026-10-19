import { useCallback, useState } from 'react';

import { SpeechRecognitionService } from '@/services/speech';
import type { SttTranscriptionResult } from '@/types/speech';

export interface UseSpeechTranscriberResult {
  isTranscribing: boolean;
  transcription: SttTranscriptionResult | null;
  transcriptionLatencyMs: number | null;
  transcriptionError: string | null;
  transcribeAudio: (targetUri?: string) => Promise<void>;
  clearTranscription: () => void;
}

export function useSpeechTranscriber(sourceAudioUri: string | null): UseSpeechTranscriberResult {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<SttTranscriptionResult | null>(null);
  const [transcriptionLatencyMs, setTranscriptionLatencyMs] = useState<number | null>(null);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);

  const clearTranscription = useCallback(() => {
    setTranscription(null);
    setTranscriptionLatencyMs(null);
    setTranscriptionError(null);
  }, []);

  const transcribeAudio = useCallback(
    async (targetUri?: string) => {
      const uriToTranscribe = targetUri ?? sourceAudioUri;
      if (!uriToTranscribe) {
        setTranscriptionError('No recorded audio file found to transcribe.');
        return;
      }

      setIsTranscribing(true);
      setTranscriptionError(null);
      setTranscription(null);
      const startTime = Date.now();
      try {
        const result = await SpeechRecognitionService.transcribeRecordedAudio(uriToTranscribe);
        setTranscription(result);
        setTranscriptionLatencyMs(Date.now() - startTime);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setTranscriptionError(`Transcription failed: ${msg}`);
      } finally {
        setIsTranscribing(false);
      }
    },
    [sourceAudioUri]
  );

  return {
    isTranscribing,
    transcription,
    transcriptionLatencyMs,
    transcriptionError,
    transcribeAudio,
    clearTranscription,
  };
}
