// src/services/users.js
import axiosInstance from './api/axiosInstance';

const usersService = {
    // Obtener todos los usuarios
    getAll: async (params = {}) => {
        try {
            const response = await axiosInstance.get('/users', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al obtener usuarios' };
        }
    },

    // Obtener un usuario por ID
    getById: async (id) => {
        try {
            const response = await axiosInstance.get(`/users/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al obtener usuario' };
        }
    },

    // Crear nuevo usuario
    create: async (userData) => {
        try {
            const response = await axiosInstance.post('/users', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al crear usuario' };
        }
    },

    // Actualizar usuario
    update: async (id, userData) => {
        try {
            const response = await axiosInstance.put(`/users/${id}`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al actualizar usuario' };
        }
    },

    // Eliminar usuario
    delete: async (id) => {
        try {
            const response = await axiosInstance.delete(`/users/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al eliminar usuario' };
        }
    },

    // Cambiar contraseña
    changePassword: async (oldPassword, newPassword) => {
        try {
            const response = await axiosInstance.put('/users/change-password', {
                oldPassword,
                newPassword
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al cambiar contraseña' };
        }
    },

    // Actualizar perfil del usuario actual
    updateProfile: async (profileData) => {
        try {
            const response = await axiosInstance.put('/users/profile', profileData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al actualizar perfil' };
        }
    },

    // Cambiar rol de usuario
    changeRole: async (userId, newRole) => {
        try {
            const response = await axiosInstance.patch(`/users/${userId}/role`, {
                role: newRole
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al cambiar rol' };
        }
    },

    // Activar/Desactivar usuario
    toggleStatus: async (userId) => {
        try {
            const response = await axiosInstance.patch(`/users/${userId}/toggle-status`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al cambiar estado' };
        }
    }
};

export default usersService;