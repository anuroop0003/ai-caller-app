import type { ReactNode } from 'react';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { cn } from '@/utils/cn';

export interface ScreenHeaderProps {
  title: string;
  description?: string;
  rightAccessory?: ReactNode;
  className?: string;
}

export function ScreenHeader({
  title,
  description,
  rightAccessory,
  className,
}: ScreenHeaderProps) {
  return (
    <View
      className={cn(
        'w-full py-1 gap-1.5',
        rightAccessory && 'flex-row items-center justify-between',
        className
      )}>
      <View className="flex-1 gap-1.5">
        <ThemedText type="h2" className="text-foreground">
          {title}
        </ThemedText>
        {description ? (
          <ThemedText type="muted" className="text-muted-foreground">
            {description}
          </ThemedText>
        ) : null}
      </View>
      {rightAccessory}
    </View>
  );
}
