import React from 'react';
import { Topbar } from '../components/topbar.js';
import { useApi } from '../data/use-api.js';
import { mockReservations } from '../data/mock-data.js';
import type { Reservation } from '../types.js';
import styles from './reservations-page.module.css';

const STATUS_TABS = ['Confirmed', 'Awaited', 'Cancelled', 'Failed', 'Fulfilled'];

/** Reservation list page. */
export function ReservationsPage() {
  const { data: reservations } = useApi<Reservation[]>('reservations', mockReservations);

  return (
    <>
      <Topbar title="Reservation" />

      <div className={styles.tabs}>
        {STATUS_TABS.map((t, i) => (
          <button key={t} className={`${styles.tab} ${i === 0 ? styles.tabActive : ''}`}>{t}</button>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <div className={styles.headRow}>
          <span>Reservation ID</span><span>Customer Name</span><span>Phone Number</span>
          <span>Reservation Date</span><span>Check In</span><span>Check Out</span><span>Status</span><span>Total</span>
        </div>
        {reservations.map((r) => (
          <div key={r.id} className={styles.row}>
            <span className={styles.email}>{r.email}</span>
            <span>{r.customer}</span>
            <span>{r.phone}</span>
            <span>{r.date}</span>
            <span>{r.checkIn}</span>
            <span>{r.checkOut}</span>
            <span className={styles.status}>{r.status}</span>
            <span className={styles.total}>${r.total.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </>
  );
}
