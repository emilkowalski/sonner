import React from 'react';
import { Toaster } from 'sonner';
import { Installation } from '@/src/components/Installation';
import { Hero } from '@/src/components/Hero';
import { Types } from '@/src/components/Types/Types';
import { ExpandModes } from '@/src/components/ExpandModes';
import { Position } from '@/src/components/Position';
import { Usage } from '@/src/components/Usage';
import { Other } from '@/src/components/Other/Other';
import Head from '@/src/components/Head';
import { How } from '@/src/components/How/How';
import { useTheme } from 'next-themes';

export function HomePage() {
  const [expand, setExpand] = React.useState(false);
  const [position, setPosition] = React.useState<Position>('bottom-right');
  const [richColors, setRichColors] = React.useState(false);
  const [closeButton, setCloseButton] = React.useState(false);

  // Nextra wraps app in a ThemeProvider, so we can use useTheme hook
  // without injecting ThemeProvider in _app.tsx
  const { theme } = useTheme();

  return (
    <div className="wrapper">
      <Head />
      <Toaster
        theme={(theme as React.ComponentProps<typeof Toaster>['theme']) ?? 'system'}
        richColors={richColors}
        closeButton={closeButton}
        expand={expand}
        position={position}
      />
      <main className="container">
        <Hero />
        <div className="content">
          <Installation />
          <Usage />
          <Types />
          <Position position={position} setPosition={setPosition} />
          <ExpandModes expand={expand} setExpand={setExpand} />
          <Other setCloseButton={setCloseButton} setRichColors={setRichColors} />
          <How />
        </div>
      </main>
    </div>
  );
}
