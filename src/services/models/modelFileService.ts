import type { FileVerificationItem, UnifiedModelPackage } from '@/constants/models';

// Safely guard expo-file-system dynamic import to ensure node.js test runner doesn't fail
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedFs: any = null;
function getFs() {
  if (cachedFs) return cachedFs;
  if (typeof process !== 'undefined' && process.versions?.node) {
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedFs = require('expo-file-system/legacy');
    return cachedFs;
  } catch {
    return null;
  }
}

export class ModelFileService {
  /**
   * Resolves the app-private base storage directory.
   */
  static getBaseStorageDir(): string {
    const fs = getFs();
    return fs?.documentDirectory ?? '/data/user/0/com.anonymous.aicallerapp/files/';
  }

  /**
   * Resolves the app-private directory for a specific model package.
   */
  static getModelDir(model: UnifiedModelPackage): string {
    const base = this.getBaseStorageDir();
    const cleanTarget = model.targetDirectory.replace(/^\/+/, '').replace(/\/+$/, '');
    return `${base}${cleanTarget}/`;
  }

  /**
   * Resolves the full path to a file inside the model directory.
   */
  static getFilePath(model: UnifiedModelPackage, relativePath: string): string {
    return `${this.getModelDir(model)}${relativePath}`;
  }

  /**
   * Queries free disk storage on the device in bytes.
   */
  static async getFreeDiskStorageBytes(): Promise<number> {
    const fs = getFs();
    try {
      if (typeof fs?.getFreeDiskStorageAsync === 'function') {
        return await fs.getFreeDiskStorageAsync();
      }
    } catch (err) {
      console.warn('[ModelFileService] Could not check free storage:', err);
    }
    // Default fallback: 8 GB
    return 8 * 1024 * 1024 * 1024;
  }

  /**
   * Checks file existence, size, and validity in app-private storage.
   */
  static async checkFile(
    localPath: string,
    expectedSizeBytes: number
  ): Promise<{ exists: boolean; sizeBytes: number; isValidSize: boolean }> {
    const fs = getFs();
    if (!fs) {
      return { exists: false, sizeBytes: 0, isValidSize: false };
    }

    try {
      const cleanPath = localPath.startsWith('file://') ? localPath : `file://${localPath}`;
      const info = await fs.getInfoAsync(cleanPath);
      if (!info.exists) {
        return { exists: false, sizeBytes: 0, isValidSize: false };
      }

      const size = info.size ?? 0;
      // Accept file if within reasonable tolerance (or exact match, or config/json text size)
      const isConfigOrText = expectedSizeBytes < 100000;
      const isValidSize = isConfigOrText
        ? size > 0
        : expectedSizeBytes > 0
          ? size / expectedSizeBytes >= 0.98 && size / expectedSizeBytes <= 1.02
          : size > 0;

      return {
        exists: true,
        sizeBytes: size,
        isValidSize,
      };
    } catch {
      return { exists: false, sizeBytes: 0, isValidSize: false };
    }
  }

  /**
   * Verifies all required and optional files for a model package.
   */
  static async verifyModelFiles(model: UnifiedModelPackage): Promise<{
    isComplete: boolean;
    files: FileVerificationItem[];
    missingFiles: string[];
  }> {
    const results: FileVerificationItem[] = [];
    const missing: string[] = [];

    for (const spec of model.files) {
      const filePath = this.getFilePath(model, spec.relativePath);
      const status = await this.checkFile(filePath, spec.fileSizeBytes);

      // Check extracted folder if this entry is an archive (e.g. espeak-ng-data)
      let extractedExists = true;
      if (spec.isArchive && spec.extractedTargetDir) {
        const extractedDir = `${this.getModelDir(model)}${spec.extractedTargetDir}`;
        const fs = getFs();
        if (fs) {
          try {
            const dirInfo = await fs.getInfoAsync(extractedDir);
            extractedExists = dirInfo.exists && dirInfo.isDirectory;
          } catch {
            extractedExists = false;
          }
        }
      }

      const isValid = status.exists && status.isValidSize && (!spec.isArchive || extractedExists);

      results.push({
        filename: spec.filename,
        exists: status.exists,
        sizeBytes: status.sizeBytes,
        expectedSizeBytes: spec.fileSizeBytes,
        isValidSize: status.isValidSize,
        isRequired: spec.isRequired,
        localPath: filePath,
      });

      if (spec.isRequired && !isValid) {
        missing.push(spec.filename);
      }
    }

    return {
      isComplete: missing.length === 0,
      files: results,
      missingFiles: missing,
    };
  }

  /**
   * Safely deletes all files in the model package directory.
   */
  static async deleteModel(model: UnifiedModelPackage): Promise<void> {
    const fs = getFs();
    if (!fs) return;

    const modelDir = this.getModelDir(model);
    try {
      const info = await fs.getInfoAsync(modelDir);
      if (info.exists) {
        await fs.deleteAsync(modelDir, { idempotent: true });
      }
    } catch (err) {
      console.warn(`[ModelFileService] Failed to delete ${model.id}:`, err);
    }
  }
}
