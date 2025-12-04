// src/services/auth.js
import axiosInstance from "./api/axiosInstance";

const authService = {
  // Login de usuario
  login: async (credentials) => {
    try {
      // map common frontend keys to backend expected ones
      const payload = {
        correo: credentials.email || credentials.correo,
        contraseña: credentials.password || credentials.contraseña,
      };
      const response = await axiosInstance.post("/auth/login", payload);
      // backend returns { success, message, data: { token, user } }
      const data = response.data?.data || {};
      if (data.token) {
        localStorage.setItem("token", data.token);
        // normalize role names similar to AuthProvider
        const backendUser = data.user || null;
        if (backendUser) {
          const normalizedRole =
            backendUser.rol === "médico"
              ? "doctor"
              : backendUser.rol === "paciente"
              ? "patient"
              : backendUser.rol;
          const userForFrontend = { ...backendUser, role: normalizedRole };
          localStorage.setItem("user", JSON.stringify(userForFrontend));
          return { ...data, user: userForFrontend };
        }
      }
      return data;
    } catch (error) {
      throw error.response?.data || { message: "Error al iniciar sesión" };
    }
  },

  // Registro de nuevo usuario
  register: async (userData) => {
    try {
      const payload = {
        nombre: userData.nombre || userData.firstName || userData.name,
        apellido: userData.apellido || userData.lastName || userData.surname,
        correo: userData.correo || userData.email,
        contraseña: userData.contraseña || userData.password,
        rol: userData.rol || userData.role || "paciente",
        telefono: userData.telefono || userData.phone,
        direccion: userData.direccion || userData.address,
      };
      const response = await axiosInstance.post("/auth/register", payload);
      const data = response.data?.data || {};
      if (data.token) {
        localStorage.setItem("token", data.token);
        const backendUser = data.user || null;
        if (backendUser) {
          const normalizedRole =
            backendUser.rol === "médico"
              ? "doctor"
              : backendUser.rol === "paciente"
              ? "patient"
              : backendUser.rol;
          const userForFrontend = { ...backendUser, role: normalizedRole };
          localStorage.setItem("user", JSON.stringify(userForFrontend));
          return { ...data, user: userForFrontend };
        }
      }
      return data;
    } catch (error) {
      throw error.response?.data || { message: "Error al registrar usuario" };
    }
  },

  // Cerrar sesión
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  // Obtener usuario actual
  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get("/auth/profile");
      return response.data?.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener usuario" };
    }
  },

  // Recuperar contraseña
  forgotPassword: async (email) => {
    try {
      const response = await axiosInstance.post("/auth/forgot-password", {
        email,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al enviar correo" };
    }
  },

  // Reset contraseña
  resetPassword: async (token, newPassword) => {
    try {
      const response = await axiosInstance.post("/auth/reset-password", {
        token,
        password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Error al restablecer contraseña" }
      );
    }
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Obtener token
  getToken: () => {
    return localStorage.getItem("token");
  },

  // Obtener usuario del localStorage
  getStoredUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

export default authService;
