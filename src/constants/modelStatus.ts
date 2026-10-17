import type { ModelInstallationStatus } from '@/types/speech';

export interface StatusBadgeConfig {
  containerClass: string;
  textClass: string;
  dotClass: string;
  label: string;
}

const STATUS_BADGE_CONFIG: Record<ModelInstallationStatus, StatusBadgeConfig> = {
  loading: {
    containerClass: 'bg-secondary border border-border',
    textClass: 'text-muted-foreground',
    dotClass: 'bg-muted-foreground',
    label: 'Loading',
  },
  installed: {
    containerClass: 'bg-blue-500/10 border border-blue-500/20',
    textClass: 'text-blue-600 dark:text-blue-400',
    dotClass: 'bg-blue-500',
    label: 'Installed',
  },
  validated: {
    containerClass: 'bg-emerald-500/10 border border-emerald-500/20',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    dotClass: 'bg-emerald-500',
    label: 'Validated',
  },
  not_installed: {
    containerClass: 'bg-amber-500/10 border border-amber-500/20',
    textClass: 'text-amber-600 dark:text-amber-400',
    dotClass: 'bg-amber-500',
    label: 'Not installed',
  },
  unavailable: {
    containerClass: 'bg-rose-500/10 border border-rose-500/20',
    textClass: 'text-rose-600 dark:text-rose-400',
    dotClass: 'bg-rose-500',
    label: 'Unavailable',
  },
};

export function getStatusBadgeConfig(status: ModelInstallationStatus): StatusBadgeConfig {
  return STATUS_BADGE_CONFIG[status];
}
