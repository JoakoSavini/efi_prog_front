// src/services/patients.js
import axiosInstance from './api/axiosInstance';

const patientsService = {
    // Obtener todos los pacientes
    getAll: async (params = {}) => {
        try {
            const response = await axiosInstance.get('/patients', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al obtener pacientes' };
        }
    },

    // Obtener un paciente por ID
    getById: async (id) => {
        try {
            const response = await axiosInstance.get(`/patients/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al obtener paciente' };
        }
    },

    // Crear nuevo paciente
    create: async (patientData) => {
        try {
            const response = await axiosInstance.post('/patients', patientData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al crear paciente' };
        }
    },

    // Actualizar paciente
    update: async (id, patientData) => {
        try {
            const response = await axiosInstance.put(`/patients/${id}`, patientData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al actualizar paciente' };
        }
    },

    // Eliminar paciente
    delete: async (id) => {
        try {
            const response = await axiosInstance.delete(`/patients/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al eliminar paciente' };
        }
    },

    // Obtener historial médico del paciente
    getMedicalHistory: async (patientId) => {
        try {
            const response = await axiosInstance.get(`/patients/${patientId}/medical-history`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al obtener historial médico' };
        }
    },

    // Actualizar historial médico
    updateMedicalHistory: async (patientId, historyData) => {
        try {
            const response = await axiosInstance.put(`/patients/${patientId}/medical-history`, historyData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al actualizar historial médico' };
        }
    },

    // Buscar paciente por DNI o nombre
    search: async (query) => {
        try {
            const response = await axiosInstance.get('/patients/search', {
                params: { q: query }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al buscar paciente' };
        }
    },

    // Obtener estadísticas del paciente
    getStats: async (patientId) => {
        try {
            const response = await axiosInstance.get(`/patients/${patientId}/stats`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al obtener estadísticas' };
        }
    }
};

export default patientsService;