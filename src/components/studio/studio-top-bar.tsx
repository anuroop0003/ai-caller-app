import { AppHeader, type AppHeaderProps } from '@/components/layout/app-header';

export type StudioTopBarProps = AppHeaderProps;

export function StudioTopBar(props: StudioTopBarProps) {
  return (
    <AppHeader
      subtitle="Malayalam Speech Studio"
      icon="mic"
      {...props}
    />
  );
}
