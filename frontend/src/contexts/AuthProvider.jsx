import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext.jsx";
import api from "../services/api/axiosInstance";
import authService from "../services/auth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  const normalizeRole = useCallback((rol) => {
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
  }, []);

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
  }, [normalizeRole]);

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
      const res = await authService.login(credentials);
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
