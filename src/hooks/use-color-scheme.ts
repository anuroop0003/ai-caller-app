import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme(): 'light' | 'dark' {
  const { colorScheme } = useNativeWindColorScheme();
  const rnScheme = useRNColorScheme();

  return (colorScheme ?? rnScheme ?? 'light') === 'dark' ? 'dark' : 'light';
}
