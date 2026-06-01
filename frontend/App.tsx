import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './src/theme/theme.module.css';
import { DashboardLayout } from './src/components/dashboard-layout.js';
import { HomePage } from './src/pages/home-page.js';
import { LoginPage } from './src/pages/login-page.js';
import { SignupPage } from './src/pages/signup-page.js';
import { ForgotPasswordPage } from './src/pages/forgot-password-page.js';
import { DashboardPage } from './src/pages/dashboard-page.js';
import { StaffPage } from './src/pages/staff-page.js';
import { StaffDetailPage } from './src/pages/staff-detail-page.js';
import { MenuPage } from './src/pages/menu-page.js';
import { InventoryPage } from './src/pages/inventory-page.js';
import { OrdersPage } from './src/pages/orders-page.js';
import { ReportsPage } from './src/pages/reports-page.js';
import { ReservationsPage } from './src/pages/reservations-page.js';
import { NotificationsPage } from './src/pages/notifications-page.js';
import { ProfilePage } from './src/pages/profile-page.js';

/** Wraps a page in the dashboard shell (sidebar + content). */
function Shell({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

/** Root application with public marketing/auth routes and the dashboard app routes. */
export function FoodeyApp() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route path="/dashboard" element={<Shell><DashboardPage /></Shell>} />
      <Route path="/menu" element={<Shell><MenuPage /></Shell>} />
      <Route path="/staff" element={<Shell><StaffPage /></Shell>} />
      <Route path="/staff/:id" element={<Shell><StaffDetailPage /></Shell>} />
      <Route path="/inventory" element={<Shell><InventoryPage /></Shell>} />
      <Route path="/reports" element={<Shell><ReportsPage /></Shell>} />
      <Route path="/orders" element={<Shell><OrdersPage /></Shell>} />
      <Route path="/reservations" element={<Shell><ReservationsPage /></Shell>} />
      <Route path="/notifications" element={<Shell><NotificationsPage /></Shell>} />
      <Route path="/profile" element={<Shell><ProfilePage /></Shell>} />
    </Routes>
  );
}
