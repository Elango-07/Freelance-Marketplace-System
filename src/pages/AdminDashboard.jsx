import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Table, 
  Tag, 
  Space, 
  Typography, 
  Button,
  Input,
  List, 
  Avatar, 
  Progress,
  Tooltip,
  Divider
} from 'antd';
import { 
  ProjectOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  UserOutlined,
  RiseOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
  StarFilled,
  PlusOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const { projects, reviews, deleteReview, disputes, resolveDispute, violations, chatRestrictions,
          customBlockedWords, addBlockedWord, removeBlockedWord } = useAppContext();
  const navigate = useNavigate();
  const [newWord, setNewWord] = useState('');
  const openDisputes = disputes.filter(d => d.status === 'Open');
  const flaggedViolations = violations.filter(v => v.flagged !== false);
  const flaggedUsers = chatRestrictions.filter(r => r.flagged);

  const handleAddWord = () => {
    if (newWord.trim()) {
      addBlockedWord(newWord.trim());
      setNewWord('');
    }
  };

  const activeProjectsCount = projects.filter(p => p.status === 'Active').length;
  const pendingCount = projects.filter(p => !p.partnerId && p.status === 'Active').length;
  const completedCount = projects.filter(p => p.status === 'Completed').length;

  const projectColumns = [
    {
      title: 'Project Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Client',
      dataIndex: 'clientId',
      key: 'clientId',
      render: () => 'System Client', // Placeholder
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        let color = priority === 'High' ? 'volcano' : (priority === 'Medium' ? 'geekblue' : 'green');
        return <Tag color={color}>{priority?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'processing' : 'success'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<ArrowRightOutlined />} 
          onClick={() => navigate(`/projects/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  const reviewColumns = [
    {
      title: 'Author',
      dataIndex: 'authorName',
      key: 'authorName',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <Space>
          <StarFilled style={{ color: '#fadb14' }} />
          <Text>{rating}</Text>
        </Space>
      ),
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
    },
    {
      title: 'Target',
      dataIndex: 'targetId',
      key: 'targetId',
      render: (id) => `User #${id}`,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => deleteReview(record.id)}
        >
          Remove
        </Button>
      ),
    },
  ];

  const userData = [
    { name: 'Alex Johnson', role: 'Partner', status: 'Active' },
    { name: 'Sarah Miller', role: 'Client', status: 'Pending' },
    { name: 'Mike Ross', role: 'Partner', status: 'Offline' },
  ];

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Title level={4}>Overview</Title>
          <Text type="secondary">Welcome back, Admin. System is running smoothly.</Text>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Active Projects"
              value={activeProjectsCount}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Pending Assignment"
              value={pendingCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Completed"
              value={completedCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Growth"
              value={12.5}
              precision={1}
              prefix={<RiseOutlined />}
              suffix="%"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Recent Projects" bordered={false} className="shadow-sm">
            <Table 
              dataSource={projects.slice(0, 5)} 
              columns={projectColumns} 
              pagination={false} 
              rowKey="id"
              size="middle"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title="Platform Health" bordered={false} className="shadow-sm">
              <div style={{ marginBottom: 16 }}>
                <Text>Server Availability</Text>
                <Progress percent={99.9} size="small" status="active" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <Text>User Engagement</Text>
                <Progress percent={84} size="small" />
              </div>
              <div>
                <Text>Storage usage</Text>
                <Progress percent={32} size="small" strokeColor="#52c41a" />
              </div>
            </Card>

            <Card title="User Activity" bordered={false} className="shadow-sm">
              <List
                itemLayout="horizontal"
                dataSource={userData}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: item.role === 'Partner' ? '#87d068' : '#2db7f5' }} />}
                      title={<Text strong>{item.name}</Text>}
                      description={item.role}
                    />
                    <Tag color={item.status === 'Active' ? 'green' : 'gray'}>{item.status}</Tag>
                  </List.Item>
                )}
              />
            </Card>
          </Space>
        </Col>
      </Row>
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
           <Card title="Review Moderation" bordered={false} className="shadow-sm">
              <Table 
                dataSource={reviews} 
                columns={reviewColumns} 
                rowKey="id" 
                size="middle"
                pagination={{ pageSize: 5 }}
              />
           </Card>
        </Col>
      </Row>

      {/* Disputes Panel */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <span>⚠️ Open Disputes</span>
                {openDisputes.length > 0 && (
                  <Tag color="red">{openDisputes.length} open</Tag>
                )}
              </Space>
            }
            bordered={false}
            className="shadow-sm"
          >
            {openDisputes.length === 0 ? (
              <Typography.Text type="secondary">No open disputes. All milestones are running smoothly.</Typography.Text>
            ) : (
              <List
                dataSource={openDisputes}
                renderItem={(dispute) => {
                  const proj = projects.find(p => p.id === dispute.projectId);
                  return (
                    <List.Item
                      key={dispute.id}
                      actions={[
                        <Button
                          type="primary"
                          size="small"
                          icon={<CheckCircleOutlined />}
                          style={{ background: '#52c41a', borderColor: '#52c41a' }}
                          onClick={() => resolveDispute(dispute.id, 'approve', 'admin')}
                        >
                          Approve Milestone
                        </Button>,
                        <Button
                          size="small"
                          danger
                          onClick={() => resolveDispute(dispute.id, 'revision', 'admin')}
                        >
                          Request Revision
                        </Button>,
                        <Button
                          type="link"
                          icon={<ArrowRightOutlined />}
                          onClick={() => proj && navigate(`/projects/${proj.id}`)}
                        >
                          View Project
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff1f0', border: '1px solid #ffccc7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                            ⚠️
                          </div>
                        }
                        title={
                          <Space>
                            <Text strong>{proj?.title || `Project #${dispute.projectId}`}</Text>
                            <Tag color="volcano">{dispute.milestoneStage}% Milestone</Tag>
                            <Tag color="red">Disputed</Tag>
                          </Space>
                        }
                        description={
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Opened by <strong>{dispute.openedByName}</strong> · {new Date(dispute.createdDate).toLocaleDateString()}
                            </Text>
                            <br />
                            <Text style={{ fontSize: 13 }}>📋 {dispute.disputeReason}</Text>
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            )}
          </Card>
        </Col>
      </Row>
      {/* Chat Monitoring Panel (req 321-322) */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <span>💬 Chat Monitoring</span>
                {flaggedViolations.length > 0 && <Tag color="red">{flaggedViolations.length} violations</Tag>}
                {flaggedUsers.length > 0 && <Tag color="volcano">{flaggedUsers.length} flagged users</Tag>}
              </Space>
            }
            bordered={false}
            className="shadow-sm"
          >
            {flaggedUsers.length > 0 && (
              <>
                <Text strong style={{ fontSize: 13 }}>🚨 Flagged Users</Text>
                <List
                  style={{ marginTop: 8, marginBottom: 16 }}
                  dataSource={flaggedUsers}
                  renderItem={u => (
                    <List.Item key={u.userId}>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} style={{ background: '#ff4d4f' }} />}
                        title={<Space><Text strong>User ID: {u.userId}</Text><Tag color="red">Flagged</Tag>{u.restricted && <Tag color="orange">Restricted</Tag>}</Space>}
                        description={
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {violations.filter(v => v.senderId === u.userId).length} total violations
                            {u.restrictedUntil ? ` · Restricted until ${new Date(u.restrictedUntil).toLocaleString()}` : ''}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              </>
            )}

            {flaggedViolations.length === 0 ? (
              <Typography.Text type="secondary">No blocked messages. All chats are clean.</Typography.Text>
            ) : (
              <>
                <Text strong style={{ fontSize: 13 }}>🚫 Blocked Message Attempts</Text>
                <Table
                  style={{ marginTop: 8 }}
                  size="small"
                  pagination={{ pageSize: 5 }}
                  rowKey="id"
                  dataSource={flaggedViolations}
                  columns={[
                    { title: 'User', dataIndex: 'senderId', key: 'sender', render: id => <Tag>{id}</Tag> },
                    { title: 'Blocked Content', dataIndex: 'text', key: 'text', render: t => <Text style={{ fontSize: 12, maxWidth: 300 }} ellipsis={{ tooltip: t }}>{t}</Text> },
                    { title: 'Violation', dataIndex: 'violations', key: 'v', render: vs => vs?.map(v => <Tag key={v} color="red" style={{ fontSize: 11 }}>{v}</Tag>) },
                    { title: 'Time', dataIndex: 'timestamp', key: 'time', render: t => <Text type="secondary" style={{ fontSize: 11 }}>{new Date(t).toLocaleString()}</Text> },
                  ]}
                />
              </>
            )}
            {/* ─── Custom Blocked Words Manager ─── */}
            <Divider style={{ margin: '16px 0' }} />
            <Text strong style={{ fontSize: 13 }}>🛡️ Custom Blocked Words / Formats</Text>
            <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 10 }}>
              Words are matched case-insensitively. Wrap in <code>/slashes/</code> to use a regex pattern (e.g. <code>/sk[yi]pe/i</code>).
            </Text>

            {/* Input row */}
            <Space.Compact style={{ width: '100%', maxWidth: 480, marginBottom: 12 }}>
              <Input
                value={newWord}
                onChange={e => setNewWord(e.target.value)}
                placeholder="e.g. skype  or  /\+91\d{10}/"
                onPressEnter={handleAddWord}
                style={{ fontFamily: 'monospace' }}
                prefix={<span style={{ color: '#999', fontSize: 12 }}>🔍</span>}
              />
              <Tooltip title="Add word or pattern">
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddWord} disabled={!newWord.trim()}>
                  Add
                </Button>
              </Tooltip>
            </Space.Compact>

            {/* Current blocked words list */}
            {(customBlockedWords || []).length === 0 ? (
              <Text type="secondary" style={{ fontSize: 12 }}>No custom words added yet. Built-in patterns (phone, email, URLs) are always active.</Text>
            ) : (
              <Space wrap>
                {(customBlockedWords || []).map(word => (
                  <Tag
                    key={word}
                    closable
                    onClose={() => removeBlockedWord(word)}
                    color="orange"
                    style={{ fontFamily: 'monospace', fontSize: 12 }}
                    closeIcon={<CloseCircleOutlined />}
                  >
                    {word}
                  </Tag>
                ))}
              </Space>
            )}
          </Card>

        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
