// src/contexts/AuthProvider.jsx

import React, { useState, useEffect, useCallback } from "react";
// Importar AuthContext y el hook useAuth (si lo tienes en un archivo separado)
import { AuthContext } from "./AuthContext";
import api from "../services/api/axiosInstance";

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
  const [user, setUser] = useState(getStoredUser()); // Usar la función segura
  const [token, setToken] = useState(getStoredToken());
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    removeAuthData();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    // Lógica de revalidación al cargar o al cambiar el token
    if (token) {
      api
        .get("/api/auth/me")
        .then((res) => {
          // Si el backend devuelve user, actualiza el estado local y localStorage
          const fetchedUser = res.data.user || res.data; // Adapta si /auth/me devuelve el user directo o dentro de un objeto
          setUser(fetchedUser);
          localStorage.setItem("user", JSON.stringify(fetchedUser));
        })
        .catch(() => {
          console.error("Token expirado o inválido. Cerrando sesión.");
          logout();
        });
    }
    setLoading(false);
  }, [token, logout]);

  // Función de login (Recibe {correo, contraseña})
  const login = useCallback(async (credentials) => {
    // credentials debe ser { correo: '...', contraseña: '...' }
    const res = await api.post("/auth/login", credentials);

    // La respuesta de la API es { success, message, data: { token, user } }
    const { token: newToken, user: newUser } = res.data.data;

    // 1. Guardar token y usuario en localStorage
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    // 2. Actualizar estado local
    setToken(newToken);
    setUser(newUser);

    // 3. Devolver la respuesta COMPLETA para que Login.jsx redirija
    return res.data;
  }, []);

  const register = useCallback(async (userData) => {
    const res = await api.post("/auth/register", userData);

    const { token: newToken, user: newUser } = res.data.data;

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);

    return res.data;
  }, []);

  // Función de ayuda para verificar roles (útil para PrivateRoute)
  const hasRole = useCallback(
    (requiredRole) => {
      // Asegúrate de que el campo 'rol' es el que usa tu API: 'admin', 'médico', 'paciente'
      return user && user.rol === requiredRole;
    },
    [user]
  );

  const value = {
    user,
    token,
    login,
    logout,
    register,
    loading,
    isAuthenticated: !!token,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
