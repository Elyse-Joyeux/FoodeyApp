import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './src/App.css';
import { DashboardLayout } from './src/components/dashboard-layout.js';
import { useUser, type Permission } from './src/context/user-context.js';
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

function Protected({ permission, children }: { permission?: Permission; children: React.ReactNode }) {
  const { user, isLoading, hasPermission } = useUser();
  const location = useLocation();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (permission && !hasPermission(permission)) {
    return (
      <Shell>
        <div style={{ padding: 32, color: '#fff' }}>
          <h1>Access restricted</h1>
          <p>Your account does not include permission for this workspace area.</p>
        </div>
      </Shell>
    );
  }
  return <Shell>{children}</Shell>;
}

/** Root application with public marketing/auth routes and the dashboard app routes. */
export function FoodeyApp() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route path="/dashboard" element={<Protected permission="Dashboard"><DashboardPage /></Protected>} />
      <Route path="/menu" element={<Protected permission="Inventory"><MenuPage /></Protected>} />
      <Route path="/staff" element={<Protected permission="Settings"><StaffPage /></Protected>} />
      <Route path="/staff/:id" element={<Protected permission="Settings"><StaffDetailPage /></Protected>} />
      <Route path="/inventory" element={<Protected permission="Inventory"><InventoryPage /></Protected>} />
      <Route path="/reports" element={<Protected permission="Reports"><ReportsPage /></Protected>} />
      <Route path="/orders" element={<Protected permission="Orders"><OrdersPage /></Protected>} />
      <Route path="/reservations" element={<Protected permission="Orders"><ReservationsPage /></Protected>} />
      <Route path="/notifications" element={<Protected permission="Dashboard"><NotificationsPage /></Protected>} />
      <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
    </Routes>
  );
}
