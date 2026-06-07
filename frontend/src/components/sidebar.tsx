import React from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from './logo.js';
import {
  GridIcon, MenuBookIcon, StaffIcon, BoxIcon, ReportIcon,
  OrderIcon, ReservationIcon, LogoutIcon,
} from './icons.js';
import { useUser } from '../context/user-context.js';
import styles from './sidebar.module.css';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', Icon: GridIcon },
  { to: '/menu', label: 'Menu', Icon: MenuBookIcon },
  { to: '/staff', label: 'Staff', Icon: StaffIcon },
  { to: '/inventory', label: 'Inventory', Icon: BoxIcon },
  { to: '/reports', label: 'Reports', Icon: ReportIcon },
  { to: '/orders', label: 'Order/Table', Icon: OrderIcon },
  { to: '/reservations', label: 'Reservation', Icon: ReservationIcon },
];

/** Left navigation rail used across all dashboard pages. */
export function Sidebar() {
  const { logout } = useUser();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Logo />
      </div>
      <nav className={styles.nav}>
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
          >
            <span className={styles.iconWrap}><Icon size={22} /></span>
            <span className={styles.label}>{label}</span>
          </NavLink>
        ))}
      </nav>
      <NavLink to="/login" className={styles.logout} onClick={logout}>
        <LogoutIcon size={22} />
        <span className={styles.label}>Logout</span>
      </NavLink>
    </aside>
  );
}
