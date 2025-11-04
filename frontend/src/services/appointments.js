// src/services/appointments.js
import axiosInstance from './api/axiosInstance';

const appointmentsService = {
    // Obtener todas las citas
    getAll: async (params = {}) => {
        try {
            const response = await axiosInstance.get('/appointments', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al obtener citas' };
        }
    },

    // Obtener una cita por ID
    getById: async (id) => {
        try {
            const response = await axiosInstance.get(`/appointments/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al obtener cita' };
        }
    },

    // Crear nueva cita
    create: async (appointmentData) => {
        try {
            const response = await axiosInstance.post('/appointments', appointmentData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al crear cita' };
        }
    },

    // Actualizar cita
    update: async (id, appointmentData) => {
        try {
            const response = await axiosInstance.put(`/appointments/${id}`, appointmentData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al actualizar cita' };
        }
    },

    // Eliminar cita
    delete: async (id) => {
        try {
            const response = await axiosInstance.delete(`/appointments/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al eliminar cita' };
        }
    },

    // Obtener citas por paciente
    getByPatient: async (patientId) => {
        try {
            const response = await axiosInstance.get(`/appointments/patient/${patientId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al obtener citas del paciente' };
        }
    },

    // Obtener citas por doctor
    getByDoctor: async (doctorId) => {
        try {
            const response = await axiosInstance.get(`/appointments/doctor/${doctorId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al obtener citas del doctor' };
        }
    },

    // Cancelar cita
    cancel: async (id, reason) => {
        try {
            const response = await axiosInstance.patch(`/appointments/${id}/cancel`, { reason });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al cancelar cita' };
        }
    },

    // Confirmar cita
    confirm: async (id) => {
        try {
            const response = await axiosInstance.patch(`/appointments/${id}/confirm`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al confirmar cita' };
        }
    },

    // Completar cita
    complete: async (id, notes) => {
        try {
            const response = await axiosInstance.patch(`/appointments/${id}/complete`, { notes });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al completar cita' };
        }
    }
};

export default appointmentsService;