import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Form, Input, Card, Table, message, Modal, Select, DatePicker, Space, Tag, InputNumber, Row, Col } from 'antd';
import { UserOutlined, BookOutlined, CalendarOutlined, TeamOutlined, LoginOutlined, LogoutOutlined, CheckCircleOutlined, ClockCircleOutlined, UserAddOutlined, FormOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Header, Content, Sider } = Layout;
const { Option } = Select;

// Mock API 配置 - 实际项目中替换为真实后端地址
const API_BASE = 'http://localhost:8080/api/v1'; // 假设后端运行在8080

// 全局状态管理 (简单场景，复杂应用建议使用 Redux 或 Context)
const useAuth = () => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('authUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return { user, login, logout };
};

// 登录页面
const LoginPage = ({ onLogin }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 模拟登录 API 调用
      // const response = await axios.post(`${API_BASE}/login`, values);
      // onLogin(response.data.user);
      
      // Mock 登录成功
      setTimeout(() => {
        onLogin({
          id: 1,
          username: values.username,
          name: values.username === 'admin' ? 'Admin User' : 'Teacher User',
          role: values.username === 'admin' ? 'admin' : 'teacher'
        });
        message.success('登录成功');
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Login failed:', error);
      message.error('登录失败，请检查用户名和密码');
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card title="考勤系统登录" style={{ width: 400 }}>
        <Form
          form={form}
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password prefix={<UserOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              <LoginOutlined /> 登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

// 课程管理组件
const CourseManagement = () => {
  const [courses, setCourses] = useState([
    { id: 1, courseCode: 'CS101', name: '计算机科学导论', teacher: '张老师', credit: 3, semester: '2023春' },
    { id: 2, courseCode: 'MATH201', name: '高等数学', teacher: '李老师', credit: 4, semester: '2023春' },
  ]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form] = Form.useForm();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      // const response = await axios.get(`${API_BASE}/courses`);
      // setCourses(response.data);
      // Mock data
      setTimeout(() => {
        setCourses([
          { id: 1, courseCode: 'CS101', name: '计算机科学导论', teacher: '张老师', credit: 3, semester: '2023春' },
          { id: 2, courseCode: 'MATH201', name: '高等数学', teacher: '李老师', credit: 4, semester: '2023春' },
          { id: 3, courseCode: 'PHYS101', name: '大学物理', teacher: '王老师', credit: 4, semester: '2023春' },
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Fetch courses failed:', error);
      message.error('获取课程列表失败');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const showAddModal = () => {
    setEditingCourse(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (record) => {
    setEditingCourse(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingCourse) {
        // 更新课程
        // await axios.put(`${API_BASE}/courses/${editingCourse.id}`, values);
        setCourses(courses.map(c => c.id === editingCourse.id ? { ...c, ...values } : c));
      } else {
        // 添加课程
        // const response = await axios.post(`${API_BASE}/courses`, values);
        // setCourses([...courses, { ...values, id: Date.now() }]);
        setCourses([...courses, { ...values, id: Date.now(), teacher: '当前教师' }]);
      }
      message.success(editingCourse ? '课程更新成功' : '课程添加成功');
      setIsModalVisible(false);
      fetchCourses(); // Refresh list
    } catch (err) {
      console.error('Save course failed:', err);
      message.error('保存失败');
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这门课程吗？',
      onOk: async () => {
        try {
          // await axios.delete(`${API_BASE}/courses/${id}`);
          setCourses(courses.filter(c => c.id !== id));
          message.success('课程删除成功');
        } catch (error) {
          console.error('Delete course failed:', error);
          message.error('删除失败');
        }
      },
    });
  };

  const columns = [
    {
      title: '课程编号',
      dataIndex: 'courseCode',
      key: 'courseCode',
    },
    {
      title: '课程名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '授课教师',
      dataIndex: 'teacher',
      key: 'teacher',
    },
    {
      title: '学分',
      dataIndex: 'credit',
      key: 'credit',
    },
    {
      title: '学期',
      dataIndex: 'semester',
      key: 'semester',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => showEditModal(record)}>编辑</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={showAddModal}>
          <UserAddOutlined /> 新增课程
        </Button>
      </div>
      <Table 
        dataSource={courses} 
        columns={columns} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      
      <Modal
        title={editingCourse ? "编辑课程" : "新增课程"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="courseCode"
            label="课程编号"
            rules={[{ required: true, message: '请输入课程编号!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="课程名称"
            rules={[{ required: true, message: '请输入课程名称!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="credit"
            label="学分"
            rules={[{ required: true, message: '请输入学分!' }]}
          >
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item
            name="semester"
            label="学期"
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// 考勤管理组件 (更新：增加发起签到功能)
const AttendanceManagement = () => {
  const [sessions, setSessions] = useState([
    { id: 1, sessionCode: 'S001', courseName: '计算机科学导论', teacher: '张老师', startTime: '2023-03-01 09:00', status: 'active', duration: 10 },
    { id: 2, sessionCode: 'S002', courseName: '高等数学', teacher: '李老师', startTime: '2023-03-02 10:00', status: 'ended', duration: 15 },
  ]);
  const [checkinRecords, setCheckinRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isSessionDetailVisible, setIsSessionDetailVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [currentSessionCode, setCurrentSessionCode] = useState('');
  const [currentSessionStatus, setCurrentSessionStatus] = useState('');

  const [createForm] = Form.useForm();

  const fetchSessions = async () => {
    setLoading(true);
    try {
      // const response = await axios.get(`${API_BASE}/checkin-sessions`);
      // setSessions(response.data);
      setTimeout(() => {
        setSessions([
          { id: 1, sessionCode: 'S001', courseName: '计算机科学导论', teacher: '张老师', startTime: '2023-03-01 09:00', status: 'active', duration: 10 },
          { id: 2, sessionCode: 'S002', courseName: '高等数学', teacher: '李老师', startTime: '2023-03-02 10:00', status: 'ended', duration: 15 },
          { id: 3, sessionCode: 'S003', courseName: '大学物理', teacher: '王老师', startTime: '2023-03-03 14:00', status: 'active', duration: 12 },
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Fetch sessions failed:', error);
      message.error('获取考勤会话失败');
      setLoading(false);
    }
  };

  const fetchRecords = async (sessionId) => {
    setLoadingRecords(true);
    try {
      // const response = await axios.get(`${API_BASE}/checkin-records/session/${sessionId}`);
      // setCheckinRecords(response.data);
      // Mock records
      setTimeout(() => {
        setCheckinRecords([
          { id: 1, studentId: 'U001', studentName: '学生A', checkinTime: '2023-03-01 09:02', status: 'present' },
          { id: 2, studentId: 'U002', studentName: '学生B', checkinTime: '2023-03-01 09:05', status: 'late' },
          { id: 3, studentId: 'U003', studentName: '学生C', checkinTime: null, status: 'absent' },
        ]);
        setLoadingRecords(false);
      }, 500);
    } catch (error) {
      console.error('Fetch records failed:', error);
      message.error('获取签到记录失败');
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const showCreateModal = () => {
    createForm.resetFields();
    createForm.setFieldsValue({ duration: 10 }); // 默认持续时间
    setIsCreateModalVisible(true);
  };

  const handleCreateOk = async () => {
    try {
      const values = await createForm.validateFields();
      // Mock API call to create session
      // const response = await axios.post(`${API_BASE}/checkin-sessions`, {
      //   courseID: values.courseID,
      //   duration: values.duration
      // });
      // const newSession = response.data;
      const newSession = {
        id: Date.now(),
        sessionCode: `S${Date.now()}`, // Mock session code
        courseName: '计算机科学导论', // Mock course name
        teacher: '当前教师', // Mock teacher
        startTime: new Date().toISOString().slice(0, 19).replace('T', ' '), // Mock start time
        status: 'active',
        duration: values.duration
      };
      setSessions([newSession, ...sessions]); // Add to the top
      message.success('签到会话发起成功！');
      setIsCreateModalVisible(false);
      setCurrentSessionCode(newSession.sessionCode);
      setCurrentSessionStatus('active');
    } catch (err) {
      console.error('Create session failed:', err);
      message.error('发起签到失败');
    }
  };

  const handleEndSession = async (sessionId) => {
    Modal.confirm({
      title: '确认结束签到',
      content: '结束签到后，学生将无法再签到，确定要结束吗？',
      onOk: async () => {
        try {
          // await axios.put(`${API_BASE}/checkin-sessions/${sessionId}/end`);
          setSessions(sessions.map(s => 
            s.id === sessionId ? { ...s, status: 'ended' } : s
          ));
          if (selectedSession && selectedSession.id === sessionId) {
             setSelectedSession({...selectedSession, status: 'ended'});
             setCurrentSessionStatus('ended');
          }
          message.success('签到会话已结束');
        } catch (error) {
          console.error('End session failed:', error);
          message.error('结束签到失败');
        }
      },
    });
  };

  const showSessionDetail = (record) => {
    setSelectedSession(record);
    setIsSessionDetailVisible(true);
    if (record.status === 'ended') {
      fetchRecords(record.id); // Only fetch records if session is ended
    }
  };

  const closeSessionDetail = () => {
    setIsSessionDetailVisible(false);
    setCheckinRecords([]);
  };

  const courseOptions = [
    { label: '计算机科学导论 (CS101)', value: 1 },
    { label: '高等数学 (MATH201)', value: 2 },
    { label: '大学物理 (PHYS101)', value: 3 },
  ];

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
      title: '授课教师',
      dataIndex: 'teacher',
      key: 'teacher',
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: '持续时间(分钟)',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '进行中' : '已结束'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            disabled={record.status !== 'active'} 
            onClick={() => handleEndSession(record.id)}
            danger
          >
            结束签到
          </Button>
          <Button type="link" onClick={() => showSessionDetail(record)}>
            查看详情
          </Button>
        </Space>
      ),
    },
  ];

  const recordColumns = [
    {
      title: '学号',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: '姓名',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: '签到时间',
      dataIndex: 'checkinTime',
      key: 'checkinTime',
      render: (time) => time || '未签到'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'present' ? 'green' : 
          status === 'late' ? 'orange' : 'red'
        }>
          {status === 'present' ? '已签到' : status === 'late' ? '迟到' : '缺勤'}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={showCreateModal}>
          <PlayCircleOutlined /> 发起签到
        </Button>
      </div>
      <Table 
        dataSource={sessions} 
        columns={sessionColumns} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* 发起签到 Modal */}
      <Modal
        title="发起新的签到"
        open={isCreateModalVisible}
        onOk={handleCreateOk}
        onCancel={() => setIsCreateModalVisible(false)}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="courseID"
            label="选择课程"
            rules={[{ required: true, message: '请选择课程!' }]}
          >
            <Select placeholder="请选择课程">
              {courseOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="duration"
            label="持续时间 (分钟)"
            rules={[{ required: true, message: '请输入持续时间!' }]}
          >
            <InputNumber min={1} max={120} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 会话详情 Modal */}
      <Modal
        title={`会话详情 - ${selectedSession?.sessionCode || ''}`}
        open={isSessionDetailVisible}
        onCancel={closeSessionDetail}
        footer={null}
        width={800}
      >
        {selectedSession && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>课程: {selectedSession.courseName}</Col>
              <Col span={8}>教师: {selectedSession.teacher}</Col>
              <Col span={8}>开始时间: {selectedSession.startTime}</Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>持续时间: {selectedSession.duration} 分钟</Col>
              <Col span={8}>状态: <Tag color={selectedSession.status === 'active' ? 'green' : 'red'}>{selectedSession.status === 'active' ? '进行中' : '已结束'}</Tag></Col>
              <Col span={8}>
                {selectedSession.status === 'active' && (
                  <Button type="primary" danger onClick={() => handleEndSession(selectedSession.id)}>
                    <StopOutlined /> 结束签到
                  </Button>
                )}
              </Col>
            </Row>
            {selectedSession.status === 'ended' && (
              <div>
                <h3>签到记录</h3>
                <Table 
                  dataSource={checkinRecords} 
                  columns={recordColumns} 
                  rowKey="id" 
                  loading={loadingRecords}
                  pagination={{ pageSize: 10 }}
                  size="small"
                />
              </div>
            )}
            {selectedSession.status === 'active' && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>签到会话正在进行中...</p>
                <p>会话码: <strong>{selectedSession.sessionCode}</strong></p>
                <p>学生可以通过该会话码进行签到。</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 当前活动会话提醒 (可选) */}
      {currentSessionCode && currentSessionStatus === 'active' && (
         <Card 
           style={{ 
             marginTop: 16, 
             backgroundColor: '#e6f7ff', 
             border: '1px solid #91d5ff' 
           }}
         >
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
               <h3><ClockCircleOutlined /> 当前活动签到会话</h3>
               <p>会话码: <strong>{currentSessionCode}</strong></p>
               <p>状态: <Tag color="green">进行中</Tag></p>
             </div>
             <Button type="primary" danger onClick={() => handleEndSession(sessions.find(s => s.sessionCode === currentSessionCode)?.id)}>
               <StopOutlined /> 结束当前会话
             </Button>
           </div>
         </Card>
      )}
    </div>
  );
};

// 学生管理组件
const StudentManagement = () => {
  const [students, setStudents] = useState([
    { id: 1, studentId: 'S001', name: '学生A', email: 'a@example.com', enrolledCourses: ['CS101'] },
    { id: 2, studentId: 'S002', name: '学生B', email: 'b@example.com', enrolledCourses: ['CS101', 'MATH201'] },
  ]);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // const response = await axios.get(`${API_BASE}/students`);
      // setStudents(response.data);
      setTimeout(() => {
        setStudents([
          { id: 1, studentId: 'S001', name: '学生A', email: 'a@example.com', enrolledCourses: ['CS101'] },
          { id: 2, studentId: 'S002', name: '学生B', email: 'b@example.com', enrolledCourses: ['CS101', 'MATH201'] },
          { id: 3, studentId: 'S003', name: '学生C', email: 'c@example.com', enrolledCourses: ['MATH201'] },
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Fetch students failed:', error);
      message.error('获取学生列表失败');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const columns = [
    {
      title: '学号',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '已选课程',
      dataIndex: 'enrolledCourses',
      key: 'enrolledCourses',
      render: (courses) => (
        <Space size={[0, 8]} wrap>
          {courses?.map(course => <Tag key={course}>{course}</Tag>) || '无'}
        </Space>
      ),
    },
  ];

  return (
    <Table 
      dataSource={students} 
      columns={columns} 
      rowKey="id" 
      loading={loading}
      pagination={{ pageSize: 10 }}
    />
  );
};

// 主应用组件
const App = () => {
  const { user, login, logout } = useAuth();
  const [key, setKey] = useState('1');

  if (!user) {
    return <LoginPage onLogin={login} />;
  }

  const handleMenuClick = (e) => {
    setKey(e.key);
  };

  const renderContent = () => {
    switch (key) {
      case '1':
        return <CourseManagement />;
      case '2':
        return <AttendanceManagement />;
      case '3':
        return <StudentManagement />;
      default:
        return <div>欢迎, {user.name}!</div>;
    }
  };

  const menuItems = [
    { key: '1', label: '课程管理', icon: <BookOutlined /> },
    { key: '2', label: '考勤管理', icon: <CheckCircleOutlined /> },
    { key: '3', label: '学生管理', icon: <TeamOutlined /> },
  ];

  if (user.role === 'admin') {
    // 管理员可以看所有菜单
  } else if (user.role === 'teacher') {
    // 教师可能只看部分菜单，例如去掉学生管理
    // menuItems = menuItems.filter(item => item.key !== '3');
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="header" style={{ background: '#001529', padding: 0 }}>
        <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', lineHeight: '64px', paddingLeft: 24 }}>
          考勤管理系统
        </div>
        <div style={{ float: 'right', color: 'white', lineHeight: '64px', paddingRight: 24 }}>
          <span>欢迎您, {user.name} ({user.role})</span>
          <Button type="link" onClick={logout} style={{ color: 'white', marginLeft: 16 }}>
            <LogoutOutlined /> 退出
          </Button>
        </div>
      </Header>
      <Layout>
        <Sider width={200} className="site-layout-background">
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            selectedKeys={[key]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            className="site-layout-background"
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: '#fff',
            }}
          >
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;



