import React from 'react';
import { Sidebar } from './sidebar.js';
import styles from './dashboard-layout.module.css';

/** Shell wrapping the sidebar and the routed page content. */
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
