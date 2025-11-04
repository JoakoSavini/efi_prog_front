// src/services/doctors.js
import axiosInstance from './api/axiosInstance';

const doctorsService = {
    // Obtener todos los doctores
    getAll: async (params = {}) => {
        try {
            const response = await axiosInstance.get('/doctors', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al obtener doctores' };
        }
    },

    // Obtener un doctor por ID
    getById: async (id) => {
        try {
            const response = await axiosInstance.get(`/doctors/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al obtener doctor' };
        }
    },

    // Crear nuevo doctor
    create: async (doctorData) => {
        try {
            const response = await axiosInstance.post('/doctors', doctorData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al crear doctor' };
        }
    },

    // Actualizar doctor
    update: async (id, doctorData) => {
        try {
            const response = await axiosInstance.put(`/doctors/${id}`, doctorData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al actualizar doctor' };
        }
    },

    // Eliminar doctor
    delete: async (id) => {
        try {
            const response = await axiosInstance.delete(`/doctors/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al eliminar doctor' };
        }
    },

    // Obtener especialidades disponibles
    getSpecialties: async () => {
        try {
            const response = await axiosInstance.get('/doctors/specialties');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al obtener especialidades' };
        }
    },

    // Obtener doctores por especialidad
    getBySpecialty: async (specialty) => {
        try {
            const response = await axiosInstance.get(`/doctors/specialty/${specialty}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al obtener doctores por especialidad' };
        }
    },

    // Obtener disponibilidad del doctor
    getAvailability: async (doctorId, date) => {
        try {
            const response = await axiosInstance.get(`/doctors/${doctorId}/availability`, {
                params: { date }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al obtener disponibilidad' };
        }
    },

    // Actualizar horario del doctor
    updateSchedule: async (doctorId, scheduleData) => {
        try {
            const response = await axiosInstance.put(`/doctors/${doctorId}/schedule`, scheduleData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al actualizar horario' };
        }
    }
};

export default doctorsService;