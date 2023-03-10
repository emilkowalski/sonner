'use client';

import { Toaster, toast } from 'sonner';

export default function Home() {
  return (
    <>
      <h1>tests</h1>
      <button className="button" onClick={() => toast('My Message')}>
        Render Toast
      </button>
      <Toaster />
    </>
  );
}
