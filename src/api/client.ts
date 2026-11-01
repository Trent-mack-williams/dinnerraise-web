import axios from "axios";

// Reads VITE_API_URL from .env if set, otherwise uses the local backend
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Before every request, attach the saved login token if there is one
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});