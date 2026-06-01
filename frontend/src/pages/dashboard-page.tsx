import React from 'react';
import { Topbar } from '../components/topbar.js';
import { DollarIcon, TableIcon, ExportIcon } from '../components/icons.js';
import { useApi } from '../data/use-api.js';
import { mockDashboardStats, mockPopularDishes } from '../data/mock-data.js';
import type { DashboardStats, Dish } from '../types.js';
import styles from './dashboard-page.module.css';

type DashboardData = { stats: DashboardStats; popularDishes: Dish[] };

/** Main dashboard with KPI cards, popular dishes lists and an overview chart. */
export function DashboardPage() {
  const { data } = useApi<DashboardData>('dashboard', {
    stats: mockDashboardStats,
    popularDishes: mockPopularDishes,
  });
  const { stats, popularDishes } = data;

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
              <span className={styles.seeAll}>See All</span>
            </div>
            <div className={styles.dishList}>
              {popularDishes.slice(0, 3).map((d, i) => (
                <div key={i} className={styles.dish}>
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
            <button className={`${styles.tab} ${styles.tabActive}`}>Daily</button>
            <button className={styles.tab}>Weekly</button>
            <button className={styles.tab}>Monthly</button>
            <button className={styles.export}><ExportIcon size={16} /> Export</button>
          </div>
        </div>
        <div className={styles.legend}>
          <span><i className={styles.dotSales} /> Sales</span>
          <span><i className={styles.dotRev} /> Revenues</span>
        </div>
        <Chart />
        <div className={styles.months}>
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m) => <span key={m}>{m}</span>)}
        </div>
      </div>
    </>
  );
}

/** Simple SVG dual-line chart for the overview section. */
function Chart() {
  const sales = 'M0,90 C80,70 140,20 220,30 C300,40 360,110 440,100 C520,92 600,70 720,80';
  const rev = 'M0,100 C80,95 140,80 220,105 C300,125 360,70 440,95 C520,115 600,90 720,85';
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
