import apiClient from './api';

class AuthService {
  /**
   * 用户登录
   * @param {Object} credentials - 登录凭证 { username, password }
   * @returns {Promise} 登录结果
   */
  static async login(credentials) {
    try {
      const response = await apiClient.post('/login', credentials);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg || '登录失败');
    }
  }

  /**
   * 用户登出
   */
  static logout() {
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
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
    return user && user.data && user.data.user && user.data.user.role === role;
  }
}

export default AuthService;