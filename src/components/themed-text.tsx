import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'title'
    | 'small'
    | 'smallBold'
    | 'subtitle'
    | 'link'
    | 'linkPrimary'
    | 'code'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'p'
    | 'lead'
    | 'large'
    | 'muted';
  themeColor?: ThemeColor;
  className?: string;
};
const NON_COLOR_TEXT_CLASSES = new Set([
  'text-xs',
  'text-sm',
  'text-base',
  'text-lg',
  'text-xl',
  'text-2xl',
  'text-3xl',
  'text-4xl',
  'text-5xl',
  'text-6xl',
  'text-7xl',
  'text-8xl',
  'text-9xl',
  'text-left',
  'text-center',
  'text-right',
  'text-justify',
  'text-start',
  'text-end',
  'text-wrap',
  'text-nowrap',
  'text-balance',
  'text-pretty',
  'text-ellipsis',
  'text-clip',
]);

const THEME_TOKEN_COLOR_MAP: Record<string, ThemeColor> = {
  'text-foreground': 'foreground',
  'text-muted-foreground': 'mutedForeground',
  'text-card-foreground': 'cardForeground',
  'text-primary': 'primary',
  'text-primary-foreground': 'primaryForeground',
  'text-secondary': 'secondary',
  'text-secondary-foreground': 'secondaryForeground',
  'text-destructive': 'destructive',
  'text-muted': 'mutedForeground',
};

function resolveTextColor(
  theme: ReturnType<typeof useTheme>,
  themeColor?: ThemeColor,
  type?: ThemedTextProps['type'],
  className?: string
): string | undefined {
  if (themeColor != null) {
    return theme[themeColor];
  }

  if (className) {
    const classes = className.split(/\s+/);
    let detectedThemeToken: ThemeColor | null = null;
    let hasCustomColor = false;

    for (const rawClass of classes) {
      if (!rawClass) continue;
      // Strip variant prefixes like dark:, sm:, active:, etc.
      const parts = rawClass.split(':');
      const baseClass = parts[parts.length - 1];

      if (!baseClass.startsWith('text-')) continue;

      // Ignore text sizes like text-[10px], text-[1.2rem]
      if (/^text-\[\d+(?:px|rem|em|%)\]$/.test(baseClass)) continue;

      // Ignore non-color classes (font size, text align, overflow)
      if (NON_COLOR_TEXT_CLASSES.has(baseClass)) continue;

      // Check if it matches a known shadcn theme token
      if (baseClass in THEME_TOKEN_COLOR_MAP) {
        detectedThemeToken = THEME_TOKEN_COLOR_MAP[baseClass];
        continue;
      }

      // Any other text-* class is an explicit custom utility color
      // (e.g. text-blue-600, text-emerald-400, text-white, text-black, text-[#fff])
      hasCustomColor = true;
    }

    // If caller explicitly provided a custom Tailwind color class (e.g. text-blue-600),
    // let NativeWind handle the color without inline style overriding it.
    if (hasCustomColor) {
      return undefined;
    }

    // If caller specified a theme token in className (e.g. text-muted-foreground), use it.
    if (detectedThemeToken) {
      return theme[detectedThemeToken];
    }
  }

  // Fallback to type-based theme colors
  if (type === 'muted') {
    return theme.mutedForeground;
  }
  if (type === 'link' || type === 'linkPrimary') {
    return theme.primary;
  }
  return theme.foreground;
}

export function ThemedText({
  style,
  className,
  type = 'default',
  themeColor,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();
  const defaultColor = resolveTextColor(theme, themeColor, type, className);

  return (
    <Text
      className={className}
      style={[
        defaultColor ? { color: defaultColor } : null,
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'subtitle' && styles.subtitle,
        type === 'h1' && styles.h1,
        type === 'h2' && styles.h2,
        type === 'h3' && styles.h3,
        type === 'h4' && styles.h4,
        type === 'p' && styles.p,
        type === 'lead' && styles.lead,
        type === 'large' && styles.large,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'muted' && styles.muted,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  // shadcn typography scale
  h1: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  h2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  h4: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  p: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
  },
  lead: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
  },
  large: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
  },
  muted: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  // Existing / backwards compatibility
  small: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  smallBold: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  default: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 42,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  link: {
    fontSize: 13,
    lineHeight: 20,
    textDecorationLine: 'underline',
  },
  linkPrimary: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: '700' }) ?? '500',
    fontSize: 12,
  },
});
