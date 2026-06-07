import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Topbar } from '../components/topbar.js';
import { DollarIcon, TableIcon, ExportIcon } from '../components/icons.js';
import { useApi } from '../data/use-api.js';
import { mockDashboardStats, mockPopularDishes } from '../data/mock-data.js';
import type { DashboardStats, Dish } from '../types.js';
import styles from './dashboard-page.module.css';

type DashboardData = { stats: DashboardStats; popularDishes: Dish[] };
type Range = 'Daily' | 'Weekly' | 'Monthly';

/** Chart paths and axis labels per time range. */
const CHART: Record<Range, { sales: string; rev: string; labels: string[] }> = {
  Daily: {
    sales: 'M0,90 C80,70 140,20 220,30 C300,40 360,110 440,100 C520,92 600,70 720,80',
    rev: 'M0,100 C80,95 140,80 220,105 C300,125 360,70 440,95 C520,115 600,90 720,85',
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
  Weekly: {
    sales: 'M0,110 C80,60 140,75 220,40 C300,10 360,60 440,55 C520,50 600,30 720,45',
    rev: 'M0,95 C80,110 140,60 220,80 C300,100 360,95 440,70 C520,55 600,80 720,60',
    labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
  },
  Monthly: {
    sales: 'M0,120 C80,100 140,60 220,70 C300,80 360,30 440,40 C520,50 600,20 720,30',
    rev: 'M0,100 C80,80 140,90 220,60 C300,40 360,70 440,80 C520,90 600,60 720,70',
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  },
};

/** Main dashboard with KPI cards, popular dishes lists and an overview chart. */
export function DashboardPage() {
  const navigate = useNavigate();
  const { data } = useApi<DashboardData>('dashboard', {
    stats: mockDashboardStats,
    popularDishes: mockPopularDishes,
  });
  const { stats, popularDishes } = data;
  const [range, setRange] = useState<Range>('Daily');
  const [showAll, setShowAll] = useState(false);

  const kpis = [
    { label: 'Daily Sales', value: stats.dailySales, Icon: DollarIcon },
    { label: 'Monthly Revenue', value: stats.monthlyRevenue, Icon: DollarIcon },
    { label: 'Tables Occupancy', value: stats.tablesOccupancy, Icon: TableIcon },
  ];

  return (
    <>
      <Topbar title="Dashboard" />

      <div className={styles.kpis}>
        {kpis.map((k) => (
          <div key={k.label} className={styles.kpi}>
            <div className={styles.kpiHead}>
              <div>
                <div className={styles.kpiLabel}>{k.label}</div>
                <div className={styles.kpiValue}>{k.value}</div>
              </div>
              <span className={styles.kpiIcon}><k.Icon size={20} /></span>
            </div>
            <div className={styles.kpiFoot}>
              <span>{stats.date}</span>
              <div className={styles.bars}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <span key={i} className={styles.bar} style={{ height: `${30 + ((i * 7) % 60)}%` }} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.dishesRow}>
        {[0, 1].map((col) => (
          <div key={col} className={styles.dishCard}>
            <div className={styles.dishHead}>
              <h3>Popular Dishes</h3>
              <button className={styles.seeAll} onClick={() => col === 0 ? setShowAll((s) => !s) : navigate('/menu')}>
                {col === 0 ? (showAll ? 'Show Less' : 'See All') : 'See All'}
              </button>
            </div>
            <div className={styles.dishList}>
              {popularDishes.slice(0, col === 0 && showAll ? popularDishes.length : 3).map((d, i) => (
                <div key={i} className={styles.dish} onClick={() => navigate('/menu')}>
                  <img src={d.image} alt={d.name} className={styles.dishImg} />
                  <div className={styles.dishInfo}>
                    <div className={styles.dishName}>{d.name}</div>
                    <div className={styles.dishServe}>Serving : {d.serving}</div>
                  </div>
                  <div className={styles.dishRight}>
                    <div className={d.inStock ? styles.inStock : styles.outStock}>
                      {d.inStock ? 'In Stock' : 'Out of Stock'}
                    </div>
                    <div className={styles.dishPrice}>$ {d.price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.overview}>
        <div className={styles.overviewHead}>
          <h3>Overview</h3>
          <div className={styles.overviewControls}>
            {(['Daily', 'Weekly', 'Monthly'] as Range[]).map((r) => (
              <button key={r} className={`${styles.tab} ${range === r ? styles.tabActive : ''}`} onClick={() => setRange(r)}>{r}</button>
            ))}
            <button className={styles.export}><ExportIcon size={16} /> Export</button>
          </div>
        </div>
        <div className={styles.legend}>
          <span><i className={styles.dotSales} /> Sales</span>
          <span><i className={styles.dotRev} /> Revenues</span>
        </div>
        <Chart range={range} />
        <div className={styles.months}>
          {CHART[range].labels.map((m) => <span key={m}>{m}</span>)}
        </div>
      </div>
    </>
  );
}

/** Simple SVG dual-line chart for the overview section, switching by range. */
function Chart({ range }: { range: Range }) {
  const { sales, rev } = CHART[range];
  return (
    <svg viewBox="0 0 720 150" className={styles.chart} preserveAspectRatio="none">
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="0" y1={i * 45} x2="720" y2={i * 45} stroke="#2a2a2a" strokeWidth="1" />
      ))}
      <path d={rev} fill="none" stroke="#e5e5e5" strokeWidth="2.5" />
      <path d={sales} fill="none" stroke="var(--foodey-orange)" strokeWidth="3" />
    </svg>
  );
}
