import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Card, Typography } from 'antd';
import LoginPage from '../pages/auth/LoginPage';
import MainLayout from '../components/layout/MainLayout';
import AuthService from '../services/authService';
import AttendancePage from '../pages/attendance/AttendancePage';
import UsersPage from '../pages/users/UsersPage';
import CoursesPage from '../pages/courses/CoursesPage';
import EnrollmentPage from '../pages/users/EnrollmentPage';
import { ROLE_LABELS } from '../constants/roles';

const { Title, Text } = Typography;

// 简单的路由保护组件
const ProtectedRoute = ({ children }) => {
  return AuthService.isAuthenticated() ? children : <Navigate to="/login" />;
};

// 登录路由保护组件（已登录用户不能访问登录页）
const AuthRoute = ({ children }) => {
  return !AuthService.isAuthenticated() ? children : <Navigate to="/dashboard" />;
};

// 首页页面组件
const HomePage = () => {
  const user = AuthService.getCurrentUser();
  
  return (
    <div>
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            backgroundColor: '#1890ff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginRight: '16px',
            color: 'white',
            fontSize: '24px'
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              欢迎来到考勤管理系统
            </Title>
            <Text type="secondary">
              {ROLE_LABELS[user?.role] || user?.role || '未知角色'} 
              {user?.username && ` (${user.username})`}
            </Text>
          </div>
        </div>
      </Card>
      
      <Card>
        <p>欢迎使用考勤管理系统！</p>
        <p>请使用左侧导航菜单访问系统功能。</p>
      </Card>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <AuthRoute>
            <LoginPage />
          </AuthRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<HomePage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/enrollments" element={<EnrollmentPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;