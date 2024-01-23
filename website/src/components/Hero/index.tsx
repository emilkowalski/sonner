import { toast } from 'sonner';

import styles from './hero.module.css';
import Link from 'next/link';

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
            toast('Sonner', {
              description: 'An opinionated toast component for React.',
            });
          }}
          className={styles.button}
        >
          Render a toast
        </button>
        <Link data-secondary="" className={styles.button} href="/getting-started">
          Get Started
        </Link>
      </div>
      <a href="https://github.com/emilkowalski/sonner" target="_blank" className={styles.link}>
        Github
      </a>
    </div>
  );
};
