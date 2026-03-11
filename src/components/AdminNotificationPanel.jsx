import React from 'react';
import { BellOutlined, MessageOutlined, ProjectOutlined, WarningOutlined, DollarCircleOutlined } from '@ant-design/icons';
import { Popover, List, Typography, Space, Button, Tag, Empty, Badge } from 'antd';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const AdminNotificationPanel = () => {
  const { notifications, markNotificationRead, markAllNotificationsAsRead } = useAppContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  const userNotifications = notifications.filter(n => n.userId === 'admin' || n.userId === user?.id);
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const getIcon = (type) => {
    switch (type) {
      case 'Project Update': return <ProjectOutlined style={{ color: '#1890ff' }} />;
      case 'Message Alert': return <MessageOutlined style={{ color: '#722ed1' }} />;
      case 'System Alert': return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'Payment Update': return <DollarCircleOutlined style={{ color: '#52c41a' }} />;
      default: return <BellOutlined />;
    }
  };

  const notificationContent = (
    <div style={{ width: 320 }}>
      <div style={{ padding: '8px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong>Notifications</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={() => markAllNotificationsAsRead('admin')}>
            Mark all read
          </Button>
        )}
      </div>
      <List
        dataSource={userNotifications.slice(0, 5)}
        locale={{ emptyText: <Empty description="No notifications" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
        renderItem={item => (
          <List.Item 
            key={item.id} 
            style={{ 
              padding: '12px 16px', 
              cursor: 'pointer',
              backgroundColor: item.isRead ? 'transparent' : '#f0f7ff',
              borderBottom: '1px solid #f0f0f0'
            }}
            onClick={() => {
              markNotificationRead(item.id);
              if (item.projectId) navigate(`/projects/${item.projectId}`);
            }}
          >
            <List.Item.Meta
              avatar={getIcon(item.type)}
              title={<Text strong style={{ fontSize: '13px' }}>{item.title}</Text>}
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>{item.message}</Text>
                  <Text type="secondary" style={{ fontSize: '10px' }}>
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
      <div style={{ padding: '8px', textAlign: 'center' }}>
        <Button type="link" block onClick={() => navigate('/notifications')}>
          View All Notifications
        </Button>
      </div>
    </div>
  );

  return (
    <Popover 
      content={notificationContent} 
      trigger="click" 
      placement="bottomRight"
      overlayStyle={{ padding: 0 }}
    >
      <Badge count={unreadCount} size="small" offset={[-2, 5]}>
        <Button type="text" icon={<BellOutlined />} style={{ fontSize: '18px' }} />
      </Badge>
    </Popover>
  );
};

export default AdminNotificationPanel;
