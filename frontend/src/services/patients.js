import axiosInstance from "./api/axiosInstance";

const patientsService = {
  // Obtener todos los pacientes
  getAll: async (params = {}) => {
    try {
      const response = await axiosInstance.get("/pacientes", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener pacientes" };
    }
  },

  // Obtener un paciente por ID
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/pacientes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener paciente" };
    }
  },

  // Crear nuevo paciente
  create: async (patientData) => {
    try {
      const response = await axiosInstance.post("/pacientes", patientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al crear paciente" };
    }
  },

  // Actualizar paciente
  update: async (id, patientData) => {
    try {
      const response = await axiosInstance.put(`/pacientes/${id}`, patientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al actualizar paciente" };
    }
  },

  // Eliminar paciente
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/pacientes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar paciente" };
    }
  },

  // Obtener historial médico del paciente (CORREGIDO)
  getMedicalHistory: async (patientId) => {
    try {
      const response = await axiosInstance.get("/historiales", {
        params: { paciente_id: patientId },
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Error al obtener historial médico" }
      );
    }
  },

  // Crear entrada en historial médico (CORREGIDO)
  createMedicalHistory: async (historyData) => {
    try {
      const response = await axiosInstance.post("/historiales", historyData);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Error al crear historial médico",
        }
      );
    }
  },

  // Buscar paciente (CORREGIDO)
  search: async (query) => {
    try {
      const response = await axiosInstance.get("/pacientes", {
        params: { search: query },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al buscar paciente" };
    }
  },

  // Nota: La API no tiene endpoint de estadísticas según la documentación
  // Si lo necesitas, deberás implementarlo en el backend primero
};

export default patientsService;
