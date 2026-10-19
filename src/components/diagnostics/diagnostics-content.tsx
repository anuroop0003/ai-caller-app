import { useState } from 'react';
import { View } from 'react-native';

import { DiagnosticsLlmContent } from './diagnostics-llm-content';
import { DiagnosticsModeTabs, type DiagnosticsMode } from './diagnostics-mode-tabs';
import { DiagnosticsPipelineContent } from './diagnostics-pipeline-content';
import { DiagnosticsSttContent } from './diagnostics-stt-content';
import { DiagnosticsTtsContent } from './diagnostics-tts-content';

import type { UseDiagnosticsResult } from '@/hooks/use-diagnostics';

export interface DiagnosticsContentProps {
  diagnosticsHook?: UseDiagnosticsResult;
}

export function DiagnosticsContent({ diagnosticsHook }: DiagnosticsContentProps = {}) {
  const [activeMode, setActiveMode] = useState<DiagnosticsMode>('stt');

  const renderActiveContent = () => {
    switch (activeMode) {
      case 'stt':
        return <DiagnosticsSttContent diagnosticsHook={diagnosticsHook} />;
      case 'tts':
        return <DiagnosticsTtsContent />;
      case 'llm':
        return <DiagnosticsLlmContent />;
      case 'pipeline':
        return <DiagnosticsPipelineContent />;
    }
  };

  return (
    <View className="gap-3.5">
      <DiagnosticsModeTabs activeMode={activeMode} onSelectMode={setActiveMode} />

      {renderActiveContent()}
    </View>
  );
}
