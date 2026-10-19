import { useState } from 'react';
import { View } from 'react-native';

import { DiagnosticsLlmContent } from './diagnostics-llm-content';
import { DiagnosticsModeTabs, type DiagnosticsMode } from './diagnostics-mode-tabs';
import { DiagnosticsSttContent } from './diagnostics-stt-content';
import { DiagnosticsTtsContent } from './diagnostics-tts-content';

import type { UseDiagnosticsResult } from '@/hooks/use-diagnostics';

export interface DiagnosticsContentProps {
  diagnosticsHook?: UseDiagnosticsResult;
  initialMode?: DiagnosticsMode;
}

export function DiagnosticsContent({
  diagnosticsHook,
  initialMode = 'stt',
}: DiagnosticsContentProps = {}) {
  const [activeMode, setActiveMode] = useState<DiagnosticsMode>(initialMode);

  const renderActiveContent = () => {
    switch (activeMode) {
      case 'stt':
        return <DiagnosticsSttContent diagnosticsHook={diagnosticsHook} />;
      case 'tts':
        return <DiagnosticsTtsContent />;
      case 'llm':
        return <DiagnosticsLlmContent />;
    }
  };

  return (
    <View className="gap-3.5">
      <DiagnosticsModeTabs activeMode={activeMode} onSelectMode={setActiveMode} />

      {renderActiveContent()}
    </View>
  );
}
