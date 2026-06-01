import React, { useState } from 'react';
import { Topbar } from '../components/topbar.js';
import { Drawer } from '../components/drawer.js';
import { ImageIcon, ChevronDown, EditIcon, TrashIcon, GridIcon, PizzaIcon, BurgerIcon, DrumstickIcon, BreadIcon, DrinkIcon } from '../components/icons.js';
import { ImagePicker } from '../components/image-picker.js';
import { useApi, apiPost, apiPut, apiDelete } from '../data/use-api.js';
import { mockCategories, mockMenuItems } from '../data/mock-data.js';
import type { MenuCategory, MenuItem } from '../types.js';
import styles from './menu-page.module.css';
import form from '../components/form.module.css';

const TABS = ['Normal menu', 'Special Deals', 'New Year Special', 'Deserts and Drinks'];
type ItemDraft = { name: string; description: string; category: string; stock: string; price: string; availability: MenuItem['availability']; menu: string; image: string };

const emptyItem = (menu: string): ItemDraft => ({
  name: '', description: '', category: 'Chicken', stock: '100 items', price: '', availability: 'In Stock', menu, image: '',
});

/** Menu management: filterable categories grid, working special-menu tabs and item CRUD. */
export function MenuPage() {
  const { data: categories, refetch: refetchCats } = useApi<MenuCategory[]>('categories', mockCategories);
  const { data: items, setData: setItems, refetch } = useApi<MenuItem[]>('menu', mockMenuItems);
  const [activeCat, setActiveCat] = useState('all');
  const [tab, setTab] = useState(0);
  const [drawer, setDrawer] = useState<'category' | 'item' | null>(null);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [catName, setCatName] = useState('');

  const activeCatName = categories.find((c) => c.id === activeCat)?.name;
  const visible = items.filter((m) => {
    const catOk = activeCat === 'all' || !activeCatName || m.category === activeCatName;
    const menuOk = !m.menu || m.menu === TABS[tab];
    return catOk && menuOk;
  });

  const saveCategory = async () => {
    await apiPost('categories', { name: catName || 'New Category', icon: 'grid' });
    setCatName('');
    setDrawer(null);
    refetchCats();
  };

  const saveItem = async (draft: ItemDraft) => {
    const payload = {
      ...draft, price: Number(String(draft.price).replace(/[^0-9.]/g, '')) || 0,
      ...(draft.image ? {} : { image: undefined }),
    };
    if (editing) {
      await apiPut(`menu/${editing.id}`, payload);
    } else {
      await apiPost('menu', payload);
    }
    setDrawer(null);
    setEditing(null);
    refetch();
  };

  const deleteItem = async (id: string) => {
    setItems((prev) => prev.filter((m) => m.id !== id));
    await apiDelete(`menu/${id}`);
  };

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
        <button className={styles.addItem} onClick={() => { setEditing(null); setDrawer('item'); }}>Add Menu Item</button>
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
            {visible.length === 0 ? (
              <tr><td colSpan={9} className={styles.emptyRow}>No items in {activeCatName && activeCat !== 'all' ? `${activeCatName} / ` : ''}{TABS[tab]}.</td></tr>
            ) : visible.map((m) => (
              <tr key={m.id}>
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
                <td><span className={m.availability === 'In Stock' ? styles.avail : styles.unavail}>{m.availability}</span></td>
                <td>
                  <div className={styles.acts}>
                    <button className={styles.act} onClick={() => { setEditing(m); setDrawer('item'); }}><EditIcon size={18} /></button>
                    <button className={styles.del} onClick={() => deleteItem(m.id)}><TrashIcon size={18} /></button>
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
          <div className={`${form.field} ${form.fieldFull}`}><label className={form.label}>Category Name</label><input className={form.input} placeholder="Enter category name" value={catName} onChange={(e) => setCatName(e.target.value)} /></div>
          <div className={`${form.field} ${form.fieldFull}`}><label className={form.label}>Select Menu</label>
            <div className={form.inputIcon}><select className={form.select}><option>Normal menu</option><option>Special Deals</option><option>New Year Special</option><option>Deserts and Drinks</option></select><span className={form.icn}><ChevronDown size={18} /></span></div>
          </div>
          <div className={`${form.field} ${form.fieldFull}`}><label className={form.label}>Description</label><textarea className={form.textarea} placeholder="Write your category description here" /></div>
        </div>
        <div className={form.actions}>
          <button className={form.cancel} onClick={() => setDrawer(null)}>Cancel</button>
          <button className={form.save} onClick={saveCategory}>Save</button>
        </div>
      </Drawer>

      <Drawer open={drawer === 'item'} onClose={() => { setDrawer(null); setEditing(null); }}>
        <MenuItemForm
          title={editing ? 'Edit Menu Item' : 'Add Menu Item'}
          item={editing}
          defaultMenu={TABS[tab]}
          categories={categories.filter((c) => c.id !== 'all').map((c) => c.name)}
          onSave={saveItem}
          onClose={() => { setDrawer(null); setEditing(null); }}
        />
      </Drawer>
    </>
  );
}

/** Add/Edit menu item form rendered inside the drawer (controlled inputs). */
function MenuItemForm({ title, item, defaultMenu, categories, onSave, onClose }: {
  title: string; item?: MenuItem | null; defaultMenu: string; categories: string[];
  onSave: (d: ItemDraft) => void; onClose: () => void;
}) {
  const [draft, setDraft] = useState<ItemDraft>(item ? {
    name: item.name, description: item.description, category: item.category, stock: item.stock,
    price: `${item.price.toFixed(2)}`, availability: item.availability, menu: item.menu || defaultMenu, image: item.image,
  } : emptyItem(defaultMenu));

  const set = (k: keyof ItemDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setDraft((d) => ({ ...d, [k]: e.target.value }));

  return (
    <>
      <h2 className={form.drawerTitle}>{title}</h2>
      <ImagePicker value={draft.image} onChange={(url) => setDraft((d) => ({ ...d, image: url }))} label="Change product picture" />
      <div className={form.grid}>
        <div className={form.field}><label className={form.label}>Product Name</label><input className={form.input} placeholder="Enter product name" value={draft.name} onChange={set('name')} /></div>
        <div className={form.field}><label className={form.label}>Category</label>
          <div className={form.inputIcon}><select className={form.select} value={draft.category} onChange={set('category')}>{categories.map((c) => <option key={c}>{c}</option>)}</select><span className={form.icn}><ChevronDown size={18} /></span></div>
        </div>
        <div className={form.field}><label className={form.label}>Stock</label><input className={form.input} placeholder="e.g. 122 items" value={draft.stock} onChange={set('stock')} /></div>
        <div className={form.field}><label className={form.label}>Price</label><input className={form.input} placeholder="Enter price" value={draft.price} onChange={set('price')} /></div>
        <div className={form.field}><label className={form.label}>Availability</label>
          <div className={form.inputIcon}><select className={form.select} value={draft.availability} onChange={set('availability')}><option>In Stock</option><option>Out of Stock</option></select><span className={form.icn}><ChevronDown size={18} /></span></div>
        </div>
        <div className={form.field}><label className={form.label}>Menu</label>
          <div className={form.inputIcon}><select className={form.select} value={draft.menu} onChange={set('menu')}>{TABS.map((t) => <option key={t}>{t}</option>)}</select><span className={form.icn}><ChevronDown size={18} /></span></div>
        </div>
        <div className={`${form.field} ${form.fieldFull}`}><label className={form.label}>Description</label><textarea className={form.textarea} placeholder="Write the item description here" value={draft.description} onChange={set('description')} /></div>
      </div>
      <div className={form.actions}>
        <button className={form.cancel} onClick={onClose}>Cancel</button>
        <button className={form.save} onClick={() => onSave(draft)}>{item ? 'Save Item' : 'Add Item'}</button>
      </div>
    </>
  );
}

function iconFor(icon: string) {
  switch (icon) {
    case 'pizza': return <PizzaIcon size={24} />;
    case 'burger': return <BurgerIcon size={24} />;
    case 'chicken': return <DrumstickIcon size={24} />;
    case 'bakery': return <BreadIcon size={24} />;
    case 'beverage': return <DrinkIcon size={24} />;
    default: return <GridIcon size={24} />;
  }
}
