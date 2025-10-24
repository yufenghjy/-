import apiClient from './api';

const CheckinService = {
  // 发起签到
  startCheckin: (data) => apiClient.post('/start-checkin', data),
  
  // 获取签到会话列表
  getCheckinSessions: () => apiClient.get('/checkin-sessions'),
  
  // 获取签到记录
  getCheckinRecords: (sessionId) => apiClient.get(`/records/${sessionId}`),
  
  // 结束签到会话
  endCheckinSession: (sessionId) => apiClient.put(`/end-checkin/${sessionId}`),
  
  // 手动结束签到会话
  manualEndCheckinSession: (sessionId) => apiClient.put(`/manual-end-checkin/${sessionId}`),
  
  // 补签功能
  manualCheckin: (sessionId, data) => apiClient.post(`/manual-checkin/${sessionId}`, data),
};

export default CheckinService;
