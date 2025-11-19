import axiosInstance from "./api/axiosInstance";

const usersService = {
  // Obtener todos los usuarios
  getAll: async (params = {}) => {
    try {
      const response = await axiosInstance.get("/usuarios", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener usuarios" };
    }
  },

  // Obtener un usuario por ID
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al obtener usuario" };
    }
  },

  // Crear nuevo usuario
  create: async (userData) => {
    try {
      const response = await axiosInstance.post("/usuarios", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al crear usuario" };
    }
  },

  // Actualizar usuario
  update: async (id, userData) => {
    try {
      const response = await axiosInstance.put(`/usuarios/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al actualizar usuario" };
    }
  },

  // Eliminar usuario
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Error al eliminar usuario" };
    }
  },
};

export default usersService;
