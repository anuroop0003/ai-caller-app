export interface LanguageStyleConfig {
  bg: string;
  border: string;
  text: string;
  iconColor: string;
}

/**
 * Pure style mapping returning Tailwind classes and icon colors based on the sample language code.
 */
export function getLanguageColor(code: string): LanguageStyleConfig {
  switch (code) {
    case 'ml':
      return {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-700 dark:text-emerald-300',
        iconColor: '#10b981',
      };
    case 'hi':
      return {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        text: 'text-orange-700 dark:text-orange-300',
        iconColor: '#f97316',
      };
    case 'ta':
      return {
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/30',
        text: 'text-indigo-700 dark:text-indigo-300',
        iconColor: '#6366f1',
      };
    case 'en':
      return {
        bg: 'bg-sky-500/10',
        border: 'border-sky-500/30',
        text: 'text-sky-700 dark:text-sky-300',
        iconColor: '#0ea5e9',
      };
    case 'manglish':
    default:
      return {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        text: 'text-purple-700 dark:text-purple-300',
        iconColor: '#a855f7',
      };
  }
}
