import React, { useState } from 'react';
import { Topbar } from '../components/topbar.js';
import { UserIcon, ChevronDown, LogoutIcon, EyeOffIcon } from '../components/icons.js';
import styles from './profile-page.module.css';

const AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&q=80&fit=crop&crop=faces';

type Section = 'profile' | 'access';

const ACCESS_USERS = [
  { name: 'Abubakar Sherazi', role: 'Admin', email: 'kagabo12@gmail.com' },
  { name: 'Annes Ansari', role: 'Sub Admin', email: 'annesansari@gmail.com' },
];
const PERMS = ['Dashboard', 'Reports', 'Inventory', 'Orders', 'Settings'];

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

      <Field label="Full Name" value="Jacques Kagabo" />
      <Field label="Email" value="kagabo12@gmail.com" />
      <Field label="Address" value="123 Street, Kigali, Gikondo" />
      <div className={styles.twoCol}>
        <PassField label="Password" />
        <PassField label="Confirm Password" />
      </div>

      <div className={styles.actions}>
        <button className={styles.discard}>Discard Changes</button>
        <button className={styles.save}>Save Changes</button>
      </div>
    </div>
  );
}

function ManageAccess() {
  return (
    <div className={styles.card}>
      {ACCESS_USERS.map((u) => (
        <div key={u.name} className={styles.accessUser}>
          <div className={styles.accessHead}>
            <span className={styles.accessName}>{u.name}</span>
            <span className={styles.roleTag}>{u.role}</span>
          </div>
          <div className={styles.accessEmail}>{u.email}</div>
          <div className={styles.perms}>
            {PERMS.map((p) => (
              <div key={p} className={styles.perm}>
                <div className={styles.permLabel}>{p}</div>
                <span className={styles.toggle}><span className={styles.knob} /></span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      <div className={styles.fieldInput}>{value}</div>
    </div>
  );
}

function PassField({ label }: { label: string }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      <div className={styles.passInput}>
        <span>••••••</span>
        <EyeOffIcon size={18} />
      </div>
    </div>
  );
}
