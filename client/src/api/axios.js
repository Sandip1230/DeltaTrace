import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("dt_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes("/auth/")) {
      localStorage.removeItem("dt_token");
      localStorage.removeItem("dt_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;