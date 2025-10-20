import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Card, 
  message, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Tag,
  Space,
  Popconfirm,
  Result,
  Alert
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined, RedoOutlined } from '@ant-design/icons';
import UserService from '../../services/userService';
import AuthService from '../../services/authService';

const { Option } = Select;

// 转换用户数据，处理前后端字段命名不一致问题
const transformUserData = (user) => {
  if (!user) return user;
  
  // 处理大写字段名到小写字段名的转换
  return {
    id: user.ID || user.id,
    username: user.Username || user.username,
    name: user.Name || user.name,
    role: user.Role || user.role,
    email: user.Email || user.email,
    createdAt: user.CreatedAt || user.createdAt,
    updatedAt: user.UpdatedAt || user.updatedAt
  };
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [usernameError, setUsernameError] = useState(null);
  
  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await UserService.getUsers();
      // 提取数据，兼容不同响应结构
      const userData = response.data?.data || response.data || [];
      // 确保 userData 是数组，然后转换数据格式以匹配前端期望的字段名
      const transformedUsers = Array.isArray(userData) ? userData.map(transformUserData) : [];
      setUsers(transformedUsers);
    } catch (error) {
      console.error('获取用户列表失败:', error);
      message.error(error.message || '获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 生成随机用户名
  const generateRandomUsername = (name = '') => {
    const prefix = name.toLowerCase().replace(/\s+/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4位随机数
    return prefix ? `${prefix}${randomNum}` : `user${randomNum}`;
  };

  const showAddModal = () => {
    setEditingUser(null);
    form.resetFields();
    setUsernameError(null); // 清除之前的用户名错误
    setIsModalVisible(true);
  };

  const showEditModal = (user) => {
    const transformedUser = transformUserData(user);
    setEditingUser(transformedUser);
    form.setFieldsValue(transformedUser);
    setUsernameError(null); // 清除之前的用户名错误
    setIsModalVisible(true);
  };

  const showPasswordModal = (user) => {
    const transformedUser = transformUserData(user);
    setSelectedUser(transformedUser);
    passwordForm.resetFields();
    setIsPasswordModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        // 编辑用户
        const response = await UserService.updateUser(editingUser.id, values);
        message.success(response.data?.msg || response.msg || '用户信息更新成功');
        setIsModalVisible(false);
        setUsernameError(null); // 清除错误
      } else {
        // 添加用户
        try {
          const response = await UserService.createUser(values);
          message.success(response.data?.msg || response.msg || '用户添加成功');
          setIsModalVisible(false);
          setUsernameError(null); // 清除错误
        } catch (error) {
          // 检查是否是用户名已存在的错误
          console.error('创建用户失败:', error);
          if (error.response && error.response.data && error.response.data.msg === '用户名已存在') {
            setUsernameError('用户名已存在，请修改用户名或生成新用户名');
            message.error('用户名已存在，请修改用户名或生成新用户名');
            return; // 不关闭模态框，让用户修改
          }
          message.error(error.response?.data?.msg || error.message || '操作失败');
          throw error; // 其他错误正常抛出
        }
      }
      fetchUsers();
    } catch (error) {
      // 只有非用户名重复的错误才显示通用错误信息
      if (usernameError === null) {
        message.error(error.response?.data?.msg || error.message || '操作失败');
      }
    }
  };

  const handleDelete = async (userId) => {
    try {
      const response = await UserService.deleteUser(userId);
      message.success(response.data?.msg || response.msg || '用户删除成功');
      fetchUsers();
    } catch (error) {
      console.error('删除用户失败:', error);
      message.error(error.response?.data?.msg || error.message || '删除用户失败');
    }
  };

  const handlePasswordReset = async () => {
    try {
      const values = await passwordForm.validateFields();
      const response = await UserService.resetPassword(selectedUser.id, values.password);
      message.success(response.data?.msg || response.msg || '密码重置成功');
      setIsPasswordModalVisible(false);
    } catch (error) {
      console.error('密码重置失败:', error);
      message.error(error.response?.data?.msg || error.message || '密码重置失败');
    }
  };

  const getRoleTag = (role) => {
    const roleLower = role?.toLowerCase();
    switch (roleLower) {
      case 'admin':
        return <Tag color="red">管理员</Tag>;
      case 'teacher':
        return <Tag color="blue">教师</Tag>;
      case 'student':
        return <Tag color="green">学生</Tag>;
      default:
        return <Tag>{role}</Tag>;
    }
  };

  // 重新生成用户名
  const regenerateUsername = () => {
    const name = form.getFieldValue('name');
    const newUsername = generateRandomUsername(name);
    form.setFieldsValue({ username: newUsername });
    setUsernameError(null); // 清除错误提示
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => getRoleTag(role),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
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
            icon={<KeyOutlined />} 
            onClick={() => showPasswordModal(record)}
            size="small"
          >
            重置密码
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
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
        title="用户管理" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={showAddModal}
          >
            添加用户
          </Button>
        }
      >
        <Table 
          dataSource={users} 
          columns={columns} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingUser ? "编辑用户" : "添加用户"}
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
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input 
              disabled={!!editingUser} 
              addonAfter={
                !editingUser && (
                  <Button 
                    type="link" 
                    icon={<RedoOutlined />} 
                    onClick={regenerateUsername}
                    style={{ padding: 0 }}
                  />
                )
              }
            />
          </Form.Item>
          
          {usernameError && (
            <Alert 
              message={usernameError} 
              type="error" 
              showIcon 
              action={
                <Button size="small" danger onClick={regenerateUsername}>
                  生成新用户名
                </Button>
              }
              style={{ marginBottom: 16 }}
            />
          )}
          
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱!' },
              { type: 'email', message: '请输入有效的邮箱地址!' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色!' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="student">学生</Option>
              <Option value="teacher">教师</Option>
              <Option value="admin">管理员</Option>
            </Select>
          </Form.Item>
          
          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码!' },
                { min: 6, message: '密码至少6位!' }
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title={`重置【${selectedUser?.name}】的密码`}
        open={isPasswordModalVisible}
        onOk={handlePasswordReset}
        onCancel={() => setIsPasswordModalVisible(false)}
        destroyOnClose
      >
        <Form
          form={passwordForm}
          layout="vertical"
        >
          <Form.Item
            name="password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码!' },
              { min: 6, message: '密码至少6位!' }
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersPage;