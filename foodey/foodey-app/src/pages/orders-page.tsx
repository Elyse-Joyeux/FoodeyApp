import React, { useState } from 'react';
import { Topbar } from '../components/topbar.js';
import { Drawer } from '../components/drawer.js';
import { SearchIcon, EditIcon, TrashIcon, CheckIcon, ChevronDown, PlusIcon, ClockIcon } from '../components/icons.js';
import { useApi, apiPost, apiPut, apiDelete } from '../data/use-api.js';
import { mockOrders, mockMenuItems } from '../data/mock-data.js';
import type { Order, MenuItem } from '../types.js';
import styles from './orders-page.module.css';
import form from '../components/form.module.css';

const TABS = ['All', 'Ready', 'In Process', 'Completed', 'Cancelled'];
type OrderItem = { qty: number; name: string; price: number };

/** Formats a Date as a friendly clock time, e.g. "4:48 PM". */
function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

type OrderDraft = { customer: string; time: string; items: OrderItem[] };

const emptyDraft = (): OrderDraft => ({
  customer: '', time: formatTime(new Date()), items: [],
});

/** Orders / Table page with working status tabs and an add/edit drawer. */
export function OrdersPage() {
  const { data: orders, setData: setOrders, refetch } = useApi<Order[]>('orders', mockOrders);
  const { data: menu } = useApi<MenuItem[]>('menu', mockMenuItems);
  const [tab, setTab] = useState('All');
  const [query, setQuery] = useState('');
  const [drawer, setDrawer] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Order | null>(null);

  const byTab = tab === 'All' ? orders : orders.filter((o) => o.status === tab);
  const filtered = query
    ? byTab.filter((o) => o.customer.toLowerCase().includes(query.toLowerCase()) || o.orderId.includes(query))
    : byTab;

  const save = async (draft: OrderDraft) => {
    const items = draft.items.filter((it) => it.name.trim());
    const subTotal = items.reduce((s, it) => s + it.qty * it.price, 0);
    if (drawer === 'edit' && editing) {
      // Editing keeps the existing order id, status and placed time untouched.
      await apiPut(`orders/${editing.id}`, { customer: draft.customer, items, subTotal });
    } else {
      // New order: id is assigned later (on completion), status starts as In Process,
      // and the time is stamped to the moment the order is placed.
      const payload = {
        customer: draft.customer,
        orderId: '',
        status: 'In Process' as const,
        subStatus: 'Cooking Now',
        time: draft.time,
        date: new Date().toLocaleDateString('en-GB'),
        items, subTotal,
      };
      await apiPost('orders', payload);
    }
    setDrawer(null);
    setEditing(null);
    refetch();
  };

  const removeOrder = async (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    await apiDelete(`orders/${id}`);
  };

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
          <button className={styles.addBtn} onClick={() => { setEditing(null); setDrawer('add'); }}>Add New Order</button>
          <div className={styles.search}><SearchIcon size={20} /><input placeholder="Search a name, order, etc" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>No {tab !== 'All' ? tab.toLowerCase() : ''} orders to show.</div>
      ) : (
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
                <button className={styles.iconBtn} onClick={() => { setEditing(o); setDrawer('edit'); }}><EditIcon size={18} /></button>
                <button className={styles.iconBtn} onClick={() => removeOrder(o.id)}><TrashIcon size={18} /></button>
                <button className={styles.pay}>Pay Bill</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Drawer open={drawer !== null} onClose={() => { setDrawer(null); setEditing(null); }}>
        <OrderForm
          title={drawer === 'edit' ? 'Edit Order' : 'Add New Order'}
          order={editing}
          menu={menu}
          onSave={save}
          onClose={() => { setDrawer(null); setEditing(null); }}
        />
      </Drawer>
    </>
  );
}

function Badge({ status }: { status: Order['status'] }) {
  if (status === 'In Process') return <span className={styles.badgeProcess}>⏱ In Process</span>;
  if (status === 'Completed') return <span className={styles.badgeDone}><CheckIcon size={14} /> Completed</span>;
  if (status === 'Cancelled') return <span className={styles.badgeCancel}>✕ Cancelled</span>;
  return <span className={styles.badgeReady}><CheckIcon size={14} /> Ready</span>;
}

/**
 * Add/Edit order form. The user only enters the customer name and picks dishes
 * from the menu (prices fill in automatically). The order id is assigned on
 * completion, the status always starts as In Process, and the time is stamped
 * automatically — so none of those are typed by hand. A live summary tells the
 * user what was ordered and the total worth.
 */
function OrderForm({ title, order, menu, onSave, onClose }: {
  title: string; order?: Order | null; menu: MenuItem[];
  onSave: (d: OrderDraft) => void; onClose: () => void;
}) {
  const [draft, setDraft] = useState<OrderDraft>(order ? {
    customer: order.customer,
    time: order.time, items: order.items.map((it) => ({ ...it })),
  } : emptyDraft());

  const priceOf = (name: string) => menu.find((m) => m.name === name)?.price || 0;

  const pickDish = (idx: number, name: string) => {
    setDraft((d) => ({
      ...d,
      items: d.items.map((it, i) => i === idx ? { ...it, name, price: priceOf(name) } : it),
    }));
  };
  const setQty = (idx: number, qty: number) => {
    setDraft((d) => ({ ...d, items: d.items.map((it, i) => i === idx ? { ...it, qty: Math.max(1, qty) } : it) }));
  };
  const addItem = () => {
    const first = menu[0];
    setDraft((d) => ({ ...d, items: [...d.items, { qty: 1, name: first?.name || '', price: first?.price || 0 }] }));
  };
  const removeItem = (idx: number) => setDraft((d) => ({ ...d, items: d.items.filter((_, i) => i !== idx) }));

  const valid = draft.items.filter((it) => it.name.trim());
  const total = valid.reduce((s, it) => s + it.qty * it.price, 0);
  const itemSummary = valid.map((it) => `${it.qty}× ${it.name}`).join(', ');

  return (
    <>
      <h2 className={form.drawerTitle}>{title}</h2>
      <div className={form.grid}>
        <div className={form.field}><label className={form.label}>Customer Name</label><input className={form.input} placeholder="Enter customer name" value={draft.customer} onChange={(e) => setDraft({ ...draft, customer: e.target.value })} /></div>
        <div className={form.field}><label className={form.label}>Time placed</label>
          <div className={form.inputIcon}><input className={form.input} value={draft.time} readOnly /><span className={form.icn}><ClockIcon size={18} /></span></div>
        </div>
      </div>
      <p className={styles.autoNote}>Order ID is assigned once the order is completed, and the status starts as <strong>In Process</strong>.</p>

      <div className={styles.itemsHead}>
        <label className={form.label}>Order Items</label>
        <button className={styles.addItemBtn} type="button" onClick={addItem} disabled={menu.length === 0}><PlusIcon size={16} /> Add dish</button>
      </div>
      <div className={styles.itemRows}>
        <div className={styles.itemRowHead}><span>Qnty</span><span>Dish</span><span>Price</span><span></span></div>
        {draft.items.length === 0 && <div className={styles.noItems}>No dishes yet — click “Add dish” to pick from the menu.</div>}
        {draft.items.map((it, i) => (
          <div key={i} className={styles.itemRow}>
            <input className={form.input} type="number" min={1} value={it.qty} onChange={(e) => setQty(i, Number(e.target.value) || 1)} />
            <div className={form.inputIcon}>
              <select className={form.select} value={it.name} onChange={(e) => pickDish(i, e.target.value)}>
                <option value="">Select a dish…</option>
                {menu.map((m) => <option key={m.id} value={m.name}>{m.name} — ${m.price}</option>)}
              </select>
              <span className={form.icn}><ChevronDown size={18} /></span>
            </div>
            <div className={styles.priceCell}>${(it.qty * it.price).toFixed(2)}</div>
            <button className={styles.removeItem} type="button" onClick={() => removeItem(i)}><TrashIcon size={16} /></button>
          </div>
        ))}
      </div>

      {valid.length > 0 && (
        <div className={styles.summary}>
          You ordered <strong>{itemSummary}</strong>, worth <strong>${total.toFixed(2)}</strong>. Status: <strong>{draft.serviceState}</strong>.
        </div>
      )}

      <div className={form.actions}>
        <button className={form.cancel} onClick={onClose}>Cancel</button>
        <button className={form.save} onClick={() => onSave(draft)} disabled={valid.length === 0}>{order ? 'Save Order' : 'Create Order'}</button>
      </div>
    </>
  );
}
