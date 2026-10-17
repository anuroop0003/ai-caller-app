/**
 * Global shadcn/ui design system tokens for both Native and Web.
 */

import { Platform } from 'react-native';

import '@/global.css';

export const Colors = {
  light: {
    background: '#FFFFFF',
    foreground: '#09090B',
    card: '#FFFFFF',
    cardForeground: '#09090B',
    primary: '#18181B',
    primaryForeground: '#FAFAFA',
    secondary: '#F4F4F5',
    secondaryForeground: '#18181B',
    muted: '#F4F4F5',
    mutedForeground: '#71717A',
    border: '#E4E4E7',
    destructive: '#E11D48',

    // Native bridge aliases
    text: '#09090B',
    textSecondary: '#71717A',
    backgroundElement: '#F4F4F5',
    backgroundSelected: '#E4E4E7',
  },
  dark: {
    background: '#09090B',
    foreground: '#FAFAFA',
    card: '#18181B',
    cardForeground: '#FAFAFA',
    primary: '#E4E4E7',
    primaryForeground: '#18181B',
    secondary: '#27272A',
    secondaryForeground: '#FAFAFA',
    muted: '#27272A',
    mutedForeground: '#A1A1AA',
    border: 'rgba(255, 255, 255, 0.10)',
    destructive: '#F87171',

    // Native bridge aliases
    text: '#FAFAFA',
    textSecondary: '#A1A1AA',
    backgroundElement: '#18181B',
    backgroundSelected: '#27272A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Radius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 14,
  '2xl': 18,
  '3xl': 22,
  '4xl': 26,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
