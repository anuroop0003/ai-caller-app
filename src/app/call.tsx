import { useState } from 'react';
import { View } from 'react-native';

import {
  CallControls,
  CallHeader,
  CallReadyStage,
  CallSummary,
  CallTurnIndicator,
  ConversationTranscript,
  ScenarioSelector,
} from '@/components/call';
import { AppHeader, ScreenContainer } from '@/components/layout';
import { MissingModelFilesCard } from '@/components/models';
import { useAiCaller } from '@/hooks/use-ai-caller';
import { useCallTimer } from '@/hooks/use-call-timer';
import { useModelReadiness } from '@/hooks/use-model-readiness';

export default function CallScreen() {
  const caller = useAiCaller();
  const timer = useCallTimer(caller.lifecycleState === 'connected');
  const [isSummaryDismissed, setIsSummaryDismissed] = useState(false);

  const sttReadiness = useModelReadiness('stt');
  const ttsReadiness = useModelReadiness('tts');

  const isConnected = caller.lifecycleState === 'connected';
  const isEnded = caller.lifecycleState === 'ended';
  const showSummary = isEnded && !isSummaryDismissed;

  const handleStartCall = async () => {
    setIsSummaryDismissed(false);
    timer.resetTimer();
    await caller.startCall(caller.scenario);
  };

  const handleStartNewCall = async () => {
    setIsSummaryDismissed(false);
    timer.resetTimer();
    caller.resetCall();
    await caller.startCall(caller.scenario);
  };

  const handleDismissSummary = () => {
    setIsSummaryDismissed(true);
    caller.resetCall();
  };

  return (
    <ScreenContainer
      header={<AppHeader subtitle="AI Caller" icon="call" />}
      scrollable={!isConnected}
      containerClassName={isConnected ? 'flex-1 pb-4' : 'gap-4 pb-12'}
    >
      {/* Pinned Identity & Status Header */}
      <CallHeader
        lifecycleState={caller.lifecycleState}
        scenario={caller.scenario}
        formattedDuration={timer.formattedDuration}
      />

      {/* ACTIVE CALL VIEW (Connected) */}
      {isConnected ? (
        <View className="flex-1 w-full gap-3">
          {/* Turn status indicator (Listening / Transcribing / Thinking / Speaking / Error) */}
          <CallTurnIndicator
            turnState={caller.turnState}
            isRecording={caller.isRecording}
            recordingDurationSec={caller.recordingDurationSec}
            errorMessage={caller.errorMessage}
          />

          {/* Live Chat Bubble Transcript */}
          <ConversationTranscript history={caller.history} turnState={caller.turnState} />

          {/* Bottom Conversational Controls (PTT, Mute, End Call) */}
          <CallControls
            turnState={caller.turnState}
            isRecording={caller.isRecording}
            recordingDurationSec={caller.recordingDurationSec}
            isMuted={caller.isMuted}
            onStartUserTurn={caller.startUserTurn}
            onFinishUserTurn={caller.finishUserTurn}
            onCancelUserTurn={caller.cancelUserTurn}
            onToggleMute={caller.toggleMute}
            onEndCall={caller.endCall}
          />
        </View>
      ) : showSummary ? (
        /* POST-CALL SUMMARY VIEW */
        <View className="w-full gap-4">
          <CallSummary
            scenario={caller.scenario}
            formattedDuration={timer.formattedDuration}
            history={caller.history}
            onStartNewCall={handleStartNewCall}
            onDismiss={handleDismissSummary}
          />

          <ScenarioSelector
            selectedScenario={caller.scenario}
            onSelectScenario={caller.setScenario}
          />
        </View>
      ) : (
        /* PRE-CALL IDLE VIEW */
        <View className="w-full gap-4">
          {/* Model Readiness Error Guards */}
          {!sttReadiness.isReady && sttReadiness.missingFiles.length > 0 && (
            <MissingModelFilesCard
              category="stt"
              modelName="Sherpa IndicConformer (Malayalam STT)"
              missingFiles={sttReadiness.missingFiles}
            />
          )}

          {!ttsReadiness.isReady && ttsReadiness.missingFiles.length > 0 && (
            <MissingModelFilesCard
              category="tts"
              modelName="Android System TTS"
              missingFiles={ttsReadiness.missingFiles}
            />
          )}

          {/* Scenario Selector */}
          <ScenarioSelector
            selectedScenario={caller.scenario}
            onSelectScenario={caller.setScenario}
          />

          {/* Pre-Call Launch Stage */}
          <CallReadyStage scenario={caller.scenario} onStartCall={handleStartCall} />
        </View>
      )}
    </ScreenContainer>
  );
}
