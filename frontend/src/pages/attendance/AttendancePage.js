import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Card, 
  message, 
  Modal, 
  Form, 
  InputNumber, 
  Select, 
  Tag, 
  Space,
  Row,
  Col,
  Descriptions
} from 'antd';
import { 
  PlayCircleOutlined, 
  StopOutlined, 
  EyeOutlined, 
  ReloadOutlined 
} from '@ant-design/icons';
import CheckinService from '../../services/checkinService';
import CourseService from '../../services/courseService';

const { Option } = Select;

const AttendancePage = () => {
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isStartModalVisible, setIsStartModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isQRModalVisible, setIsQRModalVisible] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [checkinRecords, setCheckinRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [startForm] = Form.useForm();

  // 获取课程列表
  const fetchCourses = async () => {
    try {
      const response = await CourseService.getMyCourses();
      setCourses(response.data || []);
    } catch (error) {
      message.error(error.message || '获取课程列表失败');
    }
  };

  // 获取签到会话列表
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await CheckinService.getCheckinSessions();
      setSessions(response.data || []);
    } catch (error) {
      message.error(error.message || '获取签到会话失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchSessions();
  }, []);

  // 发起签到
  const handleStartCheckin = async (values) => {
    try {
      const response = await CheckinService.startCheckin(values);
      if (response.success) {
        message.success('签到发起成功');
        setIsStartModalVisible(false);
        startForm.resetFields();
        fetchSessions(); // 重新获取会话列表
        
        // 设置二维码数据并显示二维码模态框
        setQrCodeData(response.data);
        setIsQRModalVisible(true);
      } else {
        message.error(response.msg || '签到发起失败');
      }
    } catch (error) {
      message.error(error.message || '签到发起失败');
    }
  };

  // 查看签到详情
  const handleViewDetails = async (session) => {
    setSelectedSession(session);
    setIsDetailModalVisible(true);
    setLoadingRecords(true);
    
    try {
      const response = await CheckinService.getCheckinRecords(session.id);
      setCheckinRecords(response.data || []);
    } catch (error) {
      message.error(error.message || '获取签到记录失败');
      setCheckinRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  // 结束签到会话
  const handleEndSession = async (session) => {
    console.log('handleEndSession called with session:', session);
    try {
      const response = await CheckinService.manualEndCheckinSession(session.id);
      message.success(response.message || '签到会话已手动结束');
      fetchSessions(); // 刷新会话列表
      
      // 如果正在查看详情的会话被结束，更新详情状态
      if (selectedSession && selectedSession.id === session.id) {
        setSelectedSession({ ...selectedSession, status: 'ended' });
      }
    } catch (error) {
      message.error(error.message || '手动结束签到会话失败');
    }
  };

  // 会话状态标签
  const getStatusTag = (status) => {
    switch (status) {
      case 'active':
        return <Tag color="green">进行中</Tag>;
      case 'ended':
        return <Tag color="red">已结束</Tag>;
      default:
        return <Tag>未知</Tag>;
    }
  };

  // 会话列表列定义
  const sessionColumns = [
    {
      title: '会话码',
      dataIndex: 'sessionCode',
      key: 'sessionCode',
    },
    {
      title: '课程名称',
      dataIndex: 'courseName',
      key: 'courseName',
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: '持续时间',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => `${duration} 分钟`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetails(record)}
            size="small"
          >
            查看详情
          </Button>
          {record.status === 'active' && (
            <Button 
              danger 
              icon={<StopOutlined />} 
              onClick={() => handleEndSession(record)}
              size="small"
            >
              结束签到
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 签到记录列定义
  const recordColumns = [
    {
      title: '学生ID',
      dataIndex: 'student_id',
      key: 'student_id',
    },
    {
      title: '签到时间',
      dataIndex: 'checkin_time',
      key: 'checkin_time',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        switch (status) {
          case 'present':
            return <Tag color="green">出勤</Tag>;
          case 'late':
            return <Tag color="orange">迟到</Tag>;
          case 'absent':
            return <Tag color="red">缺勤</Tag>;
          default:
            return <Tag>{status}</Tag>;
        }
      },
    },
  ];

  return (
    <div>
      <Card 
        title="考勤管理" 
        extra={
          <Space>
            <Button 
              type="primary" 
              icon={<PlayCircleOutlined />} 
              onClick={() => setIsStartModalVisible(true)}
            >
              发起签到
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchSessions}
            >
              刷新
            </Button>
          </Space>
        }
      >
        <Table 
          dataSource={sessions} 
          columns={sessionColumns} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 发起签到模态框 */}
      <Modal
        title="发起签到"
        open={isStartModalVisible}
        onCancel={() => {
          setIsStartModalVisible(false);
          startForm.resetFields();
        }}
        onOk={() => startForm.submit()}
        destroyOnHidden
      >
        <Form
          form={startForm}
          layout="vertical"
          onFinish={handleStartCheckin}
        >
          <Form.Item
            name="course_id"
            label="选择课程"
            rules={[{ required: true, message: '请选择课程!' }]}
          >
            <Select placeholder="请选择课程">
              {courses.map(course => (
                <Option key={course.ID} value={course.ID}>
                  {course.Name} ({course.CourseCode})
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="duration"
            label="持续时间(分钟)"
            rules={[{ required: true, message: '请输入持续时间!' }]}
          >
            <InputNumber min={1} max={60} defaultValue={10} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 二维码显示模态框 */}
      <Modal
        title="签到二维码"
        open={isQRModalVisible}
        onCancel={() => setIsQRModalVisible(false)}
        onOk={() => setIsQRModalVisible(false)}
        destroyOnHidden
      >
        {qrCodeData && (
          <div style={{ textAlign: 'center' }}>
            <p>会话码: {qrCodeData.session_code}</p>
            <img 
              src={`data:image/png;base64,${qrCodeData.qr_code}`} 
              alt="签到二维码" 
              style={{ width: '200px', height: '200px' }}
            />
            <p>学生可通过扫描二维码进行签到</p>
            <p style={{ fontSize: '12px', color: '#999' }}>签到链接: {qrCodeData.checkin_url}</p>
          </div>
        )}
      </Modal>

      {/* 签到详情模态框 */}
      <Modal
        title="签到详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
        destroyOnHidden
      >
        {selectedSession && (
          <div>
            <Card size="small" title="会话信息" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="会话码">{selectedSession.sessionCode}</Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={8}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="课程">{selectedSession.courseName}</Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={8}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="状态">{getStatusTag(selectedSession.status)}</Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
              {selectedSession.status === 'active' && (
                <Row style={{ marginTop: 16 }}>
                  <Col span={24}>
                    <Button 
                      danger 
                      icon={<StopOutlined />} 
                      onClick={() => handleEndSession(selectedSession)}
                    >
                      手动结束签到
                    </Button>
                  </Col>
                </Row>
              )}
            </Card>
            
            <Card size="small" title="签到记录">
              <Table 
                dataSource={checkinRecords} 
                columns={recordColumns} 
                rowKey="student_id" 
                loading={loadingRecords}
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AttendancePage;