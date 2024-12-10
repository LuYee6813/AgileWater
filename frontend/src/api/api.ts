import axios from "axios";

// 使用環境變數中的 API URL
// const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: "http://localhost:8887",
  timeout: 5000, // 可選，設定超時時間
  headers: {
    "Content-Type": "application/json",
  },
});

// 設置請求攔截器（可選）
api.interceptors.request.use(
  (config) => {
    // 在這裡可以添加認證 Token 或其他全域設定
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 設置回應攔截器（可選）
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 處理錯誤，如重新導向到登入頁
    if (error.response?.status === 401) {
      console.error("Unauthorized, redirecting to login...");
    }
    return Promise.reject(error);
  }
);

export default api;
