import { useCallback, useRef, useState } from 'react';

import { DEFAULT_TTS_MODEL, MALAYALAM_TTS_PRESETS } from '@/constants/ttsModels';
import {
  TextToSpeechService,
  type TtsSynthesisResult,
} from '@/services/speech/textToSpeechService';

export interface UseTtsBenchmarkResult {
  selectedPresetId: string;
  inputText: string;
  isSynthesizing: boolean;
  synthesisError: string | null;
  lastResult: TtsSynthesisResult | null;
  selectPreset: (presetId: string) => void;
  updateInputText: (text: string) => void;
  synthesize: () => Promise<void>;
}

export function useTtsBenchmark(): UseTtsBenchmarkResult {
  const initialPreset = MALAYALAM_TTS_PRESETS[0];

  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPreset.id);
  const [inputText, setInputText] = useState<string>(initialPreset.text);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesisError, setSynthesisError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<TtsSynthesisResult | null>(null);

  // Synchronous lock to prevent rapid tap race conditions
  const isExecutingRef = useRef<boolean>(false);

  const selectPreset = useCallback((presetId: string) => {
    const preset = MALAYALAM_TTS_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;

    setSelectedPresetId(preset.id);
    setInputText(preset.text);
    setSynthesisError(null);
  }, []);

  const updateInputText = useCallback((text: string) => {
    setInputText(text);
    setSelectedPresetId('');
    setSynthesisError(null);
  }, []);

  const synthesize = useCallback(async () => {
    const textToSpeak = inputText.trim();
    if (!textToSpeak || isExecutingRef.current) return;

    isExecutingRef.current = true;
    setIsSynthesizing(true);
    setSynthesisError(null);

    try {
      const result = await TextToSpeechService.synthesize(textToSpeak, {
        model: DEFAULT_TTS_MODEL,
        speed: 1.0,
      });
      setLastResult(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setSynthesisError(message);
    } finally {
      isExecutingRef.current = false;
      setIsSynthesizing(false);
    }
  }, [inputText]);

  return {
    selectedPresetId,
    inputText,
    isSynthesizing,
    synthesisError,
    lastResult,
    selectPreset,
    updateInputText,
    synthesize,
  };
}
