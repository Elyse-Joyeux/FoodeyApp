import React from 'react';
import styles from './drawer.module.css';

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

/** Right-side slide-over drawer used for add/edit forms. */
export function Drawer({ open, onClose, children }: DrawerProps) {
  if (!open) return null;
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
