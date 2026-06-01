import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Topbar } from '../components/topbar.js';
import { Drawer } from '../components/drawer.js';
import { EyeIcon, EditIcon, TrashIcon, ImageIcon, ChevronDown, CalendarIcon, ClockIcon } from '../components/icons.js';
import { useApi } from '../data/use-api.js';
import { mockStaff, mockAttendance } from '../data/mock-data.js';
import type { StaffMember, AttendanceRecord } from '../types.js';
import styles from './staff-page.module.css';
import form from '../components/form.module.css';

type Tab = 'management' | 'attendance';

/** Staff management page with management table, attendance tab and add/edit drawers. */
export function StaffPage() {
  const navigate = useNavigate();
  const { data: staff } = useApi<StaffMember[]>('staff', mockStaff);
  const { data: attendance } = useApi<AttendanceRecord[]>('attendance', mockAttendance);
  const [tab, setTab] = useState<Tab>('management');
  const [drawer, setDrawer] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<StaffMember | null>(null);

  return (
    <>
      <Topbar title="Staff Management" />

      <div className={styles.headRow}>
        <h2 className={styles.count}>Staff(22)</h2>
        <div className={styles.headActions}>
          <button className={styles.addBtn} onClick={() => setDrawer('add')}>Add Staff</button>
          <button className={styles.sortBtn}>Sort by <ChevronDown size={16} /></button>
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
              {staff.slice(0, 9).map((s, i) => (
                <tr key={i}>
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
                      <button className={styles.del} title="Delete"><TrashIcon size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <AttendanceTable rows={attendance} />
      )}

      <Drawer open={drawer === 'add'} onClose={() => setDrawer(null)}>
        <StaffForm title="Add Staff" onClose={() => setDrawer(null)} />
      </Drawer>
      <Drawer open={drawer === 'edit'} onClose={() => setDrawer(null)}>
        <StaffForm title="Edit Staff" member={editing} onClose={() => setDrawer(null)} />
      </Drawer>
    </>
  );
}

/** Attendance sub-table with status action buttons. */
function AttendanceTable({ rows }: { rows: AttendanceRecord[] }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr><th><input type="checkbox" /></th><th>ID</th><th>Name</th><th>Date</th><th>Timings</th><th>Status</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
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
                  <span className={styles.statusPill}>{r.status} <EditIcon size={14} /></span>
                ) : (
                  <div className={styles.statusBtns}>
                    <button className={styles.present}>Present</button>
                    <button className={styles.absent}>Absent</button>
                    <button className={styles.half}>Half Shift</button>
                    <button className={styles.leave}>Leave</button>
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

/** Add/Edit staff form rendered inside the drawer. */
function StaffForm({ title, member, onClose }: { title: string; member?: StaffMember | null; onClose: () => void }) {
  return (
    <>
      <h2 className={form.drawerTitle}>{title}</h2>
      <div className={form.avatarUpload}>
        {member ? <img src={member.avatar} alt="" /> : <ImageIcon size={48} />}
      </div>
      <span className={form.changePic}>Change profile picture</span>

      <div className={form.grid}>
        <div className={form.field}><label className={form.label}>Full Name</label><input className={form.input} placeholder="Enter full name" defaultValue={member?.name} /></div>
        <div className={form.field}><label className={form.label}>Email</label><input className={form.input} placeholder="Enter email address" defaultValue={member?.email} /></div>
        <div className={form.field}><label className={form.label}>Role</label>
          <select className={form.select} defaultValue={member?.role || ''}><option value="" disabled>Select role</option><option>Manager</option><option>Waiter</option><option>Chef</option></select>
        </div>
        <div className={form.field}><label className={form.label}>Phone number</label><input className={form.input} placeholder="Enter phone number" defaultValue={member?.phone} /></div>
        <div className={form.field}><label className={form.label}>Salary</label><input className={form.input} placeholder="Enter salary" defaultValue={member ? `$${member.salary}.00` : ''} /></div>
        <div className={form.field}><label className={form.label}>Date of birth</label>
          <div className={form.inputIcon}><input className={form.input} placeholder="Enter date of birth" defaultValue={member?.dob} /><span className={form.icn}><CalendarIcon size={18} /></span></div>
        </div>
        <div className={form.field}><label className={form.label}>Shift start time</label>
          <div className={form.inputIcon}><input className={form.input} placeholder="Enter starting time" defaultValue={member?.shiftStart} /><span className={form.icn}><ClockIcon size={18} /></span></div>
        </div>
        <div className={form.field}><label className={form.label}>Shift end time</label>
          <div className={form.inputIcon}><input className={form.input} placeholder="Enter end time" defaultValue={member?.shiftEnd} /><span className={form.icn}><ClockIcon size={18} /></span></div>
        </div>
        <div className={`${form.field} ${form.fieldFull}`}><label className={form.label}>Additional details</label><textarea className={form.textarea} placeholder="Enter additional details" /></div>
      </div>

      <div className={form.actions}>
        <button className={form.cancel} onClick={onClose}>Cancel</button>
        <button className={form.save} onClick={onClose}>Confirm</button>
      </div>
    </>
  );
}
