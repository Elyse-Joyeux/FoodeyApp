import React from 'react';
import { Logo } from './logo.js';
import styles from './auth-layout.module.css';

const FOOD_IMG = 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=900&q=80';

type Feature = { title: string; desc: string };

const FEATURES: Feature[] = [
  { title: 'Smart Analytics', desc: 'Track sales and grow faster' },
  { title: 'Menu Management', desc: 'Update your menu in seconds' },
  { title: 'Happy Customers', desc: 'Deliver an exceptional experience' },
];

type AuthLayoutProps = {
  welcomeTop: string;
  welcomeBottom: string;
  blurb: string;
  showFeatures?: boolean;
  children: React.ReactNode;
};

/** Split-screen auth shell: welcome panel on the left, form card center, food image right. */
export function AuthLayout({ welcomeTop, welcomeBottom, blurb, showFeatures = true, children }: AuthLayoutProps) {
  return (
    <div className={styles.page}>
      <div className={styles.dots} />
      <section className={styles.welcome}>
        <h1 className={styles.welcomeTitle}>
          {welcomeTop}<br /><span className={styles.accent}>{welcomeBottom}</span>
        </h1>
        <div className={styles.cutlery}>🍴</div>
        <p className={styles.blurb}>{blurb}</p>
        {showFeatures && (
          <div className={styles.features}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.feature}>
                <span className={styles.featureIcon} />
                <div>
                  <div className={styles.featureTitle}>{f.title}</div>
                  <div className={styles.featureDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className={styles.logoTop}>
        <Logo variant="full" />
      </div>

      <section className={styles.formArea}>{children}</section>

      <div className={styles.imageWrap}>
        <img src={FOOD_IMG} alt="Dish" className={styles.image} />
      </div>
    </div>
  );
}
