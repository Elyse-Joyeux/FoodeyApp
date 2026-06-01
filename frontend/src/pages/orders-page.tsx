import React, { useState } from 'react';
import { Topbar } from '../components/topbar.js';
import { SearchIcon, EditIcon, TrashIcon, CheckIcon, ChevronDown } from '../components/icons.js';
import { useApi } from '../data/use-api.js';
import { mockOrders } from '../data/mock-data.js';
import type { Order } from '../types.js';
import styles from './orders-page.module.css';

const TABS = ['All', 'In Process', 'Completed', 'Cancelled'];

/** Orders / Table page showing order cards grouped in a grid. */
export function OrdersPage() {
  const { data: orders } = useApi<Order[]>('orders', mockOrders);
  const [tab, setTab] = useState('All');

  const filtered = tab === 'All' ? orders : orders.filter((o) =>
    tab === 'In Process' ? o.status === 'In Process' :
    tab === 'Completed' ? o.status === 'Completed' || o.status === 'Ready' :
    o.status === 'Cancelled');

  return (
    <>
      <Topbar title="Orders/Table" />

      <div className={styles.controls}>
        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        <div className={styles.right}>
          <button className={styles.addBtn}>Add New Order</button>
          <div className={styles.search}><SearchIcon size={20} /><input placeholder="Search a name, order, etc" /></div>
        </div>
      </div>

      <div className={styles.grid}>
        {filtered.map((o) => (
          <div key={o.id} className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.num}>{o.number}</span>
              <div className={styles.cust}>
                <div className={styles.custName}>{o.customer}</div>
                <div className={styles.orderId}>Order {o.orderId}</div>
              </div>
              <Badge status={o.status} />
            </div>
            {(o.status === 'Ready' || o.status === 'In Process') && (
              <div className={styles.subStatusRow}>
                <span className={o.status === 'Ready' ? styles.dotGreen : styles.dotOrange} />
                <span className={styles.subStatus}>{o.subStatus}</span>
                <ChevronDown size={16} />
              </div>
            )}
            <div className={styles.dateRow}><span>{o.date}</span><span>{o.time}</span></div>
            <table className={styles.items}>
              <thead><tr><th>Qnty</th><th>Items</th><th>Price</th></tr></thead>
              <tbody>
                {o.items.map((it, i) => (
                  <tr key={i}><td>{it.qty}</td><td>{it.name}</td><td>${it.price}</td></tr>
                ))}
              </tbody>
            </table>
            <div className={styles.subTotal}><span>Sub total</span><span>${o.subTotal}</span></div>
            <div className={styles.cardActions}>
              <button className={styles.iconBtn}><EditIcon size={18} /></button>
              <button className={styles.iconBtn}><TrashIcon size={18} /></button>
              <button className={styles.pay}>Pay Bill</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Badge({ status }: { status: Order['status'] }) {
  if (status === 'In Process') return <span className={styles.badgeProcess}>⏱ In Process</span>;
  if (status === 'Completed') return <span className={styles.badgeDone}><CheckIcon size={14} /> Completed</span>;
  return <span className={styles.badgeReady}><CheckIcon size={14} /> Ready</span>;
}
