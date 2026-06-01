import React, { useState } from 'react';
import { Topbar } from '../components/topbar.js';
import { CalendarIcon } from '../components/icons.js';
import { useApi } from '../data/use-api.js';
import { mockReservationSummary, mockReservations } from '../data/mock-data.js';
import type { ReservationSummary, Reservation } from '../types.js';
import styles from './reports-page.module.css';

const TABS = ['Staff Management', 'Revenue Report', 'Staff Report'];
const STATUS_TABS = ['Confirmed', 'Avoided', 'Cancelled'];
const COLORS = ['#f5a623', '#ffd9a0', '#c47f12', '#8a5a0c', '#d9952a'];

type ReportData = { summary: ReservationSummary; reservations: Reservation[] };

/** Reports page with a donut chart of reservations and a reservation table. */
export function ReportsPage() {
  const { data } = useApi<ReportData>('reports/reservations', {
    summary: mockReservationSummary,
    reservations: mockReservations,
  });
  const [tab, setTab] = useState(0);
  const [statusTab, setStatusTab] = useState(0);

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
                  <span className={styles.legendDot} style={{ background: COLORS[i % COLORS.length] }} />{b.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.statusCard}>
          <div className={styles.statusTabs}>
            {STATUS_TABS.map((t, i) => (
              <button key={t} className={`${styles.statusTab} ${statusTab === i ? styles.statusActive : ''}`} onClick={() => setStatusTab(i)}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.tableWrap}>
        {data.reservations.map((r) => (
          <div key={r.id} className={styles.row}>
            <Cell label="Reservation ID" value={r.email} />
            <Cell label="Customer Name" value={r.customer} />
            <Cell label="Phone Number" value={r.phone} />
            <Cell label="Reservation Date" value={r.date} />
            <Cell label="Check In" value={r.checkIn} />
            <Cell label="Check Out" value={r.checkOut} />
            <Cell label="Total" value={`$${r.total.toFixed(2)}`} />
          </div>
        ))}
      </div>
    </>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.cell}>
      <div className={styles.cellLabel}>{label}</div>
      <div className={styles.cellValue}>{value}</div>
    </div>
  );
}

/** SVG donut chart for the reservation breakdown. */
function Donut({ breakdown, total }: { breakdown: { label: string; value: number }[]; total: number }) {
  const sum = breakdown.reduce((a, b) => a + b.value, 0);
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
