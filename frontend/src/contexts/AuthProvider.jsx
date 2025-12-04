import { useState, useEffect, useCallback } from "react";
// Último intento de combinación de rutas: con extensión para el archivo JSX local
import { AuthContext } from "./AuthContext.jsx";
// Sin extensión para el archivo de servicio
import api from "../services/api/axiosInstance";
import authService from "../services/auth";

// --- Funciones Seguras para LocalStorage ---

const getStoredUser = () => {
  const user = localStorage.getItem("user");
  // Esto previene el SyntaxError si 'user' es null o undefined
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    console.error("Error al parsear el usuario del localStorage:", e);
    return null;
  }
};

const getStoredToken = () => {
  return localStorage.getItem("token") || null;
};

const removeAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// --- Componente AuthProvider ---

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
      // Delegate to authService which normalizes and stores token/user
      const res = await authService.login(credentials);
      // authService returns { token, user } or similar shape
      const tokenValue = res?.token || localStorage.getItem("token");
      const backendUser = res?.user || authService.getStoredUser();
      const userForFrontend = loginUser(tokenValue, backendUser);

      return { ...res, user: userForFrontend };
    },
    [loginUser]
  );

  const register = useCallback(
    async (userData) => {
      const res = await authService.register(userData);
      const tokenValue = res?.token || localStorage.getItem("token");
      const backendUser = res?.user || authService.getStoredUser();
      const userForFrontend = loginUser(tokenValue, backendUser);

      return { ...res, user: userForFrontend };
    },
    [loginUser]
  );

  const refreshProfile = useCallback(async () => {
    if (!token) return null;
    try {
      const res = await api.get("/auth/profile");
      const backendUser = res.data?.data || null;
      if (backendUser) {
        const normalizedRole = normalizeRole(backendUser.rol || backendUser.role);
        const userForFrontend = { ...backendUser, role: normalizedRole };
        localStorage.setItem("user", JSON.stringify(userForFrontend));
        setUser(userForFrontend);
        return userForFrontend;
      }
    } catch (err) {
      console.error("Error al refrescar perfil:", err);
    }
    return null;
  }, [token, normalizeRole]);

  const value = {
    user,
    token,
    login,
    logout,
    register,
    loading,
    isAuthenticated: !!token && !!user,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
