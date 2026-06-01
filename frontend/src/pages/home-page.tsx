import React from 'react';
import { Link } from 'react-router-dom';
import { PlayIcon } from '../components/icons.js';
import styles from './home-page.module.css';

const HERO_IMG = 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&q=80';

const STATS = [
  { value: '120+', label: 'Delicious Dishes' },
  { value: '500+', label: 'Happy customers' },
  { value: '4.8', label: 'Top Rating' },
];

const FEATURES = [
  { title: 'Fresh Ingredients', desc: 'We use only the freshest ingredients for every dish.' },
  { title: 'Expert Chef', desc: 'Our expert chefs craft the best meals for your clients.' },
  { title: 'Quality Guarantee', desc: 'We promise the best restaurant quality.' },
];

/** Public marketing landing page. */
export function HomePage() {
  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <div className={styles.brand}>Foodey</div>
        <nav className={styles.links}>
          <Link to="/" className={styles.navLink}>Home</Link>
          <Link to="/login" className={styles.navLink}>Login</Link>
          <Link to="/signup" className={styles.navLink}>Sign Up</Link>
          <a href="#contact" className={styles.navLink}>Contact</a>
        </nav>
      </header>

      <div className={styles.blob} />

      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.kicker}>Are you willing to have your own restaurant?</p>
          <h1 className={styles.title}>Don't Wait</h1>
          <p className={styles.subtitle}>Start today</p>
          <div className={styles.actions}>
            <Link to="/signup" className={styles.tour}>Take a tour</Link>
            <button className={styles.watch}><PlayIcon size={18} /> Watch video</button>
          </div>
          <div className={styles.stats}>
            {STATS.map((s) => (
              <div key={s.label} className={styles.stat}>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.heroImage}>
          <img src={HERO_IMG} alt="Signature dish" />
          <span className={styles.taste}>Taste the excellence</span>
        </div>
      </section>

      <section className={styles.featuresBar}>
        {FEATURES.map((f) => (
          <div key={f.title} className={styles.feature}>
            <span className={styles.featureIcon} />
            <div>
              <div className={styles.featureTitle}>{f.title}</div>
              <div className={styles.featureDesc}>{f.desc}</div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
