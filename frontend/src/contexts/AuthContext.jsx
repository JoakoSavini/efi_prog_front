// src/contexts/AuthContext.jsx

import { createContext, useContext } from "react";

// 1. Crear el objeto Contexto.
export const AuthContext = createContext(null);

// 2. Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    // Esto previene errores si alguien usa useAuth fuera del <AuthProvider>
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
