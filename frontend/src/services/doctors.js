import axiosInstance from "./api/axiosInstance";

const doctorsService = {
  // Obtener todos los doctores
  getAll: async (params = {}) => {
    try {
      const response = await axiosInstance.get("/medicos", { params });
      return response.data?.data || response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener doctores" };
    }
  },

  // Obtener un doctor por ID
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/medicos/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener doctor" };
    }
  },

  // Crear nuevo doctor
  create: async (doctorData) => {
    try {
      const response = await axiosInstance.post("/medicos", doctorData);
      return response.data?.data || response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al crear doctor" };
    }
  },

  // Actualizar doctor
  update: async (id, doctorData) => {
    try {
      const response = await axiosInstance.put(`/medicos/${id}`, doctorData);
      return response.data?.data || response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al actualizar doctor" };
    }
  },

  // Eliminar doctor
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/medicos/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar doctor" };
    }
  },

  // Obtener especialidades disponibles (CORREGIDO)
  getSpecialties: async () => {
    try {
      const response = await axiosInstance.get("/especialidades");
      return response.data?.data || response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Error al obtener especialidades" }
      );
    }
  },

  // Obtener doctores por especialidad (CORREGIDO)
  getBySpecialty: async (especialidadId) => {
    try {
      const response = await axiosInstance.get("/medicos", {
        params: { especialidad_id: especialidadId },
      });
      return response.data?.data || response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Error al obtener doctores por especialidad",
        }
      );
    }
  },

  // Obtener disponibilidad del doctor (CORREGIDO)
  getAvailability: async (doctorId) => {
    try {
      const response = await axiosInstance.get("/disponibilidades", {
        params: { medico_id: doctorId, activa: true },
      });
      return response.data?.data || response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Error al obtener disponibilidad" }
      );
    }
  },

  // Crear disponibilidad del doctor (CORREGIDO)
  createAvailability: async (availabilityData) => {
    try {
      const response = await axiosInstance.post(
        "/disponibilidades",
        availabilityData
      );
      return response.data?.data || response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Error al crear disponibilidad" }
      );
    }
  },
};

export default doctorsService;
