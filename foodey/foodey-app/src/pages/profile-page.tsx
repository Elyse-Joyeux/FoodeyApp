import React, { useState } from 'react';
import { Topbar } from '../components/topbar.js';
import { UserIcon, ChevronDown, LogoutIcon, EyeOffIcon, PlusIcon } from '../components/icons.js';
import { useApi, apiPost, apiPut, apiDelete } from '../data/use-api.js';
import styles from './profile-page.module.css';

const AVATAR = 'https://api.v2.bit.cloud/file-upload/api/bf3c8ae9929e2601ca4c6e7caa146a1e.png';

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
  const INITIAL = { name: 'Jacques Kagabo', email: 'kagabo12@gmail.com', address: '123 Street, Kigali, Gikondo', password: '', confirm: '' };
  const [profile, setProfile] = useState(INITIAL);
  const [saved, setSaved] = useState(false);
  const dirty = JSON.stringify(profile) !== JSON.stringify(INITIAL);
  const set = (k: keyof typeof INITIAL) => (v: string) => setProfile((p) => ({ ...p, [k]: v }));

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Personal Information</h3>
      <div className={styles.person}>
        <img src={AVATAR} alt="" className={styles.personAvatar} />
        <div>
          <div className={styles.personName}>{profile.name}</div>
          <div className={styles.personRole}>Manager</div>
        </div>
      </div>

      <Field label="Full Name" value={profile.name} onChange={set('name')} />
      <Field label="Email" value={profile.email} onChange={set('email')} />
      <Field label="Address" value={profile.address} onChange={set('address')} />
      <div className={styles.twoCol}>
        <PassField label="Password" value={profile.password} onChange={set('password')} />
        <PassField label="Confirm Password" value={profile.confirm} onChange={set('confirm')} />
      </div>

      <div className={styles.actions}>
        <button className={styles.discard} onClick={() => setProfile(INITIAL)} disabled={!dirty}>Discard Changes</button>
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
        <div className={styles.addCardHead}>
          <div className={styles.addCardIcon}><UserIcon size={20} /></div>
          <div>
            <h3 className={styles.addCardTitle}>Add New User</h3>
            <p className={styles.addCardSub}>Create an account and assign access permissions</p>
          </div>
        </div>
        <div className={styles.addGrid}>
          <div className={styles.addField}>
            <label className={styles.addLabel}>Full Name</label>
            <input className={styles.addInput} placeholder="e.g. John Doe" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div className={styles.addField}>
            <label className={styles.addLabel}>Email</label>
            <input className={styles.addInput} placeholder="e.g. john@foodey.com" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
          </div>
          <div className={styles.addField}>
            <label className={styles.addLabel}>Role</label>
            <select className={styles.addInput} value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}>
              <option value="">Select role</option>
              <option>Admin</option>
              <option>Sub Admin</option>
              <option>Manager</option>
            </select>
          </div>
          <div className={styles.addField}>
            <label className={styles.addLabel}>Password</label>
            <div className={styles.passWrap}>
              <input className={styles.addInput} type={showPass ? 'text' : 'password'} placeholder="Set a password" value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} />
              <button className={styles.passEye} onClick={() => setShowPass((s) => !s)} type="button"><EyeOffIcon size={18} /></button>
            </div>
          </div>
        </div>
        <button className={styles.addBtn} onClick={addUser}><PlusIcon size={18} /> Add User</button>
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

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      <input className={styles.fieldInput} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function PassField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      <div className={styles.passInput}>
        <input type={show ? 'text' : 'password'} value={value} placeholder="Enter password" onChange={(e) => onChange(e.target.value)} className={styles.passField} />
        <button className={styles.passEye} onClick={() => setShow((s) => !s)} type="button"><EyeOffIcon size={18} /></button>
      </div>
    </div>
  );
}
