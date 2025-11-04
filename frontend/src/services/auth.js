// src/services/auth.js
import axiosInstance from './api/axiosInstance';

const authService = {
    // Login de usuario
    login: async (credentials) => {
        try {
            const response = await axiosInstance.post('/auth/login', credentials);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al iniciar sesión' };
        }
    },

    // Registro de nuevo usuario
    register: async (userData) => {
        try {
            const response = await axiosInstance.post('/auth/register', userData);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al registrar usuario' };
        }
    },

    // Cerrar sesión
    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },

    // Obtener usuario actual
    getCurrentUser: async () => {
        try {
            const response = await axiosInstance.get('/auth/me');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al obtener usuario' };
        }
    },

    // Recuperar contraseña
    forgotPassword: async (email) => {
        try {
            const response = await axiosInstance.post('/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al enviar correo' };
        }
    },

    // Reset contraseña
    resetPassword: async (token, newPassword) => {
        try {
            const response = await axiosInstance.post('/auth/reset-password', {
                token,
                password: newPassword
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al restablecer contraseña' };
        }
    },

    // Verificar si está autenticado
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    // Obtener token
    getToken: () => {
        return localStorage.getItem('token');
    },

    // Obtener usuario del localStorage
    getStoredUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};

export default authService;