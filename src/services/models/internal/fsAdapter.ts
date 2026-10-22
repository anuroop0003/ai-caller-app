export interface FileInfoResult {
  readonly exists: boolean;
  readonly size: number;
  readonly isDirectory: boolean;
}

export interface DownloadProgressData {
  readonly totalBytesWritten: number;
  readonly totalBytesExpectedToWrite?: number;
}

export interface DownloadResumableInstance {
  downloadAsync(): Promise<{ uri: string } | undefined>;
  cancelAsync(): Promise<void>;
}

/**
 * Narrow adapter around expo-file-system/legacy.
 * Encapsulates Node.js test-runner fallbacks and safe dynamic module resolution.
 */
export class FsAdapter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static cachedFs: any = null;

  static isAvailable(): boolean {
    return this.getFs() != null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static getFs(): any {
    if (this.cachedFs) return this.cachedFs;
    if (typeof process !== 'undefined' && Boolean(process.versions?.node)) {
      return null;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      this.cachedFs = require('expo-file-system/legacy');
      return this.cachedFs;
    } catch {
      return null;
    }
  }

  /**
   * Resolves base document directory with Android storage fallback strictly for Node.js test environments.
   */
  static getDocumentDirectory(): string {
    const fs = this.getFs();
    if (fs?.documentDirectory) {
      return fs.documentDirectory;
    }
    if (typeof process !== 'undefined' && Boolean(process.versions?.node)) {
      return '/data/user/0/com.anonymous.aicallerapp/files/';
    }
    throw new Error('[FsAdapter] Document directory is not accessible in this environment');
  }

  /**
   * Resolves cache directory for temporary files.
   */
  static getCacheDirectory(): string {
    const fs = this.getFs();
    if (fs?.cacheDirectory) {
      return fs.cacheDirectory;
    }
    if (typeof process !== 'undefined' && Boolean(process.versions?.node)) {
      return '/data/user/0/com.anonymous.aicallerapp/cache/';
    }
    return '';
  }

  /**
   * Queries free disk storage on the target device, defaulting to an 8 GB safety fallback.
   */
  static async getFreeDiskStorageAsync(): Promise<number> {
    const fs = this.getFs();
    try {
      if (typeof fs?.getFreeDiskStorageAsync === 'function') {
        return await fs.getFreeDiskStorageAsync();
      }
    } catch (err) {
      console.warn('[FsAdapter] Could not check free storage:', err);
    }
    return 8 * 1024 * 1024 * 1024;
  }

  /**
   * Queries file existence and metadata.
   */
  static async getInfoAsync(uri: string): Promise<FileInfoResult> {
    const fs = this.getFs();
    if (!fs) {
      return { exists: false, size: 0, isDirectory: false };
    }

    const cleanUri = uri.startsWith('file://') ? uri : `file://${uri}`;
    try {
      const info = await fs.getInfoAsync(cleanUri);
      return {
        exists: Boolean(info?.exists),
        size: info?.size ?? 0,
        isDirectory: Boolean(info?.isDirectory),
      };
    } catch {
      return { exists: false, size: 0, isDirectory: false };
    }
  }

  /**
   * Creates a directory recursively if it does not exist.
   */
  static async makeDirectoryAsync(
    uri: string,
    options?: { intermediates?: boolean }
  ): Promise<void> {
    const fs = this.getFs();
    if (!fs) return;
    await fs.makeDirectoryAsync(uri, options);
  }

  /**
   * Deletes a file or directory idempotently.
   */
  static async deleteAsync(uri: string, options?: { idempotent?: boolean }): Promise<void> {
    const fs = this.getFs();
    if (!fs) return;
    await fs.deleteAsync(uri, options);
  }

  /**
   * Moves a file from source to target path.
   */
  static async moveAsync(options: { from: string; to: string }): Promise<void> {
    const fs = this.getFs();
    if (!fs) {
      throw new Error('FileSystem module not available');
    }
    await fs.moveAsync(options);
  }

  /**
   * Reads file contents as string.
   */
  static async readAsStringAsync(uri: string): Promise<string> {
    const fs = this.getFs();
    if (!fs || typeof fs.readAsStringAsync !== 'function') {
      return '';
    }
    const cleanUri = uri.startsWith('file://') ? uri : `file://${uri}`;
    return await fs.readAsStringAsync(cleanUri);
  }

  /**
   * Writes string contents to a file.
   */
  static async writeAsStringAsync(uri: string, contents: string): Promise<void> {
    const fs = this.getFs();
    if (!fs || typeof fs.writeAsStringAsync !== 'function') {
      return;
    }
    const cleanUri = uri.startsWith('file://') ? uri : `file://${uri}`;
    await fs.writeAsStringAsync(cleanUri, contents);
  }

  /**
   * Creates an expo-file-system resumable download session.
   */
  static createDownloadResumable(
    url: string,
    fileUri: string,
    options: Record<string, unknown> = {},
    callback?: (progress: DownloadProgressData) => void
  ): DownloadResumableInstance {
    const fs = this.getFs();
    if (!fs || typeof fs.createDownloadResumable !== 'function') {
      throw new Error('createDownloadResumable is not supported in this environment');
    }
    return fs.createDownloadResumable(url, fileUri, options, callback);
  }
}
