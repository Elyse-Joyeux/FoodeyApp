import React, { useRef } from 'react';
import { ImageIcon } from './icons.js';
import styles from './image-picker.module.css';

/**
 * Reusable image upload control. Shows the current image (or a placeholder
 * icon) inside a framed box and lets the user pick a file from disk — the
 * selected file is read as a base64 data URL and returned via `onChange`,
 * so it can be stored and persisted like any other string field.
 */
export function ImagePicker({ value, onChange, label = 'Change picture' }: {
  value?: string;
  onChange: (dataUrl: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.box} onClick={() => inputRef.current?.click()}>
        {value ? <img src={value} alt="" /> : <ImageIcon size={48} />}
      </button>
      <button type="button" className={styles.label} onClick={() => inputRef.current?.click()}>{label}</button>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFile} />
    </div>
  );
}
