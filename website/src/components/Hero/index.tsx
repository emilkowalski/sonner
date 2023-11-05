import { toast } from 'sonner';

import styles from './hero.module.css';
import Link from 'next/link';

export const headlessToast = (message: string) => {
  toast.custom(
    (t) => (
      <div>
        {message}
        <button onClick={() => toast.dismiss(t)}>x</button>
      </div>
    ),
    {
      // dismissible: true
      // onDismiss: (t) => toast.dismiss(t.id)
    },
  );
};

export const Hero = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.toastWrapper}>
        <div className={styles.toast} />
        <div className={styles.toast} />
        <div className={styles.toast} />
      </div>
      <h1 className={styles.heading}>Sonner</h1>
      <p style={{ marginTop: 0, fontSize: 18 }}>An opinionated toast component for React.</p>
      <div className={styles.buttons}>
        <button
          data-primary=""
          onClick={() => {
            headlessToast('headless toast');
            toast('Sonner', {
              description: 'An opinionated toast component for React.',
            });
          }}
          className={styles.button}
        >
          Render a toast
        </button>
        <button onClick={() => toast.dismiss()}>dismiss all</button>
        <a className={styles.button} href="https://github.com/emilkowalski/sonner" target="_blank">
          GitHub
        </a>
      </div>
      <Link href="/getting-started" className={styles.link}>
        Documentation
      </Link>
    </div>
  );
};
