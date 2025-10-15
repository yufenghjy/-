import { useState, useEffect } from 'react';
import AuthService from '../services/authService';

/**
 * 自定义Hook：用于管理用户认证状态
 */
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('authUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    AuthService.logout();
  };

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  return { user, loading, login, logout, isAuthenticated: !!user };
};

export default useAuth;