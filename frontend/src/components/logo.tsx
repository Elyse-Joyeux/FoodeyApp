import React from 'react';
import { ChefHatIcon } from './icons.js';
import styles from './logo.module.css';

type LogoProps = {
  /** Show the full stacked logo with chef hat (auth pages) vs simple wordmark (sidebar). */
  variant?: 'full' | 'word';
  size?: 'sm' | 'lg';
};

/** Foodey brand logo. */
export function Logo({ variant = 'word', size = 'sm' }: LogoProps) {
  if (variant === 'full') {
    return (
      <div className={`${styles.full} ${size === 'lg' ? styles.lg : ''}`}>
        <ChefHatIcon size={size === 'lg' ? 64 : 44} />
        <div className={styles.word}>FOODEY</div>
        <div className={styles.starline}>
          <span className={styles.line} />
          <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--foodey-orange)"><path d="m12 2 3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7Z" /></svg>
          <span className={styles.line} />
        </div>
      </div>
    );
  }
  return <div className={styles.wordmark}>FOODEY</div>;
}
