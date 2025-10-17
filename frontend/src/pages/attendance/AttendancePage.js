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
  Descriptions,
  Alert
} from 'antd';
import { 
  PlayCircleOutlined, 
  StopOutlined, 
  EyeOutlined, 
  ReloadOutlined,
  QrcodeOutlined
} from '@ant-design/icons';
import CheckinService from '../../services/checkinService';
import CourseService from '../../services/courseService';
import useAuth from '../../hooks/useAuth'; // 添加导入useAuth hook

const { Option } = Select;

const AttendancePage = () => {
  const { user } = useAuth(); // 获取当前用户信息
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
      console.log('当前用户信息:', user);
      console.log('用户角色:', user?.role);
      // 根据用户角色决定获取课程的方式
      // 管理员获取所有课程，教师获取自己的课程
      const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN';
      const response = isAdmin 
        ? await CourseService.getCourses() 
        : await CourseService.getMyCourses();
      
      console.log('API响应完整数据:', response); // 完整的响应数据
      // 从响应中正确提取数据
      const courseData = response.data?.data || [];
      console.log('提取的课程数据:', courseData); // 调试日志
      console.log('课程数据类型:', typeof courseData); // 检查数据类型
      console.log('是否为数组:', Array.isArray(courseData)); // 检查是否为数组
      setCourses(Array.isArray(courseData) ? courseData : []);
    } catch (error) {
      console.error('获取课程列表失败:', error); // 更详细的错误信息
      message.error(error.message || '获取课程列表失败');
    }
  };

  // 获取签到会话列表
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await CheckinService.getCheckinSessions();
      // console.log('后端返回的会话数据:', response); // 调试信息，查看实际数据结构
      
      // 处理会话数据，确保课程名称正确显示
      const sessionsWithCourseName = (response.data || []).map(session => {
        // 打印每个会话对象，查看实际结构
        // console.log('单个会话对象:', session);
        
        // 尝试从不同可能的字段中获取课程名称
        const courseName = session.courseName || 
                          session.course_name || 
                          session.Course?.Name ||
                          session.course?.name ||
                          '未知课程';
        
        return {
          ...session,
          courseName: courseName
        };
      });
      
      setSessions(sessionsWithCourseName);
    } catch (error) {
      message.error(error.message || '获取签到会话失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchSessions();
  }, [user]); // 添加user到依赖数组中，确保当用户信息加载完成后重新执行

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

  // 显示二维码
  const showQRCode = (session) => {
    // 如果已经有二维码数据且对应同一个会话，则直接显示
    if (qrCodeData && qrCodeData.session_code === session.sessionCode) {
      setIsQRModalVisible(true);
      return;
    }
    
    // 否则需要重新获取二维码数据
    // 这里我们模拟一个二维码数据对象，实际开发中应该调用后端API获取
    const mockQRCodeData = {
      session_code: session.sessionCode,
      checkin_url: `http://localhost:5500/backend/static/index.html?session=${session.sessionCode}`,
      qr_code: "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEX///8AAABVwtN+AAACAklEQVR42uyYMbLzIAyEl6Gg5AgchZvF9s04CkegpGC8/0g4iTN/qldFHqt5L/hrQGJZCXfcccffYiHJDrClrSOzw40oa7wWAMB1wJM7Ij25jViOD3YAWeqpeHINLfuOB2Ihq0mArA8gD0iyrAIE0tal1ur3bVoHtCZTGbEuXVfct6L9dUD1QYGH1mTavgnIjwMzUkGULHEEKc3/48cBKTnR6oG0TmDRbdaLASNyDZRsAvokLWRx/V2TNgB9kjJZXZcrlTaysL+zaQEAGx6hYsgla/Cs8ofkaglYRiyOr2QNpG0gA4nXAtjyjlT0HFgOAeGpJi0AkrhNvFxL1DQq4M7pNgAsA1n+12RFuVIPr/oAU4BnWVjziNzld+DqW97D++W9BjCgNXl4uTFlEKEulgAcV0rUECoMG0nXX/pgA/DyJamhDirmR0O6mgKgj2oWR6qbVkcKsTxXApZ5j4ocRyD1HJDPLsgEAOStI6ula2BPu2/Yw1vMTQCeRc1AnDOQqeL7xwzEADDNdH6anFCludtDvRbw7PV8S6vUZFcrbg14DQ/FDMWCoGO3s/E2ARwzkKkPRYeHgr8bUhPAeewWxV47KblTd3ApQFR8Gu+j/YZBgL7h2ap69XK2gOfUvcH1KLuF/xi52QDm8JA6CpGSS6s8rCeTcwngjjvu+Ix/AQAA//+WC1dUGCCLdwAAAABJRU5ErkJggg=="
    };
    
    setQrCodeData(mockQRCodeData);
    setIsQRModalVisible(true);
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
      title: '教师',
      dataIndex: 'teacher',
      key: 'teacher',
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
          {record.status === 'active' && (
            <Button 
              type="primary" 
              icon={<QrcodeOutlined />} 
              onClick={() => showQRCode(record)}
              size="small"
            >
              查看二维码
            </Button>
          )}
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
      render: (checkin_time) => {
        if (!checkin_time) {
          return <span style={{ color: '#ccc' }}>未签到</span>;
        }
        return checkin_time;
      },
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
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title="发起签到" 
            extra={
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />} 
                onClick={() => setIsStartModalVisible(true)}
              >
                发起签到
              </Button>
            }
          >
            <p>选择课程发起签到，学生可以通过扫描二维码进行签到。</p>
          </Card>
        </Col>
        
        <Col span={24}>
          <Card 
            title="签到会话列表" 
            extra={
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchSessions}
              >
                刷新
              </Button>
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
        </Col>
      </Row>

      {/* 发起签到模态框 */}
      <Modal
        title="发起签到"
        open={isStartModalVisible}
        onCancel={() => {
          setIsStartModalVisible(false);
          startForm.resetFields();
        }}
        onOk={() => startForm.submit()}
        destroyOnClose
      >
        <Form
          form={startForm}
          layout="vertical"
          onFinish={handleStartCheckin}
          initialValues={{ duration: 10 }}  // 设置表单初始值
        >
          <Form.Item
            name="course_id"
            label="选择课程"
            rules={[{ required: true, message: '请选择课程!' }]}
          >
            <Select placeholder="请选择课程">
              {console.log('渲染课程列表:', courses)}
              {courses.map(course => (
                <Option key={course.id || course.ID} value={course.id || course.ID}>
                  {course.name || course.Name} - {course.teacher || course.Teacher}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="duration"
            label="持续时间(分钟)"
            rules={[{ required: true, message: '请输入持续时间!' }]}
            extra="签到会话将在指定时间后自动结束"
          >
            <InputNumber min={1} max={60} defaultValue={10} style={{ width: '100%' }} />
          </Form.Item>
          
          <Alert
            message="提示"
            description="签到会话将在指定的持续时间结束后自动结束，无需手动操作。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        </Form>
      </Modal>

      {/* 二维码显示模态框 */}
      <Modal
        title="签到二维码"
        open={isQRModalVisible}
        onCancel={() => setIsQRModalVisible(false)}
        onOk={() => setIsQRModalVisible(false)}
        destroyOnClose
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
        destroyOnClose
      >
        {selectedSession && (
          <div>
            <Descriptions title="会话信息" column={2} bordered>
              <Descriptions.Item label="会话码">{selectedSession.sessionCode}</Descriptions.Item>
              <Descriptions.Item label="课程">{selectedSession.courseName}</Descriptions.Item>
              <Descriptions.Item label="教师">{selectedSession.teacher}</Descriptions.Item>
              <Descriptions.Item label="开始时间">{selectedSession.startTime}</Descriptions.Item>
              <Descriptions.Item label="持续时间">{selectedSession.duration} 分钟</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedSession.status === 'active' ? 'green' : 'red'}>
                  {selectedSession.status === 'active' ? '进行中' : '已结束'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            
            <div style={{ marginTop: 20 }}>
              <h3>签到记录</h3>
              <Table 
                dataSource={checkinRecords} 
                columns={recordColumns} 
                rowKey="student_id" 
                loading={loadingRecords}
                pagination={{ pageSize: 5 }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AttendancePage;