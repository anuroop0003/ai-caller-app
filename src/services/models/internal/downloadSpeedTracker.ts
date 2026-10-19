export interface DownloadProgressSnapshot {
  readonly bytesDownloaded: number;
  readonly totalBytes: number;
  readonly progressPercent: number;
  readonly speedBytesPerSec?: number;
}

/**
 * Calculates smoothed download speed (bytes/sec) throttled at 500ms intervals
 * and progress percentage clamped to 0–100%.
 */
export class DownloadSpeedTracker {
  private cumulativeBytes = 0;
  private lastTimestamp = Date.now();
  private lastBytes = 0;
  private currentSpeedBytesPerSec?: number;

  constructor(private readonly totalBytes: number) {}

  /**
   * Registers a completed file's byte count into the cumulative progress.
   */
  addCompletedFileBytes(bytes: number): void {
    this.cumulativeBytes += Math.max(0, bytes);
  }

  /**
   * Updates in-flight progress for the active file being downloaded.
   */
  update(currentFileBytes: number): DownloadProgressSnapshot {
    const validFileBytes = Math.max(0, currentFileBytes);
    const currentTotal = this.cumulativeBytes + validFileBytes;
    const now = Date.now();
    const timeDiffSec = (now - this.lastTimestamp) / 1000;

    if (timeDiffSec >= 0.5) {
      this.currentSpeedBytesPerSec = Math.max(
        0,
        Math.round((currentTotal - this.lastBytes) / timeDiffSec)
      );
      this.lastTimestamp = now;
      this.lastBytes = currentTotal;
    }

    const safeTotal = Math.max(1, this.totalBytes);
    const rawPercent = Math.round((currentTotal / safeTotal) * 100);
    const progressPercent = Math.min(100, Math.max(0, rawPercent));

    return {
      bytesDownloaded: currentTotal,
      totalBytes: this.totalBytes,
      progressPercent,
      speedBytesPerSec: this.currentSpeedBytesPerSec,
    };
  }

  /**
   * Resets internal metrics back to starting conditions.
   */
  reset(): void {
    this.cumulativeBytes = 0;
    this.lastTimestamp = Date.now();
    this.lastBytes = 0;
    this.currentSpeedBytesPerSec = undefined;
  }
}
