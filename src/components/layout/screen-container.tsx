import type { ReactNode } from 'react';
import {
  type StyleProp,
  type ViewStyle,
  ScrollView,
  View,
} from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { cn } from '@/utils/cn';

export interface ScreenContainerProps {
  children: ReactNode;
  /**
   * Header component or top bar rendered outside of the main scroll container
   * (e.g. pinned top bar like StudioTopBar).
   */
  header?: ReactNode;
  /**
   * Whether the body should scroll. Defaults to true.
   */
  scrollable?: boolean;
  /**
   * Safe area edges to respect. Defaults to ['top', 'left', 'right'].
   */
  edges?: Edge[];
  /**
   * Extra styling class applied to the outer background View.
   */
  className?: string;
  /**
   * Extra styling class applied to the inner responsive max-w container.
   */
  containerClassName?: string;
  /**
   * Styling for the ScrollView contentContainer (padding, gaps).
   */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /**
   * Whether to show vertical scroll indicator. Defaults to false.
   */
  showsVerticalScrollIndicator?: boolean;
}

export function ScreenContainer({
  children,
  header,
  scrollable = true,
  edges = ['top', 'left', 'right'],
  className,
  containerClassName,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
}: ScreenContainerProps) {
  return (
    <View className={cn('flex-1 bg-background items-center', className)}>
      <SafeAreaView edges={edges} className="w-full flex-1 items-center">
        {header ? (
          <View className="w-full max-w-[800px] items-center">
            {header}
          </View>
        ) : null}

        {scrollable ? (
          <ScrollView
            className={cn('flex-1 w-full max-w-[800px] px-4', containerClassName)}
            contentContainerStyle={
              contentContainerStyle ?? {
                paddingTop: 16,
                paddingBottom: 24,
                gap: 16,
              }
            }
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}>
            {children}
          </ScrollView>
        ) : (
          <View
            className={cn(
              'flex-1 w-full max-w-[800px] px-4 pt-4 pb-6 gap-4',
              containerClassName
            )}>
            {children}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
