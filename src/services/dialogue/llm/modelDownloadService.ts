/**
 * Re-exports canonical model download service for backward compatibility.
 * Canonical implementation lives in @/services/models/modelDownloadService.
 */

import { modelDownloadService } from '@/services/models/modelDownloadService';

export interface ModelFileStatus {
  isDownloaded: boolean;
  localPath: string;
  fileSizeBytes?: number;
  isValidSize: boolean;
}

export { modelDownloadService };
