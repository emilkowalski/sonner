'use client';

import React from 'react';
import { Toaster, toast } from 'sonner';

export default function Home({ searchParams }: any) {
  const [finallyCalled, setFinallyCalled] = React.useState(false);

  function save() {
    const promise = (): Promise<unknown> => {
      switch (searchParams.outcome) {
        case 'rejection':
          return Promise.reject(new Error('Save failed'));
        case 'error':
          return Promise.resolve(new Error('Save failed'));
        case 'http':
          return Promise.resolve({ ok: false, status: 500 });
        case 'jsx':
          return Promise.resolve(<strong>Project saved</strong>);
        default:
          return Promise.resolve('Project saved');
      }
    };

    const message = searchParams.extended
      ? async () => ({ message: 'Extended result', description: 'Extended description', className: 'extended-options' })
      : async () => 'Project saved';

    toast.promise(promise, {
      id: 'save-project',
      toasterId: 'secondary',
      loading: searchParams.loading ? 'Saving...' : undefined,
      success: message,
      error: message,
      description: searchParams.callback ? async () => 'Callback description' : 'Shared description',
      duration: Infinity,
      testId: 'promise-options-toast',
      className: 'shared-options',
      action: { label: 'Dismiss', onClick: () => toast.dismiss('save-project') },
      finally: () => setFinallyCalled(true),
    });
  }

  return (
    <>
      <button onClick={save}>Save project</button>
      <output data-testid="finally-called">{String(finallyCalled)}</output>
      <Toaster />
      <Toaster id="secondary" position="top-left" />
    </>
  );
}
