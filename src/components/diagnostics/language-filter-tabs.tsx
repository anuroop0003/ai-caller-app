import { Pressable, ScrollView } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { DiagnosticsFilterTab, DiagnosticsFilterType } from '@/hooks/use-diagnostics';
import { cn } from '@/utils/cn';

interface LanguageFilterTabsProps {
  filterTabs: DiagnosticsFilterTab[];
  activeFilter: DiagnosticsFilterType;
  onSelectFilter: (filter: DiagnosticsFilterType) => void;
}

export function LanguageFilterTabs({
  filterTabs,
  activeFilter,
  onSelectFilter,
}: LanguageFilterTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 6, paddingVertical: 2 }}>
      {filterTabs.map((tab) => {
        const isActive = activeFilter === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onSelectFilter(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${tab.label} filter, ${tab.count} samples`}
            className={cn(
              'py-1.5 px-3 rounded-md border active:opacity-75',
              isActive ? 'bg-primary border-primary' : 'bg-card border-border'
            )}>
            <ThemedText
              type={isActive ? 'smallBold' : 'small'}
              className={cn(isActive ? 'text-primary-foreground' : 'text-foreground')}>
              {tab.label} ({tab.count})
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
