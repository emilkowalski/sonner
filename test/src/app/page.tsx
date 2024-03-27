'use client';

import React from 'react';
import { Toaster, toast } from 'sonner';

const promise = () => new Promise((resolve) => setTimeout(resolve, 2000));

export default function Home({ searchParams }: any) {
  const [showAutoClose, setShowAutoClose] = React.useState(false);
  const [showDismiss, setShowDismiss] = React.useState(false);
  const [theme, setTheme] = React.useState(searchParams.theme || 'light');
  const [isFinally, setIsFinally] = React.useState(false);

  return (
    <>
      <button data-testid="theme-button" className="button" onClick={() => setTheme('dark')}>
        Change theme
      </button>
      <button data-testid="default-button" className="button" onClick={() => toast('My Toast')}>
        Render Toast
      </button>
      <button data-testid="default-button-top" className="button" onClick={() => toast('My Toast')}>
        Render Toast Top
      </button>
      <button data-testid="success" className="button" onClick={() => toast.success('My Success Toast')}>
        Render Success Toast
      </button>
      <button data-testid="error" className="button" onClick={() => toast.error('My Error Toast')}>
        Render Error Toast
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
        data-testid="action-prevent"
        className="button"
        onClick={() =>
          toast('My Message', {
            action: {
              label: 'Action',
              onClick: (event) => {
                event.preventDefault();
                console.log('Action');
              },
            },
          })
        }
      >
        Render Action Toast
      </button>
      <button
        data-testid="promise"
        data-finally={isFinally ? '1' : '0'}
        className="button"
        onClick={() =>
          toast.promise(promise, {
            loading: 'Loading...',
            success: 'Loaded',
            error: 'Error',
            finally: () => setIsFinally(true),
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
              <button data-testid="dismiss-button" onClick={() => toast.dismiss(t)}>
                Dismiss
              </button>
            </div>
          ))
        }
      >
        Render Custom Toast
      </button>
      <button
        data-testid="custom-cancel-button-toast"
        className="button"
        onClick={() =>
          toast('My Custom Cancel Button', {
            cancel: {
              label: 'Cancel',
              onClick: () => console.log('Cancel'),
            },
          })
        }
      >
        Render Custom Cancel Button
      </button>
      <button data-testid="infinity-toast" className="button" onClick={() => toast('My Toast', { duration: Infinity })}>
        Render Infinity Toast
      </button>
      <button
        data-testid="auto-close-toast-callback"
        className="button"
        onClick={() =>
          toast('My Toast', {
            onAutoClose: () => setShowAutoClose(true),
          })
        }
      >
        Render Toast With onAutoClose callback
      </button>
      <button
        data-testid="dismiss-toast-callback"
        className="button"
        onClick={() =>
          toast('My Toast', {
            onDismiss: () => setShowDismiss(true),
          })
        }
      >
        Render Toast With onAutoClose callback
      </button>
      <button
        data-testid="non-dismissible-toast"
        className="button"
        onClick={() =>
          toast('My Toast', {
            dismissible: false,
          })
        }
      >
        Non-dismissible Toast
      </button>
      <button
        data-testid="update-toast"
        className="button"
        onClick={() => {
          const toastId = toast('My Unupdated Toast', {
            duration: 10000,
          });
          toast('My Updated Toast', {
            id: toastId,
            duration: 10000,
          });
        }}
      >
        Updated Toast
      </button>
      <button
        data-testid="string-description"
        className="button"
        onClick={() => toast('Custom Description', { description: 'string description' })}
      >
        String Description
      </button>
      <button
        data-testid="react-node-description"
        className="button"
        onClick={() => toast('Custom Description', { description: <div>This is my custom ReactNode description</div> })}
      >
        ReactNode Description
      </button>
      {showAutoClose ? <div data-testid="auto-close-el" /> : null}
      {showDismiss ? <div data-testid="dismiss-el" /> : null}
      <Toaster
        position={searchParams.position || 'bottom-right'}
        toastOptions={{
          actionButtonStyle: { backgroundColor: 'rgb(219, 239, 255)' },
          cancelButtonStyle: { backgroundColor: 'rgb(254, 226, 226)' },
        }}
        theme={theme}
        dir={searchParams.dir || 'auto'}
      />
    </>
  );
}

Home.theme = 'light';
