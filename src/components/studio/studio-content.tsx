import { View } from 'react-native';

import type { useModelInspection } from '@/hooks/use-model-inspection';
import type { QuickDiagnosticTestState } from '@/hooks/use-quick-diagnostic-test';
import { cn } from '@/utils/cn';

import { StudioHeroCard } from './studio-hero-card';
import { StudioModelSummaryCard } from './studio-model-summary-card';
import { StudioQuickTestCard } from './studio-quick-test-card';

interface StudioContentProps {
  inspectionHook?: ReturnType<typeof useModelInspection>;
  testHook?: QuickDiagnosticTestState;
  className?: string;
}

export function StudioContent({
  inspectionHook,
  testHook,
  className,
}: StudioContentProps) {
  return (
    <View className={cn('gap-4', className)}>
      {/* Hero & Model Summary Card Container */}
      <View className="bg-card border border-border rounded-md p-5 gap-3 shadow-sm">
        <StudioHeroCard />
        <StudioModelSummaryCard inspectionHook={inspectionHook} />
      </View>

      {/* Diagnostics & Audio Engine Test Card */}
      <StudioQuickTestCard testHook={testHook} />
    </View>
  );
}
