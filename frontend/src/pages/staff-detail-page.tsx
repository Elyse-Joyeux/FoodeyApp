import React from 'react';
import { useParams } from 'react-router-dom';
import { Topbar } from '../components/topbar.js';
import { useApi } from '../data/use-api.js';
import { mockStaff } from '../data/mock-data.js';
import type { StaffMember } from '../types.js';
import styles from './staff-detail-page.module.css';

/** Single staff member profile with personal and job details. */
export function StaffDetailPage() {
  const { id } = useParams();
  const { data: staff } = useApi<StaffMember[]>('staff', mockStaff);
  const member = staff.find((s) => s.id === decodeURIComponent(id || '')) || staff[0];

  return (
    <>
      <Topbar title={member.name} />
      <div className={styles.layout}>
        <div className={styles.imageCol}>
          <h3 className={styles.sectionTitle}>Profile Image</h3>
          <img src={member.avatar} alt={member.name} className={styles.profileImg} />
          <span className={styles.change}>Change profile picture</span>
          <button className={styles.confirm}>Confirm</button>
          <button className={styles.cancel}>Cancel</button>
        </div>

        <div className={styles.detailCol}>
          <h3 className={styles.sectionTitle}>Employee Personal Details</h3>
          <div className={styles.card}>
            <Field label="Full Name" value={member.name} />
            <Field label="Email" value={member.email} />
            <Field label="Phone Number" value={member.phone} />
            <Field label="Date of birth" value={member.dob} />
            <Field label="Address" value={member.address} full />
          </div>

          <h3 className={styles.sectionTitle}>Employee Job Details</h3>
          <div className={styles.card}>
            <Field label="Role" value={member.role} />
            <Field label="Salary" value={`$${member.salary.toFixed(2)}`} />
            <Field label="Shift Start timing" value={member.shiftStart} />
            <Field label="Shift end timing" value={member.shiftEnd} />
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={`${styles.field} ${full ? styles.full : ''}`}>
      <div className={styles.fieldLabel}>{label}</div>
      <div className={styles.fieldValue}>{value}</div>
    </div>
  );
}
