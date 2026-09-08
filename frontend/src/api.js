import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: automatically clear expired credentials and redirect on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthPath =
        window.location.pathname === "/login" || window.location.pathname === "/register";
      if (!isAuthPath) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);


/**
 * Resolves an attachment/upload file path.
 * When VITE_API_URL is configured (e.g. https://your-backend.onrender.com/api),
 * this maps relative attachment paths (/uploads/...) to the deployed backend origin.
 * In local dev without VITE_API_URL, it leaves the path relative so Vite proxies it.
 */
export function getAttachmentUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const apiBase = import.meta.env.VITE_API_URL;
  if (!apiBase) {
    return path;
  }
  const backendRoot = apiBase.replace(/\/api\/?$/, "");
  return `${backendRoot}${path.startsWith("/") ? "" : "/"}${path}`;
}

export default api;

