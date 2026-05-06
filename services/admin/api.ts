import axios from "axios";

export const adminApi = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ??
    "http://localhost:4000/api/admin",
  timeout: 15000,
});

adminApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.error ?? error?.message ?? "Request failed";
    return Promise.reject(new Error(message));
  },
);
