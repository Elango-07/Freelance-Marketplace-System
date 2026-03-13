import React from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AdminLayout from './layouts/AdminLayout';
import ClientLayout from './layouts/ClientLayout';
import PartnerLayout from './layouts/PartnerLayout';
import { useAuth } from './context/AuthContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import PartnerDashboard from './pages/PartnerDashboard';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminAnalytics from './pages/AdminAnalytics';
import ClientAnalytics from './pages/ClientAnalytics';
import PartnerAnalytics from './pages/PartnerAnalytics';
import AdminSecurityPage from './pages/AdminSecurityPage';

const RoleBasedLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = user.role?.toLowerCase();
  if (role === 'admin') return <AdminLayout />;
  if (role === 'client') return <ClientLayout />;
  if (role === 'partner') return <PartnerLayout />;
  
  return <Navigate to="/login" replace />;
};

function App() {
  const location = useLocation();
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <div style={{ width: '40px', hieght: '40px', border: '4px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<div style={{ minHeight: '100vh', background: '#f9fafb' }}><Outlet /></div>}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* Authenticated Routes */}
        <Route element={<RoleBasedLayout />}>
           <Route path="dashboard/admin" element={<AdminDashboard />} />
           <Route path="dashboard/client" element={<ClientDashboard />} />
           <Route path="dashboard/partner" element={<PartnerDashboard />} />
           
           <Route path="users" element={<AdminDashboard />} />
           <Route path="projects" element={<ProjectsPage />} />
           <Route path="projects/:id" element={<ProjectDetailPage />} />
           <Route path="chat" element={<ChatPage />} />
           <Route path="chat/:projectId" element={<ChatPage />} />
           <Route path="profile" element={<ProfilePage />} />
           <Route path="leaderboard" element={<LeaderboardPage />} />
           <Route path="analytics/admin" element={<AdminAnalytics />} />
           <Route path="analytics/client" element={<ClientAnalytics />} />
           <Route path="analytics/partner" element={<PartnerAnalytics />} />
           <Route path="admin/security" element={<AdminSecurityPage />} />
           <Route path="notifications" element={<NotificationsPage />} />
           <Route path="settings" element={<SettingsPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
