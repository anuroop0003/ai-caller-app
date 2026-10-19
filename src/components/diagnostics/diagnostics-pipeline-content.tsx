import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import {
  DeviceValidationService,
  type DeviceValidationReport,
} from '@/services/speech/deviceValidationService';
import { cn } from '@/utils/cn';

export function DiagnosticsPipelineContent() {
  const [isRunning, setIsRunning] = useState(false);
  const [synthesizeSpeech, setSynthesizeSpeech] = useState(false);
  const [report, setReport] = useState<DeviceValidationReport | null>(null);

  const handleRunValidation = async () => {
    setIsRunning(true);
    try {
      const result = await DeviceValidationService.runFullValidation({ synthesizeSpeech });
      setReport(result);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <View className="gap-4">
      {/* Overview Card */}
      <View className="p-4 rounded-lg border border-border bg-card gap-3 shadow-sm">
        <View className="flex-row items-center gap-2.5">
          <View className="w-9 h-9 rounded-full bg-emerald-500/15 items-center justify-center">
            <Ionicons name="shield-checkmark" size={20} color="#10b981" />
          </View>
          <View className="flex-1">
            <ThemedText type="default" className="text-base font-semibold text-foreground">
              Physical-Device Validation (മൈൽസ്റ്റോൺ 5)
            </ThemedText>
            <ThemedText className="text-xs text-muted-foreground">
              End-to-end 7-point hardware, dialogue, and offline reliability checklist.
            </ThemedText>
          </View>
        </View>

        {/* TTS Toggle Option */}
        <Pressable
          onPress={() => setSynthesizeSpeech(!synthesizeSpeech)}
          className="flex-row items-center gap-2.5 p-2.5 rounded-md border border-border bg-secondary/40"
          accessibilityRole="checkbox"
          accessibilityState={{ checked: synthesizeSpeech }}
        >
          <Ionicons
            name={synthesizeSpeech ? 'checkbox' : 'square-outline'}
            size={18}
            color={synthesizeSpeech ? '#10b981' : '#71717a'}
          />
          <View className="flex-1">
            <ThemedText className="text-xs font-semibold text-foreground">
              Speak Malayalam responses aloud during test (Piper TTS)
            </ThemedText>
            <ThemedText className="text-[10px] text-muted-foreground">
              Synthesizes voice audio for all 5 turns to test native speaker playback.
            </ThemedText>
          </View>
        </Pressable>

        {/* Action Run Button */}
        <Pressable
          disabled={isRunning}
          onPress={handleRunValidation}
          className={cn(
            'w-full py-3 px-4 rounded-full flex-row items-center justify-center gap-2 shadow-sm transition-opacity',
            isRunning ? 'bg-emerald-600/70' : 'bg-emerald-600 active:bg-emerald-700'
          )}
          accessibilityRole="button"
          accessibilityLabel="Run physical device validation checklist"
        >
          {isRunning ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" />
              <ThemedText className="text-white font-bold text-xs">
                പരിശോധിക്കുന്നു (Validating Device Pipeline)...
              </ThemedText>
            </>
          ) : (
            <>
              <Ionicons name="play-circle" size={18} color="#ffffff" />
              <ThemedText className="text-white font-bold text-xs">
                Run 7-Step Validation (പരിശോധന ആരംഭിക്കുക)
              </ThemedText>
            </>
          )}
        </Pressable>
      </View>

      {/* Validation Results Report */}
      {report ? (
        <View className="gap-3">
          {/* Summary Banner */}
          <View
            className={cn(
              'p-3.5 rounded-lg border flex-row items-center justify-between',
              report.overallPassed
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-red-500/10 border-red-500/30'
            )}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons
                name={report.overallPassed ? 'checkmark-circle' : 'alert-circle'}
                size={22}
                color={report.overallPassed ? '#10b981' : '#ef4444'}
              />
              <View>
                <ThemedText
                  className={cn(
                    'text-sm font-bold',
                    report.overallPassed
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-red-700 dark:text-red-300'
                  )}
                >
                  {report.overallPassed
                    ? 'All 7 Device Checks Passed'
                    : `${report.failedSteps} Checks Failed`}
                </ThemedText>
                <ThemedText className="text-[10px] text-muted-foreground">
                  Completed in {report.totalDurationMs}ms • 100% Offline
                </ThemedText>
              </View>
            </View>

            <View className="px-2 py-0.5 rounded-full bg-card border border-border">
              <ThemedText className="text-xs font-mono font-bold text-foreground">
                {report.passedSteps}/{report.totalSteps}
              </ThemedText>
            </View>
          </View>

          {/* Checklist Items */}
          <View className="p-3.5 rounded-lg border border-border bg-card gap-2.5">
            <ThemedText className="text-xs font-semibold uppercase text-muted-foreground tracking-wider px-1">
              Checklist Results (പരിശോധനാ ഫലങ്ങൾ)
            </ThemedText>

            {report.steps.map((step, idx) => (
              <View
                key={step.stepId || idx}
                className="p-3 rounded-lg border border-border bg-secondary/30 gap-1"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2 flex-1">
                    <Ionicons
                      name={step.passed ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={step.passed ? '#10b981' : '#ef4444'}
                    />
                    <ThemedText className="text-xs font-bold text-foreground">
                      {step.name}
                    </ThemedText>
                  </View>

                  {step.latencyMs !== undefined ? (
                    <ThemedText className="text-[10px] font-mono text-muted-foreground">
                      {step.latencyMs}ms
                    </ThemedText>
                  ) : null}
                </View>

                <ThemedText className="text-xs text-muted-foreground pl-6">
                  {step.message}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}
