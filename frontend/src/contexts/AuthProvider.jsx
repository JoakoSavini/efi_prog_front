// src/contexts/AuthProvider.jsx
import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import api from "../services/api/axiosInstance";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    }, []);

    useEffect(() => {
        if (token) {
            api.get("/auth/profile")
                .then((res) => {
                    // backend returns { success: true, data: user }
                    const backendUser = res.data?.data || null;
                    if (backendUser) {
                        // normalize role names used in frontend
                        const normalizedRole =
                            backendUser.rol === 'médico' ? 'doctor' : backendUser.rol === 'paciente' ? 'patient' : backendUser.rol;
                        setUser({ ...backendUser, role: normalizedRole });
                    } else {
                        setUser(null);
                    }
                })
                .catch(() => logout());
        }
        setLoading(false);
    }, [token, logout]);

    const login = useCallback(async (credentials) => {
        // map frontend fields (email, password) to backend expected keys (correo, contraseña)
        const payload = {
            correo: credentials.email || credentials.correo,
            contraseña: credentials.password || credentials.contraseña
        };

        const res = await api.post("/auth/login", payload);
        // backend response shape: { success, message, data: { token, user } }
        const data = res.data?.data || {};
        const tokenValue = data.token;
        const backendUser = data.user || null;

        if (tokenValue) {
            localStorage.setItem("token", tokenValue);
            setToken(tokenValue);
        }

        let userForFrontend = null;
        if (backendUser) {
            const normalizedRole =
                backendUser.rol === 'médico' ? 'doctor' : backendUser.rol === 'paciente' ? 'patient' : backendUser.rol;
            userForFrontend = { ...backendUser, role: normalizedRole };
            localStorage.setItem("user", JSON.stringify(userForFrontend));
            setUser(userForFrontend);
        }

        return { ...data, user: userForFrontend };
    }, []);

    const register = useCallback(async (userData) => {
        // map common frontend keys to backend expected ones
        const payload = {
            nombre: userData.nombre || userData.firstName || userData.name,
            apellido: userData.apellido || userData.lastName || userData.surname,
            correo: userData.correo || userData.email,
            contraseña: userData.contraseña || userData.password,
            rol: userData.rol || userData.role,
            telefono: userData.telefono || userData.phone,
            direccion: userData.direccion || userData.address
        };

        const res = await api.post("/auth/register", payload);
        const data = res.data?.data || {};
        const tokenValue = data.token;
        const backendUser = data.user || null;

        if (tokenValue) {
            localStorage.setItem("token", tokenValue);
            setToken(tokenValue);
        }

        let userForFrontend = null;
        if (backendUser) {
            const normalizedRole =
                backendUser.rol === 'médico' ? 'doctor' : backendUser.rol === 'paciente' ? 'patient' : backendUser.rol;
            userForFrontend = { ...backendUser, role: normalizedRole };
            localStorage.setItem("user", JSON.stringify(userForFrontend));
            setUser(userForFrontend);
        }

        return { ...data, user: userForFrontend };
    }, []);

    const value = {
        user,
        token,
        login,
        logout,
        register,
        loading,
        isAuthenticated: !!token
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};