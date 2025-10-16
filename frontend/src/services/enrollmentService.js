import apiClient from './api';

class EnrollmentService {
  // 获取所有选课记录
  getEnrollments() {
    console.log('Fetching enrollments...');
    return apiClient.get('/enrollments').then(response => {
      console.log('Enrollments response:', response);
      return response;
    });
  }

  // 创建选课记录
  createEnrollment(data) {
    console.log('Creating enrollment:', data);
    return apiClient.post('/enrollments', data).then(response => {
      console.log('Create enrollment response:', response);
      return response;
    });
  }

  // 删除选课记录
  deleteEnrollment(id) {
    console.log('Deleting enrollment:', id);
    return apiClient.delete(`/enrollments/${id}`).then(response => {
      console.log('Delete enrollment response:', response);
      return response; // 或者对于删除操作，可以只返回一个成功标志
    });
  }
}

export default new EnrollmentService();