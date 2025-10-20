import apiClient from './api';

class UserService {
  // 获取所有用户
  getUsers() {
    return apiClient.get('/users');
  }

  // 获取所有学生
  getStudents() {
    return apiClient.get('/students');
  }

  // 获取所有教师
  getTeachers() {
    return apiClient.get('/teachers');
  }

  // 创建用户
  createUser(userData) {
    return apiClient.post('/users', userData);
  }

  // 更新用户
  updateUser(id, userData) {
    return apiClient.put(`/users/${id}`, userData);
  }

  // 删除用户
  deleteUser(id) {
    return apiClient.delete(`/users/${id}`);
  }

  // 重置用户密码
  resetPassword(id, password) {
    return apiClient.put(`/users/${id}/password`, { password });
  }
}

export default new UserService();