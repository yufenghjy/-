import apiClient from './api';

class EnrollmentService {
  // 获取所有选课记录
  async getEnrollments() {
    try {
      const response = await apiClient.get('/enrollments');
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.msg || '获取选课记录失败');
    }
  }

  // 创建选课记录
  async createEnrollment(data) {
    try {
      const response = await apiClient.post('/enrollments', data);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.msg || '创建选课记录失败');
    }
  }

  // 删除选课记录
  async deleteEnrollment(id) {
    try {
      const response = await apiClient.delete(`/enrollments/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.msg || '删除选课记录失败');
    }
  }
}

export default new EnrollmentService();