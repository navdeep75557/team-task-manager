import axios from "axios";

const railwayApiUrl = "https://team-task-manager-production-0f44.up.railway.app/api";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || railwayApiUrl
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
