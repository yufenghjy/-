import apiClient from './api';

// 转换课程数据格式，将大驼峰命名转换为小驼峰命名
const transformCourseData = (course) => {
  if (!course) return course;
  
  return {
    id: course.ID || course.id,
    courseCode: course.CourseCode || course.courseCode,
    name: course.Name || course.name,
    teacher: course.Teacher || course.teacher,  // 添加对Teacher字段的处理
    teacherId: course.TeacherID || course.teacherId,
    credit: course.Credit || course.credit,
    semester: course.Semester || course.semester,
    createdAt: course.CreatedAt || course.createdAt,
    updatedAt: course.UpdatedAt || course.updatedAt,
  };
};

class CourseService {
  /**
   * 获取所有课程
   * @returns {Promise} 课程列表
   */
  static async getCourses() {
    try {
      const response = await apiClient.get('/courses/all');
      // 转换数据格式
      if (response.data && response.data.data) {
        response.data.data = response.data.data.map(course => transformCourseData(course));
      }
      return response;
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
      // 转换数据格式
      if (response.data && response.data.data) {
        response.data.data = response.data.data.map(course => transformCourseData(course));
      }
      return response;
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
      // 转换数据格式
      if (response.data && response.data.data) {
        response.data.data = transformCourseData(response.data.data);
      }
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.msg || '获取课程详情失败');
    }
  }

  /**
   * 创建课程
   * @param {Object} courseData - 课程数据
   * @returns {Promise} 创建的课程
   */
  static async createCourse(courseData) {
    try {
      // 调整数据格式以匹配后端期望的格式
      const requestData = {
        CourseCode: courseData.CourseCode || courseData.courseCode,
        Name: courseData.Name || courseData.name,
        TeacherID: courseData.TeacherID || courseData.teacherId, // 修复字段映射
        Credit: courseData.Credit || courseData.credit,
        Semester: courseData.Semester || courseData.semester
      };
      
      const response = await apiClient.post('/courses/add', requestData);
      // 转换数据格式
      if (response.data && response.data.data) {
        response.data.data = transformCourseData(response.data.data);
      }
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.msg || '创建课程失败');
    }
  }

  /**
   * 更新课程
   * @param {number} id - 课程ID
   * @param {Object} courseData - 课程数据
   * @returns {Promise} 更新的课程
   */
  static async updateCourse(id, courseData) {
    try {
      // 调整数据格式以匹配后端期望的格式
      const requestData = {
        CourseCode: courseData.CourseCode || courseData.courseCode,
        Name: courseData.Name || courseData.name,
        TeacherID: courseData.TeacherID || courseData.teacherId, // 添加对教师ID字段的处理
        Credit: courseData.Credit || courseData.credit,
        Semester: courseData.Semester || courseData.semester
      };
      
      const response = await apiClient.put(`/courses/${id}`, requestData);
      // 转换数据格式
      if (response.data && response.data.data) {
        response.data.data = transformCourseData(response.data.data);
      }
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.msg || '更新课程失败');
    }
  }

  /**
   * 删除课程
   * @param {number} id - 课程ID
   * @returns {Promise}
   */
  static async deleteCourse(id) {
    try {
      const response = await apiClient.delete(`/courses/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.msg || '删除课程失败');
    }
  }
}

export default CourseService;