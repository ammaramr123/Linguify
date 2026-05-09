import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Navbar } from './components/shared/Navbar';
import { ProtectedRoute } from './components/shared/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// User Pages
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { ReportsPage } from './pages/ReportsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminImages } from './pages/admin/AdminImages';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminUsers } from './pages/admin/AdminUsers';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
        <Navbar />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* User Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/images" element={<AdminImages />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/users" element={<AdminUsers />} />
            </Route>

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Toaster theme="dark" position="bottom-right" closeButton richColors />
      </div>
    </BrowserRouter>
  );
}
