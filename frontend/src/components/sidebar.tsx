import React from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from './logo.js';
import {
  GridIcon, MenuBookIcon, StaffIcon, BoxIcon, ReportIcon,
  OrderIcon, ReservationIcon, LogoutIcon, UserIcon,
} from './icons.js';
import { useUser, type Permission } from '../context/user-context.js';
import styles from './sidebar.module.css';

const NAV: { to: string; label: string; Icon: React.ComponentType<{ size?: number }>; permission?: Permission }[] = [
  { to: '/dashboard', label: 'Dashboard', Icon: GridIcon, permission: 'Dashboard' },
  { to: '/menu', label: 'Menu', Icon: MenuBookIcon, permission: 'Inventory' },
  { to: '/staff', label: 'Staff', Icon: StaffIcon, permission: 'Settings' },
  { to: '/inventory', label: 'Inventory', Icon: BoxIcon, permission: 'Inventory' },
  { to: '/reports', label: 'Reports', Icon: ReportIcon, permission: 'Reports' },
  { to: '/orders', label: 'Order/Table', Icon: OrderIcon, permission: 'Orders' },
  { to: '/reservations', label: 'Reservation', Icon: ReservationIcon, permission: 'Orders' },
  { to: '/profile', label: 'Profile', Icon: UserIcon },
];

/** Left navigation rail used across all dashboard pages. */
export function Sidebar() {
  const { logout, hasPermission } = useUser();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Logo />
      </div>
      <nav className={styles.nav}>
        {NAV.filter((item) => !item.permission || hasPermission(item.permission)).map(({ to, label, Icon }) => (
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
