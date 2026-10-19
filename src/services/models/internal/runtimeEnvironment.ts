/**
 * Centralized platform, runtime, and native module availability probes.
 * Pure capability detection; does not contain model readiness business logic.
 */
export class RuntimeEnvironment {
  static isNode(): boolean {
    return typeof process !== 'undefined' && Boolean(process.versions?.node);
  }

  static getPlatformOS(): string {
    if (this.isNode()) return 'node';
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('react-native').Platform?.OS ?? 'unknown';
    } catch {
      return 'unknown';
    }
  }

  static isWeb(): boolean {
    return this.getPlatformOS() === 'web';
  }

  static isExpoGo(): boolean {
    if (this.isNode()) return false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Constants = require('expo-constants').default;
      return Constants?.executionEnvironment === 'storeClient';
    } catch {
      return false;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static getTurboModule<T = any>(name: string): T | null {
    if (this.isNode()) return null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const registry = require('react-native').TurboModuleRegistry;
      return (registry?.get?.(name) as T) ?? null;
    } catch {
      return null;
    }
  }

  static isSherpaNativeSupported(): boolean {
    if (this.isWeb() || this.isExpoGo()) return false;
    if (this.isNode()) return true; // Mock mode in tests
    try {
      return this.getTurboModule('SherpaOnnx') != null;
    } catch {
      return false;
    }
  }

  static isLlamaNativeSupported(): boolean {
    if (this.isWeb() || this.isExpoGo()) return false;
    if (this.isNode()) return true; // Mock mode in tests
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const llamaRn = require('llama.rn');
      return typeof llamaRn?.initLlama === 'function';
    } catch {
      return false;
    }
  }
}
