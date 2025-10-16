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
   * 获取所有教师
   * @returns {Promise} 教师列表
   */
  static async getTeachers() {
    try {
      const response = await apiClient.get('/teachers'); // 修改为正确的URL
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg || '获取教师列表失败');
    }
  }

  /**
   * 创建用户
   * @param {Object} userData - 用户数据
   * @returns {Promise} 创建的用户
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
   * @param {number} id - 用户ID
   * @param {Object} userData - 用户数据
   * @returns {Promise} 更新的用户
   */
  static async updateUser(id, userData) {
    try {
      const response = await apiClient.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg || '更新用户失败');
    }
  }

  /**
   * 删除用户
   * @param {number} id - 用户ID
   * @returns {Promise}
   */
  static async deleteUser(id) {
    try {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg || '删除用户失败');
    }
  }
}

export default UserService;