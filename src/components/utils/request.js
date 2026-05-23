// src/utils/request.js
import axios from 'axios';

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 后端接口基础路径（从环境变量读取）
  timeout: 5000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
});

// 请求拦截器：添加token等通用参数
service.interceptors.request.use(
  (config) => {
    // 示例：从本地存储获取token并添加到请求头
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：统一处理响应/错误
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    // 假设后端约定成功码为200
    if (res.code !== 200) {
      ElMessage.error(res.msg || '请求失败');
      return Promise.reject(res);
    }
    return res;
  },
  (error) => {
    ElMessage.error(error.message || '服务器错误');
    return Promise.reject(error);
  }
);

export default service;