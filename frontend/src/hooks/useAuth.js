import { useState, useEffect } from 'react';
import AuthService from '../services/authService';

/**
 * 自定义Hook：用于管理用户认证状态
 * 使用 localStorage 进行用户数据持久化
 */
const useAuth = () => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    // 确保接收到完整的用户数据
    if (userData && typeof userData === 'object') {
      setUser(userData);
      localStorage.setItem('authUser', JSON.stringify(userData));
      
      // 如果返回了token，也进行存储
      if (userData.token) {
        localStorage.setItem('authToken', userData.token);
      }
    } else {
      console.error('Invalid user data format received during login');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
  };

  // 监听 localStorage 变化，以便在多个标签页之间同步用户状态
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'authUser') {
        if (e.newValue) {
          try {
            const parsedUser = JSON.parse(e.newValue);
            setUser(parsedUser);
          } catch (err) {
            console.error('Failed to parse user data from storage event', err);
            logout();
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 初始化用户状态
  useEffect(() => {
    // 直接从 AuthService 获取当前用户信息
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  return { user, login, logout, isAuthenticated: !!user };
};

export default useAuth;