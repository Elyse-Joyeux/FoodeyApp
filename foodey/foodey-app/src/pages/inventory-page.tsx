import React, { useState } from 'react';
import { Topbar } from '../components/topbar.js';
import { Drawer } from '../components/drawer.js';
import { ImageIcon, ChevronDown, EditIcon, TrashIcon } from '../components/icons.js';
import { useApi, apiPost, apiPut, apiDelete } from '../data/use-api.js';
import { mockInventory } from '../data/mock-data.js';
import type { InventoryItem } from '../types.js';
import styles from './inventory-page.module.css';
import form from '../components/form.module.css';

const STATUS = [
  { key: 'All', count: 150 },
  { key: 'Active', count: 120 },
  { key: 'Inactive', count: 10 },
  { key: 'Draft', count: 10 },
];

type InvDraft = { name: string; category: string; status: InventoryItem['status']; price: string };

/** Inventory page: filter panel on the left, product list on the right, add/edit drawers. */
export function InventoryPage() {
  const { data: items, setData: setItems, refetch } = useApi<InventoryItem[]>('inventory', mockInventory);
  const [status, setStatus] = useState('All');
  const [drawer, setDrawer] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<InventoryItem | null>(null);

  const shown = status === 'All' ? items : items.filter((i) => i.status === status);

  const save = async (draft: InvDraft) => {
    const payload = {
      name: draft.name, category: draft.category, status: draft.status,
      price: Number(String(draft.price).replace(/[^0-9.]/g, '')) || 0,
    };
    if (drawer === 'edit' && editing) {
      await apiPut(`inventory/${editing.id}`, payload);
    } else {
      await apiPost('inventory', payload);
    }
    setDrawer(null);
    setEditing(null);
    refetch();
  };

  const remove = async (id: string) => {
    setItems((prev) => prev.filter((m) => m.id !== id));
    await apiDelete(`inventory/${id}`);
  };

  return (
    <>
      <Topbar title="Inventory" />

      <div className={styles.headRow}>
        <h2 className={styles.count}><strong>{items.length}</strong> total products</h2>
        <button className={styles.addBtn} onClick={() => { setEditing(null); setDrawer('add'); }}>Add New Inventory</button>
      </div>

      <div className={styles.layout}>
        <aside className={styles.filters}>
          <h3 className={styles.filterTitle}>Product Status</h3>
          <div className={styles.statusGrid}>
            {STATUS.map((s) => (
              <button key={s.key} className={`${styles.statusBtn} ${status === s.key ? styles.statusActive : ''}`} onClick={() => setStatus(s.key)}>
                <span>{s.key}</span><span className={styles.badge}>{s.count}</span>
              </button>
            ))}
          </div>

          <Filter label="Category"><div className={form.inputIcon}><select className={form.select}><option>All</option><option>Chicken</option><option>Pizza</option></select><span className={form.icn}><ChevronDown size={18} /></span></div></Filter>
          <Filter label="Stock"><div className={form.inputIcon}><select className={form.select}><option>InStock</option><option>Out of Stock</option></select><span className={form.icn}><ChevronDown size={18} /></span></div></Filter>
          <Filter label="Value"><div className={form.inputIcon}><select className={form.select}><option>Litre</option><option>Kg</option></select><span className={form.icn}><ChevronDown size={18} /></span></div></Filter>
          <Filter label="Value"><input className={form.input} defaultValue="50" /></Filter>
          <Filter label="Price"><div className={form.inputIcon}><input className={form.input} defaultValue="120" /><span className={form.icn} style={{ color: 'var(--foodey-orange)' }}>$</span></div></Filter>

          <button className={styles.reset} onClick={() => setStatus('All')}>Reset filters</button>
        </aside>

        <div className={styles.list}>
          {shown.map((item) => (
            <div key={item.id} className={styles.row}>
              <img src={item.image} alt="" className={styles.rowImg} />
              <div className={styles.rowName}>
                <div className={styles.name}>{item.name}</div>
                <div className={styles.sub}>{item.stockInfo}</div>
              </div>
              <div className={styles.col}><div className={styles.colLabel}>Status</div><div className={styles.colVal}>{item.status}</div></div>
              <div className={styles.col}><div className={styles.colLabel}>Category</div><div className={styles.colVal}>{item.category}</div></div>
              <div className={styles.col}><div className={styles.colLabel}>Retail Price</div><div className={styles.colVal}>${item.price.toFixed(2)}</div></div>
              <button className={styles.act} onClick={() => { setEditing(item); setDrawer('edit'); }}><EditIcon size={18} /></button>
              <button className={styles.del} onClick={() => remove(item.id)}><TrashIcon size={18} /></button>
            </div>
          ))}
        </div>
      </div>

      <Drawer open={drawer !== null} onClose={() => { setDrawer(null); setEditing(null); }}>
        <InventoryForm title={drawer === 'edit' ? 'Edit Inventory' : 'Add New Inventory'} item={editing} onSave={save} onClose={() => { setDrawer(null); setEditing(null); }} />
      </Drawer>
    </>
  );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.filter}>
      <label className={styles.filterLabel}>{label}</label>
      {children}
    </div>
  );
}

/** Add/Edit inventory form rendered inside the drawer (controlled inputs). */
function InventoryForm({ title, item, onSave, onClose }: { title: string; item?: InventoryItem | null; onSave: (d: InvDraft) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<InvDraft>(item ? {
    name: item.name, category: item.category, status: item.status, price: `$${item.price.toFixed(2)}`,
  } : { name: '', category: 'Chicken', status: 'Active', price: '' });

  return (
    <>
      <h2 className={form.drawerTitle}>{title}</h2>
      <div className={form.avatarUpload}>{item ? <img src={item.image} alt="" /> : <ImageIcon size={48} />}</div>
      <span className={form.changePic}>Change profile picture</span>
      <div className={form.grid}>
        <div className={form.field}><label className={form.label}>Name</label><input className={form.input} placeholder="Enter full name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
        <div className={form.field}><label className={form.label}>Category</label><div className={form.inputIcon}><select className={form.select} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}><option>Chicken</option><option>Pizza</option><option>Bakery</option></select><span className={form.icn}><ChevronDown size={18} /></span></div></div>
        <div className={form.field}><label className={form.label}>Quantity</label><div className={form.inputIcon}><select className={form.select} defaultValue={item ? '10' : '01'}><option>01</option><option>10</option></select><span className={form.icn}><ChevronDown size={18} /></span></div></div>
        <div className={form.field}><label className={form.label}>Stock</label><div className={form.inputIcon}><select className={form.select}><option>InStock</option><option>Out of Stock</option></select><span className={form.icn}><ChevronDown size={18} /></span></div></div>
        <div className={`${form.field} ${form.fieldFull}`}><label className={form.label}>Status</label><div className={form.inputIcon}><select className={form.select} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as InventoryItem['status'] })}><option>Active</option><option>Inactive</option><option>Draft</option></select><span className={form.icn}><ChevronDown size={18} /></span></div></div>
        <div className={`${form.field} ${form.fieldFull}`}><label className={form.label}>Price</label><input className={form.input} placeholder="Enter inventory price" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} /></div>
        <div className={`${form.field} ${form.fieldFull}`}>
          <div className={form.radioRow}><span className={form.label}>Perishable</span>
            <label className={form.radio}><input type="radio" name="perish" defaultChecked /> Yes</label>
            <label className={form.radio}><input type="radio" name="perish" /> No</label>
          </div>
        </div>
      </div>
      <div className={form.actions}>
        <button className={form.cancel} onClick={onClose}>Cancel</button>
        <button className={form.save} onClick={() => onSave(draft)}>Save</button>
      </div>
    </>
  );
}
