import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Card, 
  message, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Space,
  Tag
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form] = Form.useForm();

  // 模拟获取课程列表
  const fetchCourses = async () => {
    setLoading(true);
    try {
      // 实际项目中这里会调用API获取课程列表
      // const response = await apiClient.get('/courses');
      // 模拟数据
      setTimeout(() => {
        setCourses([
          { id: 1, courseCode: 'CS101', name: '计算机科学导论', teacher: '王老师', credit: 3, semester: '2023年春季' },
          { id: 2, courseCode: 'MATH201', name: '高等数学', teacher: '李老师', credit: 4, semester: '2023年春季' },
          { id: 3, courseCode: 'ENG101', name: '大学英语', teacher: '张老师', credit: 2, semester: '2023年春季' }
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
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

  const showEditModal = (course) => {
    setEditingCourse(course);
    form.setFieldsValue(course);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingCourse) {
        // 编辑课程
        message.success('课程信息更新成功');
      } else {
        // 添加课程
        message.success('课程添加成功');
      }
      setIsModalVisible(false);
      fetchCourses();
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const handleDelete = (courseId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这门课程吗？',
      onOk: () => {
        // 实际项目中这里会调用API删除课程
        message.success('课程删除成功');
        fetchCourses();
      }
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
      render: (credit) => <Tag color="blue">{credit}</Tag>
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
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
            size="small"
          >
            编辑
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
            size="small"
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card 
        title="课程管理" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={showAddModal}
          >
            添加课程
          </Button>
        }
      >
        <Table 
          dataSource={courses} 
          columns={columns} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingCourse ? "编辑课程" : "添加课程"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
        >
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
            name="teacher"
            label="授课教师"
            rules={[{ required: true, message: '请输入授课教师!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="credit"
            label="学分"
            rules={[{ required: true, message: '请输入学分!' }]}
          >
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="semester"
            label="学期"
            rules={[{ required: true, message: '请输入学期!' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CoursesPage;