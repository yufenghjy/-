import axios from 'axios';

// API基础配置
const API_BASE = 'http://localhost:8080/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 检查是否是登录请求
    const isLoginRequest = error.config && 
      (error.config.url === '/login' || 
       error.config.url === 'login' ||
       error.config.url.endsWith('/login'));
    
    // 只有在非登录请求且状态码为401时才重定向到登录页
    if (error.response?.status === 401 && !isLoginRequest) {
      // 未授权，清除用户信息并跳转到登录页
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
      // 只有在浏览器环境中才进行重定向
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;