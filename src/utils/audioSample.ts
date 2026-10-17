import * as FileSystem from 'expo-file-system/legacy';

/**
 * Creates a valid 16kHz mono 16-bit PCM WAV audio file for offline STT verification.
 */
export async function createTestWaveFile(): Promise<string> {
  const filePath = `${FileSystem.cacheDirectory}test_sample_16k.wav`;

  // Sample Rate: 16000, 1 channel (mono), 16 bits per sample
  const sampleRate = 16000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const durationSec = 1.0;
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataByteLength = numSamples * numChannels * (bitsPerSample / 8);

  const buffer = new ArrayBuffer(44 + dataByteLength);
  const view = new DataView(buffer);

  // RIFF Chunk Descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataByteLength, true);
  writeString(view, 8, 'WAVE');

  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true); // ByteRate
  view.setUint16(32, numChannels * (bitsPerSample / 8), true); // BlockAlign
  view.setUint16(34, bitsPerSample, true);

  // "data" sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataByteLength, true);

  // Generate 440Hz tone with gentle fade for testing
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * 440 * t) * 0.4 * 32767;
    view.setInt16(offset, Math.floor(sample), true);
    offset += 2;
  }

  // Convert to base64
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  await FileSystem.writeAsStringAsync(filePath, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return filePath.startsWith('file://') ? filePath.replace(/^file:\/\//, '') : filePath;
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
