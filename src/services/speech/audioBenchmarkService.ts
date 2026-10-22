import type { AudioTestSample } from '@/constants/audioTestSamples';
import { SpeechRecognitionService } from '@/services/speech/speechRecognitionService';
import type { SttTranscriptionResult } from '@/types/speech';

export interface BenchmarkRunResult {
  sample: AudioTestSample;
  transcription: SttTranscriptionResult;
  latencyMs: number;
  runAt: Date;
}

export class AudioBenchmarkService {
  /**
   * Resolves a bundled audio asset to an absolute filesystem path accessible by C++ native readers.
   */
  static async resolveSamplePath(sample: AudioTestSample): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Asset } = require('expo-asset');
    const [asset] = await Asset.loadAsync(sample.asset);
    const uri = asset.localUri || asset.uri;

    if (!uri) {
      throw new Error(`Unable to resolve filesystem URI for sample: ${sample.title}`);
    }

    return uri.startsWith('file://') ? decodeURI(uri.replace(/^file:\/\//, '')) : uri;
  }

  /**
   * Runs the STT recognition pipeline on the specified audio test sample and measures latency.
   */
  static async runBenchmark(sample: AudioTestSample): Promise<BenchmarkRunResult> {
    const { ModelReadinessService } = await import('@/services/models/modelReadinessService');
    const readiness = await ModelReadinessService.checkSttReadiness();
    if (!readiness.isReady) {
      throw new Error(
        `Required speech model is not ready. Missing files: ${readiness.missingFiles.join(', ') || 'model not downloaded'}`
      );
    }

    const filePath = await this.resolveSamplePath(sample);

    const startTime = performance.now();
    const result = await SpeechRecognitionService.transcribeFile(filePath);
    const endTime = performance.now();

    return {
      sample,
      transcription: result,
      latencyMs: Math.round(endTime - startTime),
      runAt: new Date(),
    };
  }
}
