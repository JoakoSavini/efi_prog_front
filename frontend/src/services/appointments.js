import axiosInstance from "./api/axiosInstance";

const appointmentsService = {
  // Obtener todas las citas
  getAll: async (params = {}) => {
    try {
      const response = await axiosInstance.get("/citas", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener citas" };
    }
  },

  // Obtener una cita por ID
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/citas/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener cita" };
    }
  },

  // Crear nueva cita
  create: async (appointmentData) => {
    try {
      const response = await axiosInstance.post("/citas", appointmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al crear cita" };
    }
  },

  // Actualizar cita
  update: async (id, appointmentData) => {
    try {
      const response = await axiosInstance.put(`/citas/${id}`, appointmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al actualizar cita" };
    }
  },

  // Eliminar cita
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/citas/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar cita" };
    }
  },

  // Obtener citas por paciente (CORREGIDO)
  getByPatient: async (patientId) => {
    try {
      const response = await axiosInstance.get(`/citas/paciente/${patientId}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Error al obtener citas del paciente",
        }
      );
    }
  },

  // Obtener citas por doctor (CORREGIDO)
  getByDoctor: async (doctorId) => {
    try {
      const response = await axiosInstance.get(`/citas/medico/${doctorId}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Error al obtener citas del doctor" }
      );
    }
  },

  // Cancelar cita (CORREGIDO)
  cancel: async (id, motivo_cancelacion) => {
    try {
      const response = await axiosInstance.patch(`/citas/${id}/cancelar`, {
        motivo_cancelacion,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al cancelar cita" };
    }
  },

  // Confirmar cita (CORREGIDO)
  confirm: async (id) => {
    try {
      const response = await axiosInstance.patch(`/citas/${id}/confirmar`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al confirmar cita" };
    }
  },

  // Completar cita (CORREGIDO)
  complete: async (id) => {
    try {
      const response = await axiosInstance.patch(`/citas/${id}/completar`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al completar cita" };
    }
  },
};

export default appointmentsService;
