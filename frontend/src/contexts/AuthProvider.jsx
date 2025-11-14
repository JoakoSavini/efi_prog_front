import { useState, useEffect, useCallback } from "react";
// Último intento de combinación de rutas: con extensión para el archivo JSX local
import { AuthContext } from "./AuthContext.jsx";
// Sin extensión para el archivo de servicio
import api from "../services/api/axiosInstance";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  /**
   * Normaliza los roles del backend (ej: 'médico') a claves consistentes en MINÚSCULAS
   */
  const normalizeRole = (rol) => {
    if (!rol) return null;
    const lowerRol = rol.toLowerCase();

    if (lowerRol === "médico") {
      return "doctor";
    } else if (lowerRol === "paciente") {
      return "patient";
    } else if (lowerRol === "admin" || lowerRol === "administrador") {
      return "admin";
    }

    return lowerRol;
  };

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const loginUser = useCallback((tokenValue, backendUser) => {
    if (tokenValue) {
      localStorage.setItem("token", tokenValue);
      setToken(tokenValue);
    }

    let userForFrontend = null;
    if (backendUser) {
      const normalizedRole = normalizeRole(backendUser.rol || backendUser.role);
      userForFrontend = { ...backendUser, role: normalizedRole };
      localStorage.setItem("user", JSON.stringify(userForFrontend));
      setUser(userForFrontend);
    }
    return userForFrontend;
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (token) {
      api
        .get("/auth/profile")
        .then((res) => {
          const backendUser = res.data?.data || null;
          if (backendUser) {
            loginUser(token, backendUser);
          } else {
            logout();
          }
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Corrige la advertencia del linter
      } catch {
        localStorage.removeItem("user");
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [token, logout, loginUser]);

  const login = useCallback(
    async (credentials) => {
      const payload = {
        correo: credentials.email || credentials.correo,
        contraseña: credentials.password || credentials.contraseña,
      };

      const res = await api.post("/auth/login", payload);
      const data = res.data?.data || {};

      const userForFrontend = loginUser(data.token, data.user);

      return { ...data, user: userForFrontend };
    },
    [loginUser]
  );

  const register = useCallback(
    async (userData) => {
      const res = await api.post("/auth/register", userData);
      const data = res.data?.data || {};

      const userForFrontend = loginUser(data.token, data.user);

      return { ...data, user: userForFrontend };
    },
    [loginUser]
  );

  const value = {
    user,
    token,
    login,
    logout,
    register,
    loading,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
