import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlayIcon, LeafIcon, ChefHatIcon, ShieldIcon, TrayIcon, UsersIcon, StarIcon, CartIcon, HamburgerIcon, MailIcon, ClockIcon } from '../components/icons.js';
import styles from './home-page.module.css';

const HERO_IMG = 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&q=80';

const STATS = [
  { value: '120+', label: 'Delicious Dishes', Icon: TrayIcon },
  { value: '500+', label: 'Happy customers', Icon: UsersIcon },
  { value: '4.8', label: 'Top Rating', Icon: StarIcon },
];

const FEATURES = [
  { title: 'Fresh Ingredients', desc: 'We use only the freshest ingredients for every dish.', Icon: LeafIcon },
  { title: 'Expert Chef', desc: 'Our expert chefs craft the best meals for your clients.', Icon: ChefHatIcon },
  { title: 'Quality Guarantee', desc: 'We promise the best restaurant quality.', Icon: ShieldIcon },
];

/** Public marketing landing page. */
export function HomePage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

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
        <div className={styles.navIcons}>
          <div className={styles.menuWrap}>
            <button className={styles.iconBtn} onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu"><HamburgerIcon size={26} /></button>
            {menuOpen && (
              <>
                <div className={styles.menuBackdrop} onClick={() => setMenuOpen(false)} />
                <div className={styles.dropdown}>
                  <Link to="/" className={styles.dropItem} onClick={() => setMenuOpen(false)}>Home</Link>
                  <Link to="/login" className={styles.dropItem} onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link to="/signup" className={styles.dropItem} onClick={() => setMenuOpen(false)}>Sign Up</Link>
                  <Link to="/dashboard" className={styles.dropItem} onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  <a href="#contact" className={styles.dropItem} onClick={() => setMenuOpen(false)}>Contact</a>
                </div>
              </>
            )}
          </div>
          <button className={styles.iconBtn} onClick={() => navigate('/login')} aria-label="Cart"><CartIcon size={26} /></button>
        </div>
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
                <span className={styles.statIcon}><s.Icon size={26} /></span>
                <div>
                  <div className={styles.statValue}>{s.value}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
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
            <span className={styles.featureIcon}><f.Icon size={30} /></span>
            <div>
              <div className={styles.featureTitle}>{f.title}</div>
              <div className={styles.featureDesc}>{f.desc}</div>
            </div>
          </div>
        ))}
      </section>

      <ContactSection />

      <footer className={styles.footer}>
        <div className={styles.footBrand}>Foodey</div>
        <p className={styles.footText}>© 2026 Foodey. Manage your restaurant like a pro.</p>
      </footer>
    </div>
  );
}

/** Contact section with company details and a working message form. */
function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => setSent(false), 2500);
  };

  const INFO = [
    { Icon: MailIcon, title: 'Email us', value: 'hello@foodey.com' },
    { Icon: UsersIcon, title: 'Call us', value: '+250 798 532 708' },
    { Icon: ClockIcon, title: 'Open hours', value: 'Mon – Sun, 9am – 10pm' },
  ];

  return (
    <section className={styles.contact} id="contact">
      <div className={styles.contactInfo}>
        <h2 className={styles.contactTitle}>Get in <span className={styles.accent}>touch</span></h2>
        <p className={styles.contactBlurb}>Have a question about Foodey? Send us a message and our team will get back to you shortly.</p>
        <div className={styles.contactList}>
          {INFO.map((c) => (
            <div key={c.title} className={styles.contactItem}>
              <span className={styles.contactIcon}><c.Icon size={22} /></span>
              <div>
                <div className={styles.contactItemTitle}>{c.title}</div>
                <div className={styles.contactItemValue}>{c.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form className={styles.contactForm} onSubmit={submit}>
        <label className={styles.contactLabel}>Your Name</label>
        <input className={styles.contactInput} placeholder="Enter your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <label className={styles.contactLabel}>Email Address</label>
        <input className={styles.contactInput} type="email" placeholder="Enter your email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <label className={styles.contactLabel}>Message</label>
        <textarea className={styles.contactTextarea} placeholder="Write your message..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
        <button type="submit" className={styles.contactBtn}>{sent ? 'Message sent ✓' : 'Send Message'}</button>
      </form>
    </section>
  );
}
