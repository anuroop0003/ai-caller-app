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

export function ThemedText({
  style,
  className,
  type = 'default',
  themeColor,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();

  // If themeColor is explicitly specified, use it.
  // Otherwise, only fallback to inline color if no className was provided.
  const defaultColor =
    themeColor != null
      ? theme[themeColor]
      : !className
        ? type === 'muted'
          ? theme.mutedForeground
          : theme.foreground
        : undefined;

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
