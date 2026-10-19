import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function AppTabs() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Studio</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="waveform" md="graphic_eq" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="call">
        <NativeTabs.Trigger.Label>AI Call</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="phone.bubble.left.fill" md="phone_in_talk" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="diagnostics">
        <NativeTabs.Trigger.Label>Diagnostics</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="waveform.badge.magnifyingglass" md="hearing" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="models">
        <NativeTabs.Trigger.Label>Models</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="cpu" md="memory" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
