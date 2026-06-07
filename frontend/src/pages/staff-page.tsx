import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Topbar } from '../components/topbar.js';
import { Drawer } from '../components/drawer.js';
import { EyeIcon, EditIcon, TrashIcon, ChevronDown, CalendarIcon, ClockIcon } from '../components/icons.js';
import { ImagePicker } from '../components/image-picker.js';
import { useApi, apiPost, apiPut, apiDelete } from '../data/use-api.js';
import { mockStaff, mockAttendance } from '../data/mock-data.js';
import type { StaffMember, AttendanceRecord } from '../types.js';
import styles from './staff-page.module.css';
import form from '../components/form.module.css';

type Tab = 'management' | 'attendance';
type SortKey = 'name-asc' | 'name-desc' | 'salary-asc' | 'salary-desc' | 'age-asc' | 'age-desc' | 'role-asc';
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'name-asc', label: 'Name (A–Z)' },
  { key: 'name-desc', label: 'Name (Z–A)' },
  { key: 'salary-desc', label: 'Salary (high to low)' },
  { key: 'salary-asc', label: 'Salary (low to high)' },
  { key: 'age-desc', label: 'Age (high to low)' },
  { key: 'age-asc', label: 'Age (low to high)' },
  { key: 'role-asc', label: 'Role (A–Z)' },
];
type StaffDraft = { name: string; email: string; role: string; phone: string; salary: string; dob: string; shiftStart: string; shiftEnd: string; avatar: string };

const EMPTY: StaffDraft = { name: '', email: '', role: '', phone: '', salary: '', dob: '', shiftStart: '', shiftEnd: '', avatar: '' };

/** Staff management page with management table, attendance tab and add/edit drawers. */
export function StaffPage() {
  const navigate = useNavigate();
  const { data: staff, setData: setStaff, refetch } = useApi<StaffMember[]>('staff', mockStaff);
  const { data: attendance, setData: setAttendance } = useApi<AttendanceRecord[]>('attendance', mockAttendance);
  const [tab, setTab] = useState<Tab>('management');
  const [drawer, setDrawer] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>('name-asc');

  const sortedStaff = [...staff].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc': return a.name.localeCompare(b.name);
      case 'name-desc': return b.name.localeCompare(a.name);
      case 'salary-asc': return a.salary - b.salary;
      case 'salary-desc': return b.salary - a.salary;
      case 'age-asc': return a.age - b.age;
      case 'age-desc': return b.age - a.age;
      case 'role-asc': return a.role.localeCompare(b.role);
      default: return 0;
    }
  });

  const saveStaff = async (draft: StaffDraft) => {
    const payload = {
      name: draft.name, email: draft.email, role: draft.role, phone: draft.phone,
      salary: Number(String(draft.salary).replace(/[^0-9.]/g, '')) || 0,
      dob: draft.dob, shiftStart: draft.shiftStart, shiftEnd: draft.shiftEnd,
      timings: `${draft.shiftStart || '9am'} to ${draft.shiftEnd || '10pm'}`,
      ...(draft.avatar ? { avatar: draft.avatar } : {}),
    };
    if (drawer === 'edit' && editing) {
      await apiPut(`staff/${encodeURIComponent(editing.id)}`, payload);
    } else {
      await apiPost('staff', payload);
    }
    setDrawer(null);
    setEditing(null);
    refetch();
  };

  const deleteStaff = async (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    await apiDelete(`staff/${encodeURIComponent(id)}`);
  };

  const setStatus = async (id: string, status: AttendanceRecord['status']) => {
    setAttendance((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    await apiPut(`attendance/${encodeURIComponent(id)}`, { status });
  };

  return (
    <>
      <Topbar title="Staff Management" />

      <div className={styles.headRow}>
        <h2 className={styles.count}>Staff({staff.length})</h2>
        <div className={styles.headActions}>
          <button className={styles.addBtn} onClick={() => { setEditing(null); setDrawer('add'); }}>Add Staff</button>
          <div className={styles.sortWrap}>
            <button className={styles.sortBtn} onClick={() => setSortOpen((o) => !o)}>Sort by: {SORTS.find((s) => s.key === sortBy)?.label} <ChevronDown size={16} /></button>
            {sortOpen && (
              <>
                <div className={styles.sortBackdrop} onClick={() => setSortOpen(false)} />
                <div className={styles.sortMenu}>
                  {SORTS.map((s) => (
                    <button key={s.key} className={`${styles.sortItem} ${sortBy === s.key ? styles.sortItemActive : ''}`} onClick={() => { setSortBy(s.key); setSortOpen(false); }}>{s.label}</button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'management' ? styles.tabActive : ''}`} onClick={() => setTab('management')}>Staff Management</button>
        <button className={`${styles.tab} ${tab === 'attendance' ? styles.tabActive : ''}`} onClick={() => setTab('attendance')}>Attendance</button>
      </div>

      {tab === 'management' ? (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Age</th><th>Salary</th><th>Timings</th><th></th>
              </tr>
            </thead>
            <tbody>
              {sortedStaff.map((s) => (
                <tr key={s.id}>
                  <td><input type="checkbox" /></td>
                  <td>{s.id}</td>
                  <td>
                    <div className={styles.nameCell}>
                      <img src={s.avatar} alt="" className={styles.rowAvatar} />
                      <div>
                        <div>{s.name}</div>
                        <div className={styles.role}>{s.role}</div>
                      </div>
                    </div>
                  </td>
                  <td>{s.email}</td>
                  <td>{s.phone}</td>
                  <td>{s.age} yrs</td>
                  <td>${s.salary.toFixed(2)}</td>
                  <td>{s.timings}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <button className={styles.act} onClick={() => navigate(`/staff/${encodeURIComponent(s.id)}`)} title="View"><EyeIcon size={18} /></button>
                      <button className={styles.act} onClick={() => { setEditing(s); setDrawer('edit'); }} title="Edit"><EditIcon size={18} /></button>
                      <button className={styles.del} title="Delete" onClick={() => deleteStaff(s.id)}><TrashIcon size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <AttendanceTable rows={attendance} onSet={setStatus} />
      )}

      <Drawer open={drawer !== null} onClose={() => { setDrawer(null); setEditing(null); }}>
        <StaffForm title={drawer === 'edit' ? 'Edit Staff' : 'Add Staff'} member={editing} onSave={saveStaff} onClose={() => { setDrawer(null); setEditing(null); }} />
      </Drawer>
    </>
  );
}

/** Attendance sub-table with status action buttons wired to the backend. */
function AttendanceTable({ rows, onSet }: { rows: AttendanceRecord[]; onSet: (id: string, status: AttendanceRecord['status']) => void }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr><th><input type="checkbox" /></th><th>ID</th><th>Name</th><th>Date</th><th>Timings</th><th>Status</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td><input type="checkbox" /></td>
              <td>{r.id}</td>
              <td>
                <div className={styles.nameCell}>
                  <img src={r.avatar} alt="" className={styles.rowAvatar} />
                  <div><div>{r.name}</div><div className={styles.role}>{r.role}</div></div>
                </div>
              </td>
              <td>{r.date}</td>
              <td>{r.timings}</td>
              <td>
                {r.status ? (
                  <span className={styles.statusPill}>{r.status} <button className={styles.pillEdit} onClick={() => onSet(r.id, '')}><EditIcon size={14} /></button></span>
                ) : (
                  <div className={styles.statusBtns}>
                    <button className={styles.present} onClick={() => onSet(r.id, 'Present')}>Present</button>
                    <button className={styles.absent} onClick={() => onSet(r.id, 'Absent')}>Absent</button>
                    <button className={styles.half} onClick={() => onSet(r.id, 'Half Shift')}>Half Shift</button>
                    <button className={styles.leave} onClick={() => onSet(r.id, 'Leave')}>Leave</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Add/Edit staff form rendered inside the drawer (controlled inputs). */
function StaffForm({ title, member, onSave, onClose }: { title: string; member?: StaffMember | null; onSave: (d: StaffDraft) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<StaffDraft>(member ? {
    name: member.name, email: member.email, role: member.role, phone: member.phone,
    salary: `${member.salary}.00`, dob: member.dob, shiftStart: member.shiftStart, shiftEnd: member.shiftEnd,
    avatar: member.avatar,
  } : EMPTY);

  const set = (k: keyof StaffDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setDraft((d) => ({ ...d, [k]: e.target.value }));

  return (
    <>
      <h2 className={form.drawerTitle}>{title}</h2>
      <ImagePicker value={draft.avatar} onChange={(url) => setDraft((d) => ({ ...d, avatar: url }))} label="Change profile picture" />

      <div className={form.grid}>
        <div className={form.field}><label className={form.label}>Full Name</label><input className={form.input} placeholder="Enter full name" value={draft.name} onChange={set('name')} /></div>
        <div className={form.field}><label className={form.label}>Email</label><input className={form.input} placeholder="Enter email address" value={draft.email} onChange={set('email')} /></div>
        <div className={form.field}><label className={form.label}>Role</label>
          <select className={form.select} value={draft.role} onChange={set('role')}><option value="" disabled>Select role</option><option>Manager</option><option>Waiter</option><option>Chef</option></select>
        </div>
        <div className={form.field}><label className={form.label}>Phone number</label><input className={form.input} placeholder="Enter phone number" value={draft.phone} onChange={set('phone')} /></div>
        <div className={form.field}><label className={form.label}>Salary</label><input className={form.input} placeholder="Enter salary" value={draft.salary} onChange={set('salary')} /></div>
        <div className={form.field}><label className={form.label}>Date of birth</label>
          <div className={form.inputIcon}><input className={form.input} placeholder="Enter date of birth" value={draft.dob} onChange={set('dob')} /><span className={form.icn}><CalendarIcon size={18} /></span></div>
        </div>
        <div className={form.field}><label className={form.label}>Shift start time</label>
          <div className={form.inputIcon}><input className={form.input} placeholder="Enter starting time" value={draft.shiftStart} onChange={set('shiftStart')} /><span className={form.icn}><ClockIcon size={18} /></span></div>
        </div>
        <div className={form.field}><label className={form.label}>Shift end time</label>
          <div className={form.inputIcon}><input className={form.input} placeholder="Enter end time" value={draft.shiftEnd} onChange={set('shiftEnd')} /><span className={form.icn}><ClockIcon size={18} /></span></div>
        </div>
        <div className={`${form.field} ${form.fieldFull}`}><label className={form.label}>Additional details</label><textarea className={form.textarea} placeholder="Enter additional details" /></div>
      </div>

      <div className={form.actions}>
        <button className={form.cancel} onClick={onClose}>Cancel</button>
        <button className={form.save} onClick={() => onSave(draft)}>Confirm</button>
      </div>
    </>
  );
}
