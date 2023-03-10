'use client';

import { Toaster, toast } from 'sonner';

const promise = () => new Promise((resolve) => setTimeout(resolve, 2000));

export default function Home() {
  return (
    <>
      <h1>tests</h1>
      <button className="button" onClick={() => toast('My Toast')}>
        Render Toast
      </button>
      <button className="button" onClick={() => toast.success('My Success Toast')}>
        Render Success Toast
      </button>
      <button className="button" onClick={() => toast.error('My Error Toast')}>
        Render Error Toast
      </button>
      <button
        className="button"
        onClick={() =>
          toast('My Message', {
            action: {
              label: 'Action',
              onClick: () => console.log('Action'),
            },
          })
        }
      >
        Render Action Toast
      </button>
      <button
        className="button"
        onClick={() =>
          toast.promise(promise, {
            loading: 'Loading...',
            success: 'Loaded',
            error: 'Error',
          })
        }
      >
        Render Promise Toast
      </button>
      <Toaster />
    </>
  );
}
