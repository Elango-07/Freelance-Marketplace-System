import React, { useState } from 'react';
import { Layout, Menu, Button, theme, ConfigProvider } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ProjectOutlined,
  MessageOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  SettingOutlined,
  RiseOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SessionWarning from '../components/SessionWarning';
import AdminNotificationPanel from '../components/AdminNotificationPanel';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { key: '/dashboard/admin', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/users', icon: <UserOutlined />, label: 'Users' },
    { key: '/projects', icon: <ProjectOutlined />, label: 'Projects' },
    { key: '/chat', icon: <MessageOutlined />, label: 'Messages' },
    { key: '/leaderboard', icon: <RiseOutlined />, label: 'Leaderboard' },
    { key: '/analytics/admin', icon: <BarChartOutlined />, label: 'Analytics' },
    { key: '/admin/security', icon: <SafetyCertificateOutlined />, label: 'Security' },
    { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#52c41a', // Green theme for Admin productivity
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Sider trigger={null} collapsible collapsed={collapsed} theme="light" style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
          <div style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px', color: '#059669' }}>
            {collapsed ? 'FB' : 'Freelance Bridge'}
          </div>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
          <div style={{ position: 'absolute', bottom: '16px', width: '100%', padding: '0 16px' }}>
             <Button 
               type="text" 
               danger 
               icon={<LogoutOutlined />} 
               style={{ width: '100%', textAlign: 'left' }} 
               onClick={handleLogout}
             >
               {!collapsed && 'Sign Out'}
             </Button>
          </div>
        </Sider>
        <Layout>
          <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '24px' }}>
            <Button
               type="text"
               icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
               onClick={() => setCollapsed(!collapsed)}
               style={{ fontSize: '16px', width: 64, height: 64 }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
               <AdminNotificationPanel />
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 500 }}>{user?.name}</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {user?.name?.[0]}
                  </div>
               </div>
            </div>
          </Header>
          <Content
            style={{
              margin: '24px 16px',
              padding: 24,
              minHeight: 280,
              background: '#f5f5f5',
              borderRadius: borderRadiusLG,
              overflow: 'initial'
            }}
          >
            <Outlet />
            <SessionWarning />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;
