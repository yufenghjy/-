import React from 'react';
import { Layout, Menu, Button, message } from 'antd';
import { 
  UserOutlined, 
  BookOutlined, 
  CalendarOutlined, 
  TeamOutlined,
  LogoutOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { useNavigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { ROLES } from '../../constants/roles';

const { Header, Content, Sider } = Layout;

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    message.success('已退出登录');
    navigate('/login');
  };

  const getMenuItems = () => {
    const items = [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: '仪表盘',
      }
    ];

    if (user?.role === ROLES.ADMIN) {
      items.push(
        {
          key: '/users',
          icon: <TeamOutlined />,
          label: '用户管理',
        },
        {
          key: '/courses',
          icon: <BookOutlined />,
          label: '课程管理',
        }
      );
    }

    items.push(
      {
        key: '/attendance',
        icon: <CalendarOutlined />,
        label: '考勤管理',
      }
    );

    return items;
  };

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="header">
        <div style={{ 
          color: 'white', 
          fontSize: '18px', 
          fontWeight: 'bold',
          float: 'left'
        }}>
          考勤管理系统
        </div>
        <div style={{ float: 'right', color: 'white', marginRight: '20px' }}>
          <span style={{ marginRight: '10px' }}>
            欢迎, {user?.name}
          </span>
          <Button 
            type="link" 
            onClick={handleLogout}
            icon={<LogoutOutlined />}
            style={{ color: 'white' }}
          >
            退出
          </Button>
        </div>
      </Header>
      <Layout>
        <Sider width={200} className="site-layout-background">
          <Menu
            mode="inline"
            defaultSelectedKeys={['/dashboard']}
            style={{ height: '100%', borderRight: 0 }}
            items={getMenuItems()}
            onClick={handleMenuClick}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content
            className="site-layout-background"
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;