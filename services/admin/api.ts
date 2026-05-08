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
  // Unwrap the { success, data } envelope so callers get `data` directly.
  (response) => {
    if (
      response.data &&
      typeof response.data === "object" &&
      "success" in response.data
    ) {
      response.data = response.data.data ?? response.data;
    }
    return response;
  },
  (error) => {
    const status = error?.response?.status as number | undefined;
    const message =
      error?.response?.data?.error ?? error?.message ?? "Request failed";

    if (status === 401 && typeof window !== "undefined") {
      sessionStorage.removeItem("admin_token");
      sessionStorage.removeItem("admin_name");
      sessionStorage.removeItem("admin_email");
      sessionStorage.removeItem("admin_role");
      window.dispatchEvent(new Event("admin-auth-changed"));
    }

    return Promise.reject(Error(message));
  },
);
