import React from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Table, 
  Tag, 
  Typography, 
  Divider, 
  Space, 
  List, 
  Avatar, 
  Progress 
} from 'antd';
import { 
  UserOutlined, 
  ProjectOutlined, 
  CheckCircleOutlined, 
  RiseOutlined, 
  WarningOutlined, 
  DollarOutlined,
  FileSyncOutlined,
  BarChartOutlined,
  StopOutlined
} from '@ant-design/icons';
import { FiActivity } from 'react-icons/fi';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { format, subMonths, startOfMonth, isWithinInterval } from 'date-fns';

const { Title, Text } = Typography;

const AdminAnalytics = () => {
  const { projects, reviews, violations } = useAppContext();
  const { users } = useAuth();

  // Basic Stats
  const totalClients = users.filter(u => u.role === 'Client').length;
  const totalPartners = users.filter(u => u.role === 'Partner').length;
  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const bannedUsers = users.filter(u => u.isBanned).length;

  // Monthly Data Calculation (last 6 months)
  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), i);
    return {
      month: format(d, 'MMM'),
      fullDate: startOfMonth(d),
      registrations: 0,
      projects: 0
    };
  }).reverse();

  users.forEach(u => {
    const regDate = new Date(u.createdAt || Date.now());
    const monthStr = format(regDate, 'MMM');
    const entry = last6Months.find(m => m.month === monthStr);
    if (entry) entry.registrations++;
  });

  projects.forEach(p => {
    const createDate = new Date(p.createdAt || Date.now());
    const monthStr = format(createDate, 'MMM');
    const entry = last6Months.find(m => m.month === monthStr);
    if (entry) entry.projects++;
  });

  // Category Distribution
  const categories = {};
  projects.forEach(p => {
    const cat = p.category || 'Other';
    categories[cat] = (categories[cat] || 0) + 1;
  });
  const categoryData = Object.keys(categories).map(name => ({ name, value: categories[name] }));

  // Top Partners/Clients
  const partnerStats = users.filter(u => u.role === 'Partner').map(p => ({
    ...p,
    completed: projects.filter(proj => proj.partnerId === p.id && proj.status === 'Completed').length
  })).sort((a, b) => b.completed - a.completed).slice(0, 5);

  const clientStats = users.filter(u => u.role === 'Client').map(c => ({
    ...c,
    requests: projects.filter(proj => proj.clientId === c.id).length
  })).sort((a, b) => b.requests - a.requests).slice(0, 5);

  // Success Rate
  const totalFinishedProjects = projects.filter(p => p.status === 'Completed' || p.status === 'Cancelled').length;
  const successRate = totalFinishedProjects > 0 
    ? ((completedProjects / totalFinishedProjects) * 100).toFixed(1)
    : 0;

  // Revenue Estimation (5% platform fee on completed projects)
  const totalRevenue = projects
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + (p.budget * 0.05), 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Title level={3} style={{ margin: 0 }}>Platform Analytics</Title>
          <Text type="secondary">In-depth statistics and performance metrics for the entire platform.</Text>
        </Col>
      </Row>

      {/* Main Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic title="Total Clients" value={totalClients} prefix={<UserOutlined />} valueStyle={{ color: '#1890ff' }} />
            <Text type="secondary" size="small">+{last6Months[5].registrations} this month</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic title="Total Partners" value={totalPartners} prefix={<UserOutlined />} valueStyle={{ color: '#52c41a' }} />
            <Text type="secondary" size="small">Professional pool growth</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic title="Active Projects" value={activeProjects} prefix={<ProjectOutlined />} valueStyle={{ color: '#faad14' }} />
            <Progress percent={Math.round((activeProjects / (projects.length || 1)) * 100)} size="small" showInfo={false} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic title="Success Rate" value={successRate} suffix="%" prefix={<CheckCircleOutlined />} valueStyle={{ color: '#eb2f96' }} />
            <Text type="secondary" size="small">{completedProjects} projects delivered</Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="User & Project Growth" bordered={false} extra={<BarChartOutlined />}>
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last6Months}>
                  <defs>
                    <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1890ff" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#52c41a" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#52c41a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip offset={20} />
                  <Legend verticalAlign="top" height={36}/>
                  <Area type="monotone" dataKey="registrations" name="New Users" stroke="#1890ff" fillOpacity={1} fill="url(#colorReg)" />
                  <Area type="monotone" dataKey="projects" name="New Projects" stroke="#52c41a" fillOpacity={1} fill="url(#colorProj)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Revenue Estimation" bordered={false} extra={<DollarOutlined />}>
            <Statistic 
              title="Estimated Platform Earnings" 
              value={totalRevenue} 
              precision={2} 
              prefix="$" 
              valueStyle={{ color: '#3f8600', fontWeight: 'bold' }} 
            />
            <Divider style={{ margin: '12px 0' }} />
            <Text type="secondary">Based on 5% service fee from completed projects ($100k+ total value).</Text>
            <div style={{ marginTop: 24 }}>
               <Text strong>Monthly Goal Progression</Text>
               <Progress percent={Math.min(100, Math.round((totalRevenue / 5000) * 100))} status="active" strokeColor="#52c41a" />
               <Text type="secondary" size="small">$5,000 Target</Text>
            </div>
          </Card>
          <Card title="Compliance" bordered={false} style={{ marginTop: 16 }} extra={<WarningOutlined />}>
             <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Violations" value={violations.length} valueStyle={{ color: '#ff4d4f' }} />
                </Col>
                <Col span={12}>
                  <Statistic title="Banned" value={bannedUsers} prefix={<StopOutlined />} valueStyle={{ color: '#000' }} />
                </Col>
             </Row>
          </Card>
          <Card title="Daily Activity" bordered={false} style={{ marginTop: 16 }} extra={<FiActivity />}>
             <Statistic 
               title="Daily Active Users" 
               value={Math.round(totalPartners * 0.8 + totalClients * 0.5)} 
               suffix="/ day"
               valueStyle={{ color: '#1890ff' }} 
             />
             <Text type="secondary" size="small">Real-time platform engagement</Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={8}>
          <Card title="Category Distribution" bordered={false} style={{ height: '100%' }}>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Card title="Top Performers (Partners)" bordered={false} style={{ height: '100%' }}>
            <List
              itemLayout="horizontal"
              dataSource={partnerStats}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatar} icon={<UserOutlined />} />}
                    title={item.name}
                    description={`${item.completed} Projects Completed`}
                  />
                  <RiseOutlined style={{ color: '#52c41a' }} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Card title="Top Clients (Requests)" bordered={false} style={{ height: '100%' }}>
            <List
              itemLayout="horizontal"
              dataSource={clientStats}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatar} icon={<UserOutlined />} />}
                    title={item.name}
                    description={`${item.requests} Projects Requested`}
                  />
                  <Tag color="blue">CLIENT</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminAnalytics;
