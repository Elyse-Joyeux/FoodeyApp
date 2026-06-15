import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BackIcon, BellIcon } from './icons.js';
import { useUser } from '../context/user-context.js';
import { DEFAULT_AVATAR } from '../data/avatar.js';
import styles from './topbar.module.css';

type TopbarProps = {
  title: string;
  subtitle?: string;
};

/** Page header with back button, title, notifications bell and profile avatar. */
export function Topbar({ title, subtitle }: TopbarProps) {
  const navigate = useNavigate();
  const { user } = useUser();
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button className={styles.back} onClick={() => navigate(-1)} aria-label="Back">
          <BackIcon size={18} />
        </button>
        <div>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>
      <div className={styles.right}>
        <button className={styles.bell} onClick={() => navigate('/notifications')} aria-label="Notifications">
          <BellIcon size={24} />
        </button>
        <span className={styles.divider} />
        <button className={styles.avatarBtn} onClick={() => navigate('/profile')} aria-label="Profile">
          <img className={styles.avatar} src={user?.avatar || DEFAULT_AVATAR} alt="Profile" />
        </button>
      </div>
    </header>
  );
}
