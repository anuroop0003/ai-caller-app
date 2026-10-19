import { FsAdapter } from './fsAdapter';
import { RuntimeEnvironment } from './runtimeEnvironment';

/**
 * Handles tar.bz2 and tar archive extraction with native TurboModule fallbacks
 * and per-archive concurrency locking.
 */
export class ModelArchiveExtractor {
  private static inFlightExtractions = new Map<string, Promise<boolean>>();

  /**
   * Attempts to extract a compressed archive into the specified target directory.
   * If an extraction for the exact archive and target is already running, awaits that same task.
   */
  static async extractArchiveIfPossible(archivePath: string, targetDir: string): Promise<boolean> {
    const cleanArchive = archivePath.replace(/^file:\/\//, '');
    const cleanTarget = targetDir.replace(/^file:\/\//, '').replace(/\/+$/, '');
    const key = `${cleanArchive}->${cleanTarget}`;

    const existing = this.inFlightExtractions.get(key);
    if (existing) {
      return await existing;
    }

    const task = this.runExtraction(cleanArchive, cleanTarget, targetDir);
    this.inFlightExtractions.set(key, task);

    try {
      return await task;
    } finally {
      this.inFlightExtractions.delete(key);
    }
  }

  private static async runExtraction(
    cleanArchive: string,
    cleanTarget: string,
    targetDir: string
  ): Promise<boolean> {
    try {
      const dirInfo = await FsAdapter.getInfoAsync(targetDir);
      if (!dirInfo.exists) {
        await FsAdapter.makeDirectoryAsync(targetDir, { intermediates: true });
      }
    } catch {
      // Directory prepare fallback
    }

    if (!RuntimeEnvironment.isNode()) {
      // 1. Try react-native-sherpa-onnx/extraction subpath
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const extraction = require('react-native-sherpa-onnx/extraction');
        if (typeof extraction?.extractTarBz2 === 'function') {
          const res = await extraction.extractTarBz2(cleanArchive, cleanTarget, true);
          if (res?.success) {
            return true;
          }
        }
      } catch (err) {
        console.warn('[ModelArchiveExtractor] extraction.extractTarBz2 fallback:', err);
      }

      // 2. Try native TurboModule SherpaOnnx directly
      try {
        const sherpaNative = RuntimeEnvironment.getTurboModule('SherpaOnnx');
        if (sherpaNative && typeof sherpaNative.extractArchive === 'function') {
          const res = await sherpaNative.extractArchive(
            cleanArchive,
            cleanTarget,
            true,
            0,
            `extract_${Date.now()}`,
            false,
            null,
            null
          );
          if (res?.success) {
            return true;
          }
        }
      } catch (err) {
        console.warn('[ModelArchiveExtractor] TurboModule SherpaOnnx fallback:', err);
      }
    }

    return false;
  }

  /**
   * Checks whether an extraction operation is currently in-flight for this archive.
   */
  static isExtracting(archivePath: string, targetDir: string): boolean {
    const cleanArchive = archivePath.replace(/^file:\/\//, '');
    const cleanTarget = targetDir.replace(/^file:\/\//, '').replace(/\/+$/, '');
    return this.inFlightExtractions.has(`${cleanArchive}->${cleanTarget}`);
  }
}
