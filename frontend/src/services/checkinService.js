import apiClient from './api';

class CheckinService {
  /**
   * 发起签到
   * @param {Object} data - 签到数据 { course_id, duration }
   * @returns {Promise} 签到结果
   */
  static async startCheckin(data) {
    try {
      const response = await apiClient.post('/start-checkin', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg || '发起签到失败');
    }
  }

  /**
   * 学生签到
   * @param {Object} data - 签到数据 { session_code, student_id }
   * @returns {Promise} 签到结果
   */
  static async studentCheckin(data) {
    try {
      const response = await apiClient.post('/checkin', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg || '签到失败');
    }
  }

  /**
   * 获取签到记录
   * @param {number} sessionId - 签到会话ID
   * @returns {Promise} 签到记录列表
   */
  static async getCheckinRecords(sessionId) {
    try {
      const response = await apiClient.get(`/records/${sessionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg || '获取签到记录失败');
    }
  }

  /**
   * 获取会话信息
   * @param {string} sessionCode - 会话码
   * @returns {Promise} 会话信息
   */
  static async getSessionInfo(sessionCode) {
    try {
      const response = await apiClient.get(`/session/${sessionCode}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.msg || '获取会话信息失败');
    }
  }
}

export default CheckinService;