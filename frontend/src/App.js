import React, { useState } from 'react';
import { Layout, Menu, Button, App as AntApp } from 'antd';
import { BookOutlined, CheckCircleOutlined, TeamOutlined, LogoutOutlined } from '@ant-design/icons';
import LoginPage from './pages/auth/LoginPage';
import useAuth from './hooks/useAuth';
import AppRoutes from './routes/AppRoutes';

const { Header, Content, Sider } = Layout;

// 主应用组件
const App = () => {
  return (
    <AntApp>
      <AppRoutes />
    </AntApp>
  );
};

export default App;