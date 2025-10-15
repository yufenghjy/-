import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('Failed to parse user data', e);
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  return { user, login, logout, isAuthenticated: !!user };
};

export default useAuth;