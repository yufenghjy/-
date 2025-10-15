import apiClient from './api';

class AuthService {
  /**
   * 用户登录
   * @param {Object} credentials - 登录凭证 { username, password }
   * @returns {Promise} 登录结果
   */
  static async login(credentials) {
    // 在真实应用中，这里会调用 apiClient.post('/login', credentials)
    // 由于是mock，我们返回一个模拟的Promise
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            id: 1,
            username: credentials.username,
            name: credentials.username === 'admin' ? 'Admin User' : 'Teacher User',
            role: credentials.username === 'admin' ? 'admin' : 'teacher',
            token: 'mock-jwt-token'
          }
        });
      }, 1000);
    });
  }

  /**
   * 用户登出
   */
  static logout() {
    localStorage.removeItem('authUser');
  }

  /**
   * 获取当前用户
   * @returns {Object|null} 当前用户信息
   */
  static getCurrentUser() {
    const user = localStorage.getItem('authUser');
    return user ? JSON.parse(user) : null;
  }

  /**
   * 检查用户是否已认证
   * @returns {boolean} 是否已认证
   */
  static isAuthenticated() {
    return !!this.getCurrentUser();
  }

  /**
   * 检查用户是否具有指定角色
   * @param {string} role - 角色
   * @returns {boolean} 是否具有指定角色
   */
  static hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }
}

export default AuthService;