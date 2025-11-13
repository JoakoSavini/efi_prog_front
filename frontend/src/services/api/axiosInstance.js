// src/services/api/axiosInstance.js
import axios from "axios";

// Si VITE_API_URL está definida usala (útil para producción), si no usa '/api' para aprovechar el proxy de Vite en dev
const baseURL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    if (error.response?.status === 403) {
      console.error("No tienes permisos para esta acción");
    }

    return Promise.reject(error);
  }
);

export default api;
