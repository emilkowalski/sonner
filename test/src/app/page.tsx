'use client';

import { Toaster, toast } from 'sonner';

const promise = () => new Promise((resolve) => setTimeout(resolve, 2000));

export default function Home() {
  return (
    <>
      <h1>tests</h1>
      <button data-testid="default-button" className="button" onClick={() => toast('My Toast')}>
        Render Toast
      </button>
      <button data-testid="success" className="button" onClick={() => toast.success('My Success Toast')}>
        Render Success Toast
      </button>
      <button data-testid="error" className="button" onClick={() => toast.error('My Error Toast')}>
        Render Error Toast
      </button>
      <button data-testid="warning" className="button" onClick={() => toast.warning('My Warning Toast')}>
        Render Warning Toast
      </button>
      <button
        data-testid="action"
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
        data-testid="promise"
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
      <button
        data-testid="custom"
        className="button"
        onClick={() =>
          toast.custom((t) => (
            <div>
              <h1>jsx</h1>
              <button onClick={() => toast.dismiss(t)}>Dismiss</button>
            </div>
          ))
        }
      >
        Render Custom Toast
      </button>
      <Toaster />
    </>
  );
}
