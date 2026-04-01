const rawApiBaseUrl = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5000/api";

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");
