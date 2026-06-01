import React, { useState } from 'react';
import { Topbar } from '../components/topbar.js';
import { Drawer } from '../components/drawer.js';
import { ImageIcon, ChevronDown, EditIcon, TrashIcon } from '../components/icons.js';
import { useApi } from '../data/use-api.js';
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

/** Inventory page: filter panel on the left, product list on the right, add/edit drawers. */
export function InventoryPage() {
  const { data: items } = useApi<InventoryItem[]>('inventory', mockInventory);
  const [status, setStatus] = useState('All');
  const [drawer, setDrawer] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<InventoryItem | null>(null);

  return (
    <>
      <Topbar title="Inventory" />

      <div className={styles.headRow}>
        <h2 className={styles.count}><strong>150</strong> total products</h2>
        <button className={styles.addBtn} onClick={() => setDrawer('add')}>Add New Inventory</button>
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

          <button className={styles.reset}>Reset filters</button>
        </aside>

        <div className={styles.list}>
          {items.map((item, i) => (
            <div key={i} className={styles.row}>
              <img src={item.image} alt="" className={styles.rowImg} />
              <div className={styles.rowName}>
                <div className={styles.name}>{item.name}</div>
                <div className={styles.sub}>{item.stockInfo}</div>
              </div>
              <div className={styles.col}><div className={styles.colLabel}>Status</div><div className={styles.colVal}>{item.status}</div></div>
              <div className={styles.col}><div className={styles.colLabel}>Category</div><div className={styles.colVal}>{item.category}</div></div>
              <div className={styles.col}><div className={styles.colLabel}>Retail Price</div><div className={styles.colVal}>${item.price.toFixed(2)}</div></div>
              <button className={styles.act} onClick={() => { setEditing(item); setDrawer('edit'); }}><EditIcon size={18} /></button>
              <button className={styles.del}><TrashIcon size={18} /></button>
            </div>
          ))}
        </div>
      </div>

      <Drawer open={drawer === 'add'} onClose={() => setDrawer(null)}>
        <InventoryForm title="Add New Inventory" onClose={() => setDrawer(null)} />
      </Drawer>
      <Drawer open={drawer === 'edit'} onClose={() => setDrawer(null)}>
        <InventoryForm title="Edit Inventory" item={editing} onClose={() => setDrawer(null)} />
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

/** Add/Edit inventory form rendered inside the drawer. */
function InventoryForm({ title, item, onClose }: { title: string; item?: InventoryItem | null; onClose: () => void }) {
  return (
    <>
      <h2 className={form.drawerTitle}>{title}</h2>
      <div className={form.avatarUpload}>{item ? <img src={item.image} alt="" /> : <ImageIcon size={48} />}</div>
      <span className={form.changePic}>Change profile picture</span>
      <div className={form.grid}>
        <div className={form.field}><label className={form.label}>Name</label><input className={form.input} placeholder="Enter full name" defaultValue={item?.name} /></div>
        <div className={form.field}><label className={form.label}>Category</label><div className={form.inputIcon}><select className={form.select} defaultValue={item?.category || 'All'}><option>All</option><option>Chicken</option><option>Pizza</option></select><span className={form.icn}><ChevronDown size={18} /></span></div></div>
        <div className={form.field}><label className={form.label}>Quantity</label><div className={form.inputIcon}><select className={form.select} defaultValue={item ? '10' : '01'}><option>01</option><option>10</option></select><span className={form.icn}><ChevronDown size={18} /></span></div></div>
        <div className={form.field}><label className={form.label}>Stock</label><div className={form.inputIcon}><select className={form.select}><option>InStock</option><option>Out of Stock</option></select><span className={form.icn}><ChevronDown size={18} /></span></div></div>
        <div className={`${form.field} ${form.fieldFull}`}><label className={form.label}>Status</label><div className={form.inputIcon}><select className={form.select} defaultValue={item?.status || 'Active'}><option>Active</option><option>Inactive</option><option>Draft</option></select><span className={form.icn}><ChevronDown size={18} /></span></div></div>
        <div className={`${form.field} ${form.fieldFull}`}><label className={form.label}>Price</label><input className={form.input} placeholder="Enter inventory price" defaultValue={item ? `$${item.price.toFixed(2)}` : ''} /></div>
        <div className={`${form.field} ${form.fieldFull}`}>
          <div className={form.radioRow}><span className={form.label}>Perishable</span>
            <label className={form.radio}><input type="radio" name="perish" defaultChecked /> Yes</label>
            <label className={form.radio}><input type="radio" name="perish" /> No</label>
          </div>
        </div>
      </div>
      <div className={form.actions}>
        <button className={form.cancel} onClick={onClose}>Cancel</button>
        <button className={form.save} onClick={onClose}>Save</button>
      </div>
    </>
  );
}
