import React, { useState } from 'react';
import { Topbar } from '../components/topbar.js';
import { TrashIcon } from '../components/icons.js';
import { useApi, apiDelete } from '../data/use-api.js';
import { mockReservations } from '../data/mock-data.js';
import type { Reservation } from '../types.js';
import styles from './reservations-page.module.css';

const STATUS_TABS = ['Confirmed', 'Awaited', 'Cancelled', 'Failed', 'Fulfilled'];

/** Reservation list page with status tabs and delete support. */
export function ReservationsPage() {
  const { data: reservations, setData } = useApi<Reservation[]>('reservations', mockReservations);
  const [active, setActive] = useState(0);

  const remove = async (id: string) => {
    setData((prev) => prev.filter((r) => r.id !== id));
    await apiDelete(`reservations/${id}`);
  };

  return (
    <>
      <Topbar title="Reservation" />

      <div className={styles.tabs}>
        {STATUS_TABS.map((t, i) => (
          <button key={t} className={`${styles.tab} ${i === active ? styles.tabActive : ''}`} onClick={() => setActive(i)}>{t}</button>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <div className={styles.headRow}>
          <span>Reservation ID</span><span>Customer Name</span><span>Phone Number</span>
          <span>Reservation Date</span><span>Check In</span><span>Check Out</span><span>Total</span><span></span>
        </div>
        {reservations.map((r) => (
          <div key={r.id} className={styles.row}>
            <span className={styles.email}>{r.email}</span>
            <span>{r.customer}</span>
            <span>{r.phone}</span>
            <span>{r.date}</span>
            <span>{r.checkIn}</span>
            <span>{r.checkOut}</span>
            <span className={styles.total}>${r.total.toFixed(2)}</span>
            <button className={styles.del} onClick={() => remove(r.id)}><TrashIcon size={16} /></button>
          </div>
        ))}
      </div>
    </>
  );
}
