import { useCallback, useState } from 'react';

import * as FileSystem from 'expo-file-system/legacy';

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

export function useSpeechTranscriber(
  sourceAudioUri: string | null
): UseSpeechTranscriberResult {
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

      // Clean URI schemes for native filesystem reader
      const cleanInputPath = uriToTranscribe.startsWith('file://')
        ? decodeURI(uriToTranscribe.replace(/^file:\/\//, ''))
        : uriToTranscribe;

      const tempWavPath = `${FileSystem.cacheDirectory}rec_16k_${Date.now()}.wav`;
      const cleanOutputPath = tempWavPath.startsWith('file://')
        ? decodeURI(tempWavPath.replace(/^file:\/\//, ''))
        : tempWavPath;

      try {
        // Ensure on-device neural engine is initialized
        await SpeechRecognitionService.initialize();

        let result: SttTranscriptionResult;

        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const sherpaAudio = require('react-native-sherpa-onnx/audio');
          if (typeof sherpaAudio?.convertAudioToWav16k === 'function') {
            await sherpaAudio.convertAudioToWav16k(cleanInputPath, cleanOutputPath);
            result = await SpeechRecognitionService.transcribeFile(cleanOutputPath);
          } else {
            throw new Error('Native audio conversion unavailable.');
          }
        } catch (convErr) {
          // Fallback: try direct PCM float samples decoding
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const sherpaAudio = require('react-native-sherpa-onnx/audio');
          if (typeof sherpaAudio?.decodeAudioFileToFloatSamples === 'function') {
            const decoded = await sherpaAudio.decodeAudioFileToFloatSamples(cleanInputPath, 16000);
            result = await SpeechRecognitionService.transcribeSamples(
              decoded.samples,
              decoded.sampleRate || 16000
            );
          } else {
            throw convErr;
          }
        }

        setTranscription(result);
        setTranscriptionLatencyMs(Date.now() - startTime);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setTranscriptionError(`Transcription failed: ${msg}`);
      } finally {
        setIsTranscribing(false);
        // Clean up temporary 16kHz WAV file
        try {
          const fileInfo = await FileSystem.getInfoAsync(tempWavPath);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(tempWavPath, { idempotent: true });
          }
        } catch {
          // Ignore deletion failure
        }
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
