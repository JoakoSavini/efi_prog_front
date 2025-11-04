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
            api.get("/auth/me")
                .then((res) => setUser(res.data))
                .catch(() => logout());
        }
        setLoading(false);
    }, [token, logout]);

    const login = useCallback(async (email, password) => {
        const res = await api.post("/auth/login", { email, password });
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
    }, []);

    const register = useCallback(async (userData) => {
        const res = await api.post("/auth/register", userData);
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
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