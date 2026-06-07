import React, { useState } from 'react';
import { Topbar } from '../components/topbar.js';
import { CalendarIcon } from '../components/icons.js';
import { useApi } from '../data/use-api.js';
import { mockReservationSummary, mockReservations } from '../data/mock-data.js';
import type { ReservationSummary, Reservation } from '../types.js';
import styles from './reports-page.module.css';

const TABS = ['Reservation Report', 'Revenue Report', 'Staff Report'];
const STATUS_TABS = ['All', 'Confirmed', 'Awaited', 'Cancelled', 'Failed', 'Fulfilled'];
const COLORS = ['#f5a623', '#ffd9a0', '#c47f12', '#8a5a0c', '#d9952a'];

type ReportData = { summary: ReservationSummary; reservations: Reservation[] };

/** Reports page with a donut chart of reservations and a filterable reservation table. */
export function ReportsPage() {
  const { data } = useApi<ReportData>('reports/reservations', {
    summary: mockReservationSummary,
    reservations: mockReservations,
  });
  const [tab, setTab] = useState(0);
  const [statusTab, setStatusTab] = useState('All');

  const shown = statusTab === 'All'
    ? data.reservations
    : data.reservations.filter((r) => r.status === statusTab);

  return (
    <>
      <Topbar title="Reports" />

      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          {TABS.map((t, i) => (
            <button key={t} className={`${styles.tab} ${tab === i ? styles.tabActive : ''}`} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>
        <div className={styles.toolRight}>
          <div className={styles.dateRange}><CalendarIcon size={18} /> 01/04/2026 - 08/04/2026</div>
          <button className={styles.generate}>Generate Report</button>
        </div>
      </div>

      <div className={styles.cards}>
        <div className={styles.donutCard}>
          <h2 className={styles.cardTitle}>Total Reservation</h2>
          <div className={styles.donutRow}>
            <Donut breakdown={data.summary.breakdown} total={data.summary.total} />
            <div className={styles.legend}>
              {data.summary.breakdown.map((b, i) => (
                <div key={b.label} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: COLORS[i % COLORS.length] }} />
                  <span className={styles.legendLabel}>{b.label}</span>
                  <span className={styles.legendValue}>{b.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.statusCard}>
          <h2 className={styles.cardTitle}>Filter by Status</h2>
          <div className={styles.statusTabs}>
            {STATUS_TABS.map((t) => (
              <button key={t} className={`${styles.statusTab} ${statusTab === t ? styles.statusActive : ''}`} onClick={() => setStatusTab(t)}>{t}</button>
            ))}
          </div>
          <div className={styles.statusSummary}>
            <span className={styles.statusCount}>{shown.length}</span>
            <span className={styles.statusCountLabel}>{statusTab === 'All' ? 'total reservations' : `${statusTab.toLowerCase()} reservations`}</span>
          </div>
        </div>
      </div>

      <div className={styles.tableHead}>
        <span>Reservation ID</span><span>Customer Name</span><span>Phone Number</span>
        <span>Reservation Date</span><span>Check In</span><span>Check Out</span><span>Status</span><span>Total</span>
      </div>
      <div className={styles.tableWrap}>
        {shown.length === 0 ? (
          <div className={styles.empty}>No {statusTab.toLowerCase()} reservations.</div>
        ) : shown.map((r) => (
          <div key={r.id} className={styles.row}>
            <span className={styles.email}>{r.email}</span>
            <span>{r.customer}</span>
            <span>{r.phone}</span>
            <span>{r.date}</span>
            <span>{r.checkIn}</span>
            <span>{r.checkOut}</span>
            <span><span className={`${styles.statusPill} ${styles[`s_${r.status}`] || ''}`}>{r.status}</span></span>
            <span className={styles.totalCell}>${r.total.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/** SVG donut chart for the reservation breakdown. */
function Donut({ breakdown, total }: { breakdown: { label: string; value: number }[]; total: number }) {
  const sum = breakdown.reduce((a, b) => a + b.value, 0) || 1;
  const radius = 70;
  const circ = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className={styles.donut}>
      <svg viewBox="0 0 180 180">
        <g transform="rotate(-90 90 90)">
          {breakdown.map((b, i) => {
            const frac = b.value / sum;
            const dash = frac * circ;
            const seg = (
              <circle key={i} cx="90" cy="90" r={radius} fill="none"
                stroke={COLORS[i % COLORS.length]} strokeWidth="28"
                strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset} />
            );
            offset += dash;
            return seg;
          })}
        </g>
        <text x="90" y="84" textAnchor="middle" className={styles.donutTotal}>Total</text>
        <text x="90" y="108" textAnchor="middle" className={styles.donutNum}>{total}</text>
      </svg>
    </div>
  );
}
