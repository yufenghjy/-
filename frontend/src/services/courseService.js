import apiClient from './api';

class CourseService {
  /**
   * 获取所有课程
   * @returns {Promise} 课程列表
   */
  static async getCourses() {
    try {
      const response = await apiClient.get('/courses');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg || '获取课程列表失败');
    }
  }

  /**
   * 获取当前教师的课程
   * @returns {Promise} 教师课程列表
   */
  static async getMyCourses() {
    try {
      const response = await apiClient.get('/courses');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg || '获取我的课程失败');
    }
  }

  /**
   * 根据ID获取课程详情
   * @param {number} id - 课程ID
   * @returns {Promise} 课程详情
   */
  static async getCourseById(id) {
    try {
      const response = await apiClient.get(`/courses/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg || '获取课程详情失败');
    }
  }
}

export default CourseService;