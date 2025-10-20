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
      
      // 登录成功，保存用户信息和token
      if (response.data && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        if (response.data.user) {
          localStorage.setItem('authUser', JSON.stringify(response.data.user));
        }
      }
      
      return response.data;
    } catch (error) {
      let errorMessage = '登录失败，请重试';
      
      if (!error.response) {
        // 网络错误或请求未发送
        errorMessage = '网络连接失败，请检查网络';
      } else {
        const status = error.response.status;
        switch (status) {
          case 401:
            errorMessage = '用户名或密码错误';
            break;
          case 403:
            errorMessage = '账户被禁止访问';
            break;
          case 404:
            errorMessage = '登录接口不存在';
            break;
          case 500:
            errorMessage = '服务器内部错误';
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      }
      
      // 创建包含详细信息的错误对象
      const authError = new Error(errorMessage);
      authError.status = error.response?.status;
      authError.originalError = error;
      
      throw authError;
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
   * 获取认证Token
   * @returns {string|null} 认证Token
   */
  static getToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * 检查用户是否已认证
   * @returns {boolean} 是否已认证
   */
  static isAuthenticated() {
    return !!this.getCurrentUser() && !!this.getToken();
  }

  /**
   * 检查用户是否具有指定角色
   * @param {string} role - 角色
   * @returns {boolean} 是否具有指定角色
   */
  static hasRole(role) {
    const user = this.getCurrentUser();
    return user && (user.role === role || user.Role === role);
  }
}

export default AuthService;