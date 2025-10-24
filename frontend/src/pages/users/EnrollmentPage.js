import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Card, 
  message, 
  Modal, 
  Form, 
  Select, 
  Space,
  Popconfirm,
  Alert
} from 'antd';
import { PlusOutlined, DeleteOutlined, RedoOutlined } from '@ant-design/icons';
import EnrollmentService from '../../services/enrollmentService';
import UserService from '../../services/userService';
import CourseService from '../../services/courseService';

const { Option } = Select;

const EnrollmentPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [enrollmentError, setEnrollmentError] = useState(null); // 添加选课错误状态

  // 获取选课记录
  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const response = await EnrollmentService.getEnrollments();
      // 从响应中正确提取数据
      const data = response.data?.data || [];
      setEnrollments(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('获取选课记录失败:', error);
      message.error(error.message || '获取选课记录失败');
      setEnrollments([]);
      setLoading(false);
    }
  };

  // 获取学生列表
  const fetchStudents = async () => {
    try {
      const response = await UserService.getStudents();
      // 从响应中正确提取数据
      const data = response.data?.data || [];
      // 确保数据是数组格式
      const studentList = Array.isArray(data) ? data : [];
      setStudents(studentList);
    } catch (error) {
      console.error('获取学生列表失败:', error);
      message.error(error.message || '获取学生列表失败');
      setStudents([]);
    }
  };

  // 获取课程列表
  const fetchCourses = async () => {
    try {
      const response = await CourseService.getCourses();
      // 从响应中正确提取数据
      const data = response.data?.data || [];
      // 确保数据是数组格式
      const courseList = Array.isArray(data) ? data : [];
      setCourses(courseList);
    } catch (error) {
      console.error('获取课程列表失败:', error);
      message.error(error.message || '获取课程列表失败');
      setCourses([]);
    }
  };

  useEffect(() => {
    fetchEnrollments();
    fetchStudents();
    fetchCourses();
  }, []);

  const showAddModal = () => {
    form.resetFields();
    setEnrollmentError(null); // 清除之前的选课错误
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      // 添加选课记录
      try {
        await EnrollmentService.createEnrollment({
          studentId: values.studentId,
          courseId: values.courseId
        });
        message.success('选课成功');
        setIsModalVisible(false);
        setEnrollmentError(null); // 清除错误
        fetchEnrollments();
      } catch (error) {
        // 检查是否是学生已经选修该课程的错误
        if (error.message && error.message.includes('该学生已经选修了这门课程')) {
          setEnrollmentError('该学生已经选修了这门课程');
          message.error('该学生已经选修了这门课程');
          return; // 不关闭模态框，让用户修改
        }
        message.error(error.message || '操作失败');
        throw error; // 其他错误正常抛出
      }
    } catch (error) {
      // 只有非选课重复的错误才显示通用错误信息
      if (!enrollmentError) {
        message.error(error.message || '操作失败');
      }
    }
  };

  const handleDelete = async (enrollmentId) => {
    try {
      await EnrollmentService.deleteEnrollment(enrollmentId);
      message.success('退课成功');
      fetchEnrollments();
    } catch (error) {
      console.error('退课失败:', error);
      message.error(error.message || '退课失败');
    }
  };

  const columns = [
    {
      title: '学生学号',
      dataIndex: 'studentId',
      key: 'studentId',
      render: (_, record) => {
        // 使用正确的字段名查找对应的学生信息
        const student = students.find(s => s.ID === record.studentId);
        return student ? student.Username : record.studentId;
      }
    },
    {
      title: '学生姓名',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (_, record) => {
        // 如果后端已经返回了学生姓名，直接使用；否则从学生列表中查找
        if (record.studentName) {
          return record.studentName;
        }
        const student = students.find(s => s.ID === record.studentId);
        return student ? student.Name : '未知学生';
      }
    },
    {
      title: '课程名称',
      dataIndex: 'courseName',
      key: 'courseName',
      render: (_, record) => {
        // 如果后端已经返回了课程名称，直接使用；否则从课程列表中查找
        if (record.courseName) {
          return record.courseName;
        }
        const course = courses.find(c => c.ID === record.courseId);
        return course ? course.Name : '未知课程';
      }
    },
    {
      title: '选课时间',
      dataIndex: 'enrollTime',
      key: 'enrollTime',
      render: (text) => text ? new Date(text).toLocaleString('zh-CN') : '未知时间'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm
            title="确认退课"
            description="确定要删除这个选课记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              danger 
              icon={<DeleteOutlined />}
              size="small"
            >
              退课
            </Button>
          </Popconfirm>
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
          {enrollmentError && (
            <Alert 
              message={enrollmentError} 
              type="error" 
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          
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
                <Option key={student.ID} value={student.ID}>
                  {student.Name} ({student.Username})
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