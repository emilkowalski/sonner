import Image from 'next/image';
import emil from 'public/emil.jpeg';
import styles from './footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.wrapper}>
      <div className="container">
        <p className={styles.p}>
          <Image alt="Emil's profile picture" src={emil} height={24} width={24} />
          <span>
            Made by{' '}
            <a href="https://twitter.com/emilkowalski_" target="_blank">
              Emil
            </a>
          </span>
        </p>
      </div>
    </footer>
  );
};
