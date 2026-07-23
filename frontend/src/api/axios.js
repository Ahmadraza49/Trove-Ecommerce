import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Attach JWT token (SRS 1.3) to every request if the user is logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
