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
  Tag,
  Select,
  Popconfirm,
  Alert
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, RedoOutlined } from '@ant-design/icons';
import CourseService from '../../services/courseService';
import UserService from '../../services/userService';

// 转换课程数据格式，将大驼峰命名转换为小驼峰命名
const transformCourseData = (course) => {
  return {
    id: course.ID || course.id,
    courseCode: course.CourseCode || course.courseCode,
    name: course.Name || course.name,
    teacher: course.Teacher || course.teacher,  // 添加对Teacher字段的处理
    teacherId: course.TeacherID || course.teacherId,
    credit: course.Credit || course.credit,
    semester: course.Semester || course.semester,
    createdAt: course.CreatedAt || course.createdAt,
    updatedAt: course.UpdatedAt || course.updatedAt,
  };
};

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]); // 添加教师列表状态
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form] = Form.useForm();
  const [courseCodeError, setCourseCodeError] = useState(null); // 添加课程代码错误状态

  // 获取课程列表
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await CourseService.getCourses();
      // 从响应中正确提取数据
      const data = response.data?.data || [];
      // 转换数据格式以匹配前端期望的字段名
      const transformedCourses = (data || []).map(course => transformCourseData(course));
      setCourses(transformedCourses);
      setLoading(false);
    } catch (error) {
      message.error(error.message || '获取课程列表失败');
      setLoading(false);
    }
  };

  // 获取教师列表
  const fetchTeachers = async () => {
    try {
      const response = await UserService.getTeachers();
      // 从响应中正确提取数据
      const data = response.data?.data || [];
      // 转换教师数据格式
      const transformedTeachers = (data || []).map(teacher => ({
        id: teacher.ID || teacher.id,
        name: teacher.Name || teacher.name
      }));
      setTeachers(transformedTeachers);
    } catch (error) {
      message.error(error.message || '获取教师列表失败');
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchTeachers(); // 获取教师列表
  }, []);

  const showAddModal = () => {
    setEditingCourse(null);
    form.resetFields();
    setCourseCodeError(null); // 清除之前的课程代码错误
    setIsModalVisible(true);
  };

  const showEditModal = (course) => {
    setEditingCourse(course);
    // 使用转换后的字段名设置表单值
    form.setFieldsValue({
      courseCode: course.courseCode,
      name: course.name,
      teacherId: course.teacherId, // 使用teacherId而不是teacher
      credit: course.credit,
      semester: course.semester
    });
    setCourseCodeError(null); // 清除之前的课程代码错误
    setIsModalVisible(true);
  };

  // 重新生成课程代码
  const regenerateCourseCode = () => {
    const name = form.getFieldValue('name');
    const prefix = name ? name.substring(0, 3).toUpperCase() : 'COURSE';
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4位随机数
    form.setFieldsValue({ courseCode: `${prefix}${randomNum}` });
    setCourseCodeError(null); // 清除错误提示
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingCourse) {
        // 编辑课程
        // 准备后端期望的数据格式
        const courseData = {
          CourseCode: values.courseCode,
          Name: values.name,
          TeacherID: values.teacherId, // 允许修改教师
          Credit: values.credit,
          Semester: values.semester
        };
        
        await CourseService.updateCourse(editingCourse.id, courseData);
        message.success('课程信息更新成功');
        setCourseCodeError(null); // 清除错误
      } else {
        // 添加课程
        // 准备后端期望的数据格式
        const courseData = {
          CourseCode: values.courseCode,
          Name: values.name,
          TeacherID: values.teacherId, // 使用TeacherID而不是Teacher
          Credit: values.credit,
          Semester: values.semester
        };
        
        try {
          await CourseService.createCourse(courseData);
          message.success('课程添加成功');
          setIsModalVisible(false);
          setCourseCodeError(null); // 清除错误
        } catch (error) {
          // 检查是否是课程代码已存在的错误
          if (error.message && error.message.includes('课程代码已存在')) {
            setCourseCodeError('课程代码已存在，请修改课程代码或生成新代码');
            message.error('课程代码已存在，请修改课程代码或生成新代码');
            return; // 不关闭模态框，让用户修改
          }
          message.error(error.message || '操作失败');
          throw error; // 其他错误正常抛出
        }
      }
      setIsModalVisible(false);
      fetchCourses();
    } catch (error) {
      // 只有非课程代码重复的错误才显示通用错误信息
      if (!courseCodeError) {
        message.error(error.message || '操作失败');
      }
    }
  };

  const handleDelete = async (course) => {
    try {
      await CourseService.deleteCourse(course.id);
      message.success('课程删除成功');
      fetchCourses();
    } catch (error) {
      message.error(error.message || '删除课程失败');
    }
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
      render: (text) => text || '未分配'
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
          <Popconfirm
            title="确定要删除这门课程吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
            >
              删除
            </Button>
          </Popconfirm>
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
            <Input 
              disabled={!!editingCourse} 
              addonAfter={
                !editingCourse && (
                  <Button 
                    type="link" 
                    icon={<RedoOutlined />} 
                    onClick={regenerateCourseCode}
                    style={{ padding: 0 }}
                  />
                )
              }
            />
          </Form.Item>
          
          {courseCodeError && (
            <Alert 
              message={courseCodeError} 
              type="error" 
              showIcon 
              action={
                <Button size="small" danger onClick={regenerateCourseCode}>
                  生成新课程代码
                </Button>
              }
              style={{ marginBottom: 16 }}
            />
          )}
          
          <Form.Item
            name="name"
            label="课程名称"
            rules={[{ required: true, message: '请输入课程名称!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="teacherId"
            label="授课教师"
            rules={[{ required: true, message: '请选择授课教师!' }]}
          >
            <Select 
              placeholder="请选择授课教师"
              disabled={false} // 编辑时允许修改教师
            >
              {teachers.map(teacher => (
                <Select.Option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </Select.Option>
              ))}
            </Select>
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
            rules={[{ required: true, message: '请选择学期!' }]}
          >
            <Select placeholder="请选择学期">
              <Select.Option value="2025-春季">2025年春季</Select.Option>
              <Select.Option value="2025-秋季">2025年秋季</Select.Option>
              <Select.Option value="2026-春季">2026年春季</Select.Option>
              <Select.Option value="2026-秋季">2026年秋季</Select.Option>
              <Select.Option value="2027-春季">2027年春季</Select.Option>
              <Select.Option value="2027-秋季">2027年秋季</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CoursesPage;