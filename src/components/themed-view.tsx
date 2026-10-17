import { View, type ViewProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
  className?: string;
};

export function ThemedView({
  style,
  className,
  lightColor,
  darkColor,
  type,
  ...otherProps
}: ThemedViewProps) {
  const theme = useTheme();

  const backgroundColor = type != null ? theme[type] : !className ? theme.background : undefined;

  return (
    <View
      className={className}
      style={[backgroundColor ? { backgroundColor } : null, style]}
      {...otherProps}
    />
  );
}
