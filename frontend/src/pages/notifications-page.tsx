import React, { useState } from 'react';
import { Topbar } from '../components/topbar.js';
import { WarningIcon, TrashIcon } from '../components/icons.js';
import { useApi, apiPost, apiDelete } from '../data/use-api.js';
import { mockNotifications } from '../data/mock-data.js';
import type { Notification } from '../types.js';
import styles from './notifications-page.module.css';

/** Notifications list with All / Unread filter and mark-all-as-read. */
export function NotificationsPage() {
  const { data, setData, refetch } = useApi<Notification[]>('notifications', mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = data.filter((n) => !n.read).length;
  const shown = filter === 'all' ? data : data.filter((n) => !n.read);

  const remove = async (id: string) => {
    setData((prev) => prev.filter((n) => n.id !== id));
    await apiDelete(`notifications/${id}`);
  };

  const markAll = async () => {
    setData((prev) => prev.map((n) => ({ ...n, read: true })));
    await apiPost('notifications/mark-all-read', {});
    refetch();
  };

  return (
    <>
      <Topbar title="Notifications" subtitle={`You have ${unreadCount} unread notifications`} />

      <div className={styles.controls}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${filter === 'all' ? styles.tabActive : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`${styles.tab} ${filter === 'unread' ? styles.tabActive : ''}`} onClick={() => setFilter('unread')}>Unread</button>
        </div>
        <button className={styles.markAll} onClick={markAll}>Mark all as read</button>
      </div>

      <div className={styles.list}>
        {shown.map((n) => (
          <div key={n.id} className={`${styles.item} ${!n.read ? styles.unread : ''}`}>
            <span className={styles.icon}><WarningIcon size={30} color="#1a1a1a" /></span>
            <div className={styles.body}>
              <div className={styles.title}>{n.title}</div>
              <div className={styles.message}>{n.message}</div>
            </div>
            <span className={styles.date}>{n.date}</span>
            <button className={styles.delete} onClick={() => remove(n.id)}><TrashIcon size={16} /> Delete</button>
          </div>
        ))}
      </div>
    </>
  );
}
