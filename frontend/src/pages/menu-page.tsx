import React, { useState } from 'react';
import { Topbar } from '../components/topbar.js';
import { Drawer } from '../components/drawer.js';
import { ImageIcon, ChevronDown, EditIcon, TrashIcon } from '../components/icons.js';
import { useApi } from '../data/use-api.js';
import { mockCategories, mockMenuItems } from '../data/mock-data.js';
import type { MenuCategory, MenuItem } from '../types.js';
import styles from './menu-page.module.css';
import form from '../components/form.module.css';

const TABS = ['Normal menu', 'Special Deals', 'New Year Special', 'Deserts and Drinks'];

/** Menu management: categories grid, special-menu tabs and the items table. */
export function MenuPage() {
  const { data: categories } = useApi<MenuCategory[]>('categories', mockCategories);
  const { data: items } = useApi<MenuItem[]>('menu', mockMenuItems);
  const [activeCat, setActiveCat] = useState('all');
  const [tab, setTab] = useState(0);
  const [drawer, setDrawer] = useState<'category' | null>(null);

  return (
    <>
      <Topbar title="Menu" />

      <div className={styles.catHead}>
        <h2 className={styles.h2}>Categories</h2>
        <button className={styles.addCat} onClick={() => setDrawer('category')}>Add New Category</button>
      </div>

      <div className={styles.cats}>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`${styles.cat} ${activeCat === c.id ? styles.catActive : ''}`}
            onClick={() => setActiveCat(c.id)}
          >
            <span className={styles.catIcon}>{iconFor(c.icon)}</span>
            <div className={styles.catName}>{c.name}</div>
            <div className={styles.catItems}>{c.items} items</div>
          </button>
        ))}
      </div>

      <h2 className={styles.h2} style={{ marginTop: 30 }}>Special menu items</h2>
      <div className={styles.tabsRow}>
        <div className={styles.tabs}>
          {TABS.map((t, i) => (
            <button key={t} className={`${styles.tab} ${tab === i ? styles.tabActive : ''}`} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>
        <button className={styles.addItem}>Add Menu Item</button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>Product</th><th>Product Name</th><th>Item ID</th><th>Stock</th><th>Category</th><th>Price</th><th>Availability</th><th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((m, i) => (
              <tr key={i}>
                <td><input type="checkbox" /></td>
                <td><img src={m.image} alt="" className={styles.prodImg} /></td>
                <td>
                  <div className={styles.prodName}>{m.name}</div>
                  <div className={styles.prodDesc}>{m.description}</div>
                </td>
                <td>{m.itemId}</td>
                <td>{m.stock}</td>
                <td>{m.category}</td>
                <td>${m.price.toFixed(2)}</td>
                <td><span className={styles.avail}>{m.availability}</span></td>
                <td>
                  <div className={styles.acts}>
                    <button className={styles.act}><EditIcon size={18} /></button>
                    <button className={styles.del}><TrashIcon size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Drawer open={drawer === 'category'} onClose={() => setDrawer(null)}>
        <h2 className={form.drawerTitle}>Add New Category</h2>
        <div className={form.avatarUpload}><ImageIcon size={48} /></div>
        <span className={form.changePic}>Change Icon</span>
        <div className={form.grid}>
          <div className={`${form.field} ${form.fieldFull}`}><label className={form.label}>Category Name</label><input className={form.input} placeholder="Enter category name" /></div>
          <div className={`${form.field} ${form.fieldFull}`}><label className={form.label}>Select Menu</label>
            <div className={form.inputIcon}><select className={form.select}><option>Select Menu</option><option>Normal menu</option><option>Special Deals</option></select><span className={form.icn}><ChevronDown size={18} /></span></div>
          </div>
          <div className={`${form.field} ${form.fieldFull}`}><label className={form.label}>Description</label><textarea className={form.textarea} placeholder="Write your category description here" /></div>
        </div>
        <div className={form.actions}>
          <button className={form.cancel} onClick={() => setDrawer(null)}>Cancel</button>
          <button className={form.save} onClick={() => setDrawer(null)}>Save</button>
        </div>
      </Drawer>
    </>
  );
}

function iconFor(icon: string) {
  const map: Record<string, string> = { grid: '▦', pizza: '🍕', burger: '🍔', chicken: '🍗', bakery: '🍞', beverage: '🥤' };
  return map[icon] || '🍽️';
}
