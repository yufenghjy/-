import apiClient from './api';

class UserService {
  /**
   * 获取所有用户
   * @returns {Promise} 用户列表
   */
  static async getUsers() {
    try {
      const response = await apiClient.get('/users');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg || '获取用户列表失败');
    }
  }

  /**
   * 创建用户
   * @param {Object} userData - 用户数据 { username, name, password, role, email }
   * @returns {Promise} 创建结果
   */
  static async createUser(userData) {
    try {
      const response = await apiClient.post('/users', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg || '创建用户失败');
    }
  }

  /**
   * 更新用户
   * @param {number} userId - 用户ID
   * @param {Object} userData - 用户数据 { name, role, email }
   * @returns {Promise} 更新结果
   */
  static async updateUser(userId, userData) {
    try {
      const response = await apiClient.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg || '更新用户失败');
    }
  }

  /**
   * 删除用户
   * @param {number} userId - 用户ID
   * @returns {Promise} 删除结果
   */
  static async deleteUser(userId) {
    try {
      const response = await apiClient.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg || '删除用户失败');
    }
  }

  /**
   * 重置用户密码
   * @param {number} userId - 用户ID
   * @param {string} newPassword - 新密码
   * @returns {Promise} 重置结果
   */
  static async resetPassword(userId, newPassword) {
    try {
      const response = await apiClient.put(`/users/${userId}/password`, { password: newPassword });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg || '重置密码失败');
    }
  }
}

export default UserService;