import { useEffect } from 'react';

import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { preventAutoHideAsync } from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme as useRNColorScheme, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppTabs } from '@/components/app-tabs';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { cn } from '@/utils/cn';
import '../global.css';

preventAutoHideAsync();

export default function RootLayout() {
  const rnScheme = useRNColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const colorScheme = useColorScheme();

  const isDark = colorScheme === 'dark';

  // Sync NativeWind with system appearance updates
  useEffect(() => {
    if (rnScheme) {
      setColorScheme(rnScheme === 'unspecified' ? 'system' : rnScheme);
    }
  }, [rnScheme, setColorScheme]);

  return (
    <View className={cn('flex-1 bg-background', isDark && 'dark')}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <AppTabs />
      </ThemeProvider>
    </View>
  );
}

