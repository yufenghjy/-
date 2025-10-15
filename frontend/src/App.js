import React, { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import { BookOutlined, CheckCircleOutlined, TeamOutlined, LogoutOutlined } from '@ant-design/icons';
import LoginPage from './pages/auth/LoginPage';
import useAuth from './hooks/useAuth';
import AppRoutes from './routes/AppRoutes';

const { Header, Content, Sider } = Layout;

// 主应用组件
const App = () => {
  return <AppRoutes />;
};

export default App;



