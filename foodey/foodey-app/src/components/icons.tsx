import React from 'react';

type IconProps = { size?: number; color?: string; className?: string };

const base = (size: number) => ({ width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });

export const GridIcon = ({ size = 22 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
);
export const MenuBookIcon = ({ size = 22 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><path d="M3 5a2 2 0 0 1 2-2h5v16H5a2 2 0 0 0-2 2V5Z" /><path d="M21 5a2 2 0 0 0-2-2h-5v16h5a2 2 0 0 1 2 2V5Z" /></svg>
);
export const StaffIcon = ({ size = 22 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M16 6.5a3 3 0 0 1 0 5.5" /><path d="M18 14c2.2.5 3.5 2.3 3.5 5" /></svg>
);
export const BoxIcon = ({ size = 22 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><path d="M21 8 12 3 3 8l9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></svg>
);
export const ReportIcon = ({ size = 22 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
);
export const OrderIcon = ({ size = 22 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>
);
export const ReservationIcon = ({ size = 22 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
);
export const LogoutIcon = ({ size = 22 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></svg>
);
export const BellIcon = ({ size = 24 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
);
export const BackIcon = ({ size = 18 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><path d="m15 18-6-6 6-6" /></svg>
);
export const SearchIcon = ({ size = 20 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
);
export const EditIcon = ({ size = 18 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
);
export const TrashIcon = ({ size = 18 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
);
export const EyeIcon = ({ size = 18 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const EyeOffIcon = ({ size = 20 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><path d="M9.9 4.2A9.6 9.6 0 0 1 12 4c6.5 0 10 7 10 7a13.3 13.3 0 0 1-2.2 3M6.6 6.6A13.3 13.3 0 0 0 2 11s3.5 7 10 7a9.6 9.6 0 0 0 4-.9" /><path d="M3 3l18 18M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
);
export const UserIcon = ({ size = 20 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" /></svg>
);
export const LockIcon = ({ size = 20 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
);
export const MailIcon = ({ size = 20 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
);
export const ChefHatIcon = ({ size = 48 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><path d="M6 18h12v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2Z" /><path d="M6 18a4 4 0 0 1-1-7.9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 7 4.1A4 4 0 0 1 18 18" /></svg>
);
export const DollarIcon = ({ size = 18 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
);
export const TableIcon = ({ size = 18 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><path d="M3 9h18M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2M5 9v10M19 9v10" /></svg>
);
export const ExportIcon = ({ size = 18 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
);
export const WarningIcon = ({ size = 30 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4M12 17.5v.1" /></svg>
);
export const CalendarIcon = ({ size = 18 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
);
export const ClockIcon = ({ size = 18 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const ChevronDown = ({ size = 18 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><path d="m6 9 6 6 6-6" /></svg>
);
export const ImageIcon = ({ size = 48 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></svg>
);
export const CheckIcon = ({ size = 16 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><path d="m20 6-11 11-5-5" /></svg>
);
export const ShieldIcon = ({ size = 20 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></svg>
);
export const PlayIcon = ({ size = 18 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...base(size)}><circle cx="12" cy="12" r="9" /><path d="m10 9 5 3-5 3V9Z" fill="currentColor" /></svg>
);
