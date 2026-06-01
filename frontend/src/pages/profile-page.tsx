import React, { useState } from 'react';
import { Topbar } from '../components/topbar.js';
import { UserIcon, ChevronDown, LogoutIcon, EyeOffIcon } from '../components/icons.js';
import { useApi, apiPost, apiPut, apiDelete } from '../data/use-api.js';
import styles from './profile-page.module.css';

const AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&q=80&fit=crop&crop=faces';

type Section = 'profile' | 'access';
type Perm = 'Dashboard' | 'Reports' | 'Inventory' | 'Orders' | 'Settings';
type AccessUser = { id: string; name: string; email: string; role: string; permissions: Record<Perm, boolean> };

const PERMS: Perm[] = ['Dashboard', 'Reports', 'Inventory', 'Orders', 'Settings'];
const FALLBACK: AccessUser[] = [
  { id: 'au1', name: 'Abubakar Sherazi', email: 'kagabo12@gmail.com', role: 'Admin', permissions: { Dashboard: true, Reports: true, Inventory: true, Orders: true, Settings: true } },
  { id: 'au2', name: 'Annes Ansari', email: 'annesansari@gmail.com', role: 'Sub Admin', permissions: { Dashboard: true, Reports: true, Inventory: true, Orders: true, Settings: true } },
];

/** Profile page with My Profile and Manage Access sections. */
export function ProfilePage() {
  const [section, setSection] = useState<Section>('profile');

  return (
    <>
      <Topbar title="Profile" />
      <div className={styles.layout}>
        <aside className={styles.menu}>
          <button className={`${styles.menuItem} ${section === 'profile' ? styles.menuActive : ''}`} onClick={() => setSection('profile')}>
            <UserIcon size={20} /> My Profile
          </button>
          <button className={`${styles.menuItem} ${section === 'access' ? styles.menuActive : ''}`} onClick={() => setSection('access')}>
            <ChevronDown size={20} /> Manage Access
          </button>
          <button className={styles.menuItem}><LogoutIcon size={20} /> Logout</button>
        </aside>

        {section === 'profile' ? <MyProfile /> : <ManageAccess />}
      </div>
    </>
  );
}

function MyProfile() {
  const [saved, setSaved] = useState(false);
  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Personal Information</h3>
      <div className={styles.person}>
        <img src={AVATAR} alt="" className={styles.personAvatar} />
        <div>
          <div className={styles.personName}>Jacques Kagabo</div>
          <div className={styles.personRole}>Manager</div>
        </div>
      </div>

      <Field label="Full Name" defaultValue="Jacques Kagabo" />
      <Field label="Email" defaultValue="kagabo12@gmail.com" />
      <Field label="Address" defaultValue="123 Street, Kigali, Gikondo" />
      <div className={styles.twoCol}>
        <PassField label="Password" />
        <PassField label="Confirm Password" />
      </div>

      <div className={styles.actions}>
        <button className={styles.discard}>Discard Changes</button>
        <button className={styles.save} onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1500); }}>
          {saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

function ManageAccess() {
  const { data: users, setData, refetch } = useApi<AccessUser[]>('access-users', FALLBACK);
  const [draft, setDraft] = useState({ name: '', email: '', role: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const toggle = async (userId: string, perm: Perm) => {
    let next = false;
    setData((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      next = !u.permissions[perm];
      return { ...u, permissions: { ...u.permissions, [perm]: next } };
    }));
    await apiPut(`access-users/${userId}/permission`, { perm, value: next });
  };

  const addUser = async () => {
    if (!draft.name) return;
    await apiPost('access-users', { name: draft.name, email: draft.email, role: draft.role || 'Sub Admin' });
    setDraft({ name: '', email: '', role: '', password: '' });
    refetch();
  };

  const removeUser = async (id: string) => {
    setData((prev) => prev.filter((u) => u.id !== id));
    await apiDelete(`access-users/${id}`);
  };

  return (
    <div className={styles.accessLayout}>
      <div className={styles.addCard}>
        <input className={styles.addInput} placeholder="Full Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <input className={styles.addInput} placeholder="Email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
        <input className={styles.addInput} placeholder="Role" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} />
        <div className={styles.passWrap}>
          <input className={styles.addInput} type={showPass ? 'text' : 'password'} placeholder="Password" value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} />
          <button className={styles.passEye} onClick={() => setShowPass((s) => !s)} type="button"><EyeOffIcon size={18} /></button>
        </div>
        <button className={styles.addBtn} onClick={addUser}>Add</button>
      </div>

      <div className={styles.card}>
        {users.map((u) => (
          <div key={u.id} className={styles.accessUser}>
            <div className={styles.accessHead}>
              <span className={styles.accessName}>{u.name}</span>
              <span className={styles.roleTag}>{u.role}</span>
              <button className={styles.removeUser} onClick={() => removeUser(u.id)}>Remove</button>
            </div>
            <div className={styles.accessEmail}>{u.email}</div>
            <div className={styles.perms}>
              {PERMS.map((p) => (
                <div key={p} className={styles.perm}>
                  <div className={styles.permLabel}>{p}</div>
                  <button
                    type="button"
                    className={`${styles.toggle} ${u.permissions[p] ? styles.toggleOn : styles.toggleOff}`}
                    onClick={() => toggle(u.id, p)}
                    aria-pressed={u.permissions[p]}
                  >
                    <span className={styles.knob} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      <input className={styles.fieldInput} defaultValue={defaultValue} />
    </div>
  );
}

function PassField({ label }: { label: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      <div className={styles.passInput}>
        <input type={show ? 'text' : 'password'} defaultValue="secret1" className={styles.passField} />
        <button className={styles.passEye} onClick={() => setShow((s) => !s)} type="button"><EyeOffIcon size={18} /></button>
      </div>
    </div>
  );
}
