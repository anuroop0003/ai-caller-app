export interface LatencyBadgeConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  iconColor: string;
}

export interface LatencyBadgeOptions {
  /**
   * If true, appends category descriptor (e.g., "• Ultra Fast", "• Real-Time").
   * Defaults to true.
   */
  showCategory?: boolean;
}

/**
 * Pure classification function for determining badge label and Tailwind styling
 * based on the latency of speech recognition.
 */
export function getLatencyBadge(ms: number, options: LatencyBadgeOptions = {}): LatencyBadgeConfig {
  const { showCategory = true } = options;

  if (ms < 500) {
    return {
      label: showCategory ? `${ms} ms • Ultra Fast` : `${ms} ms`,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      iconColor: '#10b981',
    };
  }

  if (ms < 1500) {
    return {
      label: showCategory ? `${ms} ms • Real-Time` : `${ms} ms`,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      iconColor: '#3b82f6',
    };
  }

  return {
    label: `${ms} ms`,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    iconColor: '#f59e0b',
  };
}
