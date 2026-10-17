import { Pressable, View } from 'react-native';

import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import {
  type QuickDiagnosticTestState,
  useQuickDiagnosticTest,
} from '@/hooks/use-quick-diagnostic-test';
import { cn } from '@/utils/cn';

interface StudioQuickTestCardProps {
  testHook?: QuickDiagnosticTestState;
  className?: string;
}

export function StudioQuickTestCard({
  testHook: externalHook,
  className,
}: StudioQuickTestCardProps) {
  const router = useRouter();
  const internalHook = useQuickDiagnosticTest();
  const { isTestingEngine, testResult, testError, runDiagnosticTest } =
    externalHook ?? internalHook;

  return (
    <View
      className={cn(
        'bg-card border border-border rounded-md p-5 gap-4 shadow-sm',
        className
      )}>
      {/* Title & Description */}
      <View className="gap-1">
        <ThemedText type="h4" className="text-foreground">
          Engine Diagnostics
        </ThemedText>
        <ThemedText type="muted" className="text-muted-foreground text-xs">
          Verify the offline Sherpa-ONNX STT engine with a synthetic 16kHz audio sample.
        </ThemedText>
      </View>

      {/* Error Alert */}
      {testError ? (
        <View className="p-3 rounded-md border border-rose-500/30 bg-rose-500/10">
          <ThemedText type="small" className="text-rose-600 dark:text-rose-400 text-xs">
            {testError}
          </ThemedText>
        </View>
      ) : null}

      {/* Result Card */}
      {testResult ? (
        <View className="p-3.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 gap-1.5">
          <ThemedText
            type="smallBold"
            className="text-emerald-700 dark:text-emerald-300 font-semibold text-xs">
            Engine Diagnostic Complete
          </ThemedText>
          <ThemedText type="small" className="text-foreground text-xs">
            Transcription Output: &ldquo;{testResult.text || '(empty/silence detected)'}&rdquo;
          </ThemedText>
          <ThemedText type="code" className="text-muted-foreground text-[11px]">
            Tokens: {testResult.tokens.length} | Timestamps: {testResult.timestamps.length}
          </ThemedText>
        </View>
      ) : null}

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        <Pressable
          disabled={isTestingEngine}
          onPress={runDiagnosticTest}
          accessibilityRole="button"
          accessibilityLabel="Run quick diagnostic test"
          className={cn(
            'flex-1 py-3 px-4 rounded-md bg-primary items-center justify-center active:opacity-80',
            isTestingEngine && 'opacity-70'
          )}>
          <ThemedText type="smallBold" className="text-primary-foreground font-semibold text-sm">
            {isTestingEngine ? 'Testing Engine...' : 'Run Quick Test'}
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => router.navigate('/diagnostics')}
          accessibilityRole="button"
          accessibilityLabel="Go to full diagnostics playground"
          className="py-3 px-4 rounded-md bg-secondary border border-border items-center justify-center active:opacity-75">
          <ThemedText type="small" className="text-foreground font-medium text-sm">
            Full Playground →
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}
