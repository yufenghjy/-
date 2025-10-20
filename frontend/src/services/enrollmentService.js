import apiClient from './api';

class EnrollmentService {
  // 获取所有选课记录
  getEnrollments() {
    return apiClient.get('/enrollments').then(response => {
      return response;
    });
  }

  // 创建选课记录
  createEnrollment(data) {
    return apiClient.post('/enrollments', data).then(response => {
      return response;
    });
  }

  // 删除选课记录
  deleteEnrollment(id) {
    return apiClient.delete(`/enrollments/${id}`).then(response => {
      return response; // 或者对于删除操作，可以只返回一个成功标志
    });
  }
}

export default new EnrollmentService();