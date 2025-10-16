import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Card, 
  message, 
  Modal, 
  Form, 
  Select, 
  Tag,
  Space,
  Input
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const EnrollmentPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 模拟获取选课记录
  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      // 实际项目中这里会调用API获取选课记录
      // 模拟数据
      setTimeout(() => {
        setEnrollments([
          { id: 1, studentId: 'student001', studentName: '张三', courseId: 1, courseName: '计算机科学导论', enrollTime: '2023-03-01' },
          { id: 2, studentId: 'student002', studentName: '李四', courseId: 1, courseName: '计算机科学导论', enrollTime: '2023-03-01' },
          { id: 3, studentId: 'student001', studentName: '张三', courseId: 2, courseName: '高等数学', enrollTime: '2023-03-02' }
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      message.error('获取选课记录失败');
      setLoading(false);
    }
  };

  // 模拟获取学生列表
  const fetchStudents = async () => {
    try {
      // 实际项目中这里会调用API获取学生列表
      // 模拟数据
      setTimeout(() => {
        setStudents([
          { id: 1, studentId: 'student001', name: '张三' },
          { id: 2, studentId: 'student002', name: '李四' },
          { id: 3, studentId: 'student003', name: '王五' }
        ]);
      }, 500);
    } catch (error) {
      message.error('获取学生列表失败');
    }
  };

  // 模拟获取课程列表
  const fetchCourses = async () => {
    try {
      // 实际项目中这里会调用API获取课程列表
      // 模拟数据
      setTimeout(() => {
        setCourses([
          { id: 1, courseCode: 'CS101', name: '计算机科学导论' },
          { id: 2, courseCode: 'MATH201', name: '高等数学' },
          { id: 3, courseCode: 'ENG101', name: '大学英语' }
        ]);
      }, 500);
    } catch (error) {
      message.error('获取课程列表失败');
    }
  };

  useEffect(() => {
    fetchEnrollments();
    fetchStudents();
    fetchCourses();
  }, []);

  const showAddModal = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      // 添加选课记录
      message.success('选课成功');
      setIsModalVisible(false);
      fetchEnrollments();
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const handleDelete = (enrollmentId) => {
    Modal.confirm({
      title: '确认退课',
      content: '确定要删除这个选课记录吗？',
      onOk: () => {
        // 实际项目中这里会调用API删除选课记录
        message.success('退课成功');
        fetchEnrollments();
      }
    });
  };

  const columns = [
    {
      title: '学生学号',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: '学生姓名',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: '课程名称',
      dataIndex: 'courseName',
      key: 'courseName',
    },
    {
      title: '选课时间',
      dataIndex: 'enrollTime',
      key: 'enrollTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            danger 
            onClick={() => handleDelete(record.id)}
            size="small"
          >
            退课
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card 
        title="选课管理" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={showAddModal}
          >
            添加选课
          </Button>
        }
      >
        <Table 
          dataSource={enrollments} 
          columns={columns} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="添加选课"
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
            name="studentId"
            label="学生"
            rules={[{ required: true, message: '请选择学生!' }]}
          >
            <Select 
              showSearch
              placeholder="请选择学生"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {students.map(student => (
                <Option key={student.studentId} value={student.studentId}>
                  {student.name} ({student.studentId})
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="courseId"
            label="课程"
            rules={[{ required: true, message: '请选择课程!' }]}
          >
            <Select 
              showSearch
              placeholder="请选择课程"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {courses.map(course => (
                <Option key={course.id} value={course.id}>
                  {course.name} ({course.courseCode})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EnrollmentPage;