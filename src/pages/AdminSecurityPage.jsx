import React from 'react';
import { 
  Table, 
  Tag, 
  Card, 
  Typography, 
  Row, 
  Col, 
  Statistic, 
  List, 
  Avatar, 
  Space,
  Button,
  Empty
} from 'antd';
import { 
  WarningOutlined, 
  HistoryOutlined, 
  StopOutlined,
  UnlockOutlined,
  SafetyCertificateOutlined,
  AuditOutlined
} from '@ant-design/icons';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const AdminSecurityPage = () => {
  const { securityLogs, violations } = useAppContext();
  const { users } = useAuth();

  const severityColor = (severity) => {
    switch (severity) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  const logColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (t) => new Date(t).toLocaleTimeString(),
      width: 150
    },
    {
      title: 'Event Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color="geekblue">{type.replace('_', ' ').toUpperCase()}</Tag>
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (s) => <Tag color={severityColor(s)}>{s?.toUpperCase()}</Tag>
    }
  ];

  const totalViolations = violations.length;
  const highSeverityLogs = securityLogs.filter(l => l.severity === 'high').length;

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
           <Space align="center" size="small">
             <SafetyCertificateOutlined style={{ fontSize: 24, color: '#1890ff' }} />
             <Title level={3} style={{ margin: 0 }}>Security & Protection</Title>
           </Space>
           <br />
           <Text type="secondary">Monitor platform integrity, account protections, and policy enforcement.</Text>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic 
              title="Recent Violations" 
              value={totalViolations} 
              prefix={<WarningOutlined />} 
              valueStyle={{ color: '#faad14' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic 
              title="High Risk Events" 
              value={highSeverityLogs} 
              prefix={<StopOutlined />} 
              valueStyle={{ color: '#ff4d4f' }} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic 
              title="Protected Accounts" 
              value={users.length} 
              prefix={<SafetyCertificateOutlined />} 
              valueStyle={{ color: '#52c41a' }} 
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card 
            title={<span><HistoryOutlined /> System Security Logs</span>} 
            bordered={false}
          >
            <Table 
              dataSource={securityLogs} 
              columns={logColumns} 
              pagination={{ pageSize: 8 }}
              size="middle"
              rowKey="id"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title={<span><WarningOutlined /> Policy Violations</span>} 
            bordered={false}
            extra={<Button type="link" size="small">View All</Button>}
          >
            {violations.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={violations.slice(0, 5)}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={<Text strong>{item.violations.join(', ').toUpperCase()}</Text>}
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary" size="small">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </Text>
                          <Text ellipsis style={{ width: 200 }}>"{item.text}"</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No recent violations" />
            )}
          </Card>
          
          <Card 
            title={<span><UnlockOutlined /> Recent Admin Actions</span>} 
            bordered={false}
            style={{ marginTop: 16 }}
          >
            <List
              dataSource={securityLogs.filter(l => l.type.includes('deletion') || l.type.includes('ban')).slice(0, 3)}
              renderItem={item => (
                <List.Item>
                  <Text size="small">{item.details}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminSecurityPage;
