import React, { useState } from 'react';
import { Form, Input, Button, Card, App } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';
import { ROLES } from '../../constants/roles';

const LoginPage = () => {
  const { message: messageApi } = App.useApp();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await AuthService.login(values);
      
      // 正确处理后端返回的数据格式
      const userData = response.data?.user || response.data || response;
      const token = response.data?.token || response.token;
      
      // 确保用户数据和token都存在
      if (!userData || !token) {
        throw new Error('登录响应格式不正确');
      }
      
      // 保存用户信息和token
      localStorage.setItem('authUser', JSON.stringify({
        id: userData.id || userData.ID,
        username: userData.username || userData.Username,
        name: userData.name || userData.Name,
        role: userData.role || userData.Role
      }));
      localStorage.setItem('authToken', token);
      messageApi.success('登录成功');
      
      // 根据角色跳转到不同页面
      const role = userData.role || userData.Role;
      if (role === ROLES.ADMIN) {
        navigate('/users');
      } else if (role === ROLES.TEACHER) {
        navigate('/attendance');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
      
      // 提供更具体和友好的错误提示
      let errorMessage = '登录失败，请检查用户名和密码';
      
      // 根据不同的错误类型提供具体的错误信息
      if (error.response) {
        // 服务器返回了错误响应
        switch (error.response.status) {
          case 401:
            errorMessage = '用户名或密码错误，请重新输入';
            break;
          case 403:
            errorMessage = '账户已被禁用，请联系管理员';
            break;
          case 404:
            errorMessage = '登录服务不可用，请稍后再试';
            break;
          case 500:
            errorMessage = '服务器内部错误，请稍后再试';
            break;
          default:
            // 尝试从响应数据中获取错误消息
            if (error.response.data) {
              if (typeof error.response.data === 'string') {
                errorMessage = error.response.data;
              } else if (error.response.data.msg) {
                errorMessage = error.response.data.msg;
              } else if (error.response.data.message) {
                errorMessage = error.response.data.message;
              } else if (error.response.data.error) {
                errorMessage = error.response.data.error;
              } else if (typeof error.response.data === 'object') {
                // 尝试从嵌套对象中获取错误消息
                const data = error.response.data;
                if (data.data && typeof data.data === 'string') {
                  errorMessage = data.data;
                } else if (data.data && data.data.msg) {
                  errorMessage = data.data.msg;
                }
              }
            }
        }
      } else if (error.request) {
        // 请求已发出但没有收到响应
        errorMessage = '网络连接异常，请检查网络设置';
      } else if (error.message) {
        // 其他错误
        errorMessage = error.message;
      }
      
      // 显示错误消息
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      background: '#f0f2f5' 
    }}>
      <Card title="考勤系统登录" style={{ width: 400 }}>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名" 
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="密码" 
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;