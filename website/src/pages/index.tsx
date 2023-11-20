import React from 'react';
import { Toaster } from 'sonner';
import { Installation } from '@/src/components/Installation';
import { Hero } from '@/src/components/Hero';
import { Types } from '@/src/components/Types/Types';
import { ExpandModes } from '@/src/components/ExpandModes';
import { Footer } from '@/src/components/Footer';
import { Position } from '@/src/components/Position';
import { Usage } from '@/src/components/Usage';
import { Other } from '@/src/components/Other/Other';
import Head from '../components/Head';
import { How } from '../components/How/How';

export default function Home() {
  const [expand, setExpand] = React.useState(false);
  const [position, setPosition] = React.useState<Position>('bottom-right');
  const [richColors, setRichColors] = React.useState(false);
  const [closeButton, setCloseButton] = React.useState(false);

  return (
    <div className="wrapper">
      <Head />
      <Toaster
        theme="light"
        richColors={richColors}
        closeButton={closeButton}
        expand={expand}
        position={position}
        toastOptions={{
          classNames: {},
        }}
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
      <Footer />
    </div>
  );
}
