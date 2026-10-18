import { useState } from 'react';
import { View } from 'react-native';

import { DiagnosticsModeTabs, type DiagnosticsMode } from './diagnostics-mode-tabs';
import { DiagnosticsSttContent } from './diagnostics-stt-content';
import { DiagnosticsTtsContent } from './diagnostics-tts-content';

import type { UseDiagnosticsResult } from '@/hooks/use-diagnostics';

export interface DiagnosticsContentProps {
  diagnosticsHook?: UseDiagnosticsResult;
}

export function DiagnosticsContent({ diagnosticsHook }: DiagnosticsContentProps = {}) {
  const [activeMode, setActiveMode] = useState<DiagnosticsMode>('stt');

  return (
    <View className="gap-3.5">
      <DiagnosticsModeTabs activeMode={activeMode} onSelectMode={setActiveMode} />

      {activeMode === 'stt' ? (
        <DiagnosticsSttContent diagnosticsHook={diagnosticsHook} />
      ) : (
        <DiagnosticsTtsContent />
      )}
    </View>
  );
}
