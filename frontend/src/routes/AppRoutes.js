import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import MainLayout from '../components/layout/MainLayout';
import AuthService from '../services/authService';
import AttendancePage from '../pages/attendance/AttendancePage';
import UsersPage from '../pages/users/UsersPage';
import CoursesPage from '../pages/courses/CoursesPage';
import EnrollmentPage from '../pages/users/EnrollmentPage';

// 简单的路由保护组件
const ProtectedRoute = ({ children }) => {
  return AuthService.isAuthenticated() ? children : <Navigate to="/login" />;
};

// 登录路由保护组件（已登录用户不能访问登录页）
const AuthRoute = ({ children }) => {
  return !AuthService.isAuthenticated() ? children : <Navigate to="/dashboard" />;
};

// 仪表盘页面组件
const DashboardPage = () => {
  const user = AuthService.getCurrentUser();
  
  return (
    <div>
      <h2>欢迎来到考勤管理系统</h2>
      <p>您好, {user?.name}!</p>
      <p>您的角色是: {user?.role === 'admin' ? '管理员' : user?.role === 'teacher' ? '教师' : '学生'}</p>
      
      <div style={{ marginTop: '20px' }}>
        {user?.role === 'admin' && (
          <div>
            <h3>管理员功能</h3>
            <ul>
              <li>用户管理 - 添加/编辑/删除用户</li>
              <li>课程管理 - 添加/编辑/删除课程</li>
              <li>选课管理 - 管理学生选课</li>
            </ul>
          </div>
        )}
        
        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <div>
            <h3>教师功能</h3>
            <ul>
              <li>考勤管理 - 发起签到、查看签到记录</li>
            </ul>
          </div>
        )}
      </div>
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
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/enrollments" element={<EnrollmentPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;