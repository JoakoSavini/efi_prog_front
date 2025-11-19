// src/services/consultorios.js
import axiosInstance from "./api/axiosInstance";

const consultoriosService = {
  // GET /api/consultorios
  getAll: async (params = {}) => {
    try {
      const response = await axiosInstance.get("/consultorios", { params });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Error al obtener consultorios" }
      );
    }
  },
  // ... (puedes añadir create, getById, update, delete si los necesitas)
};

export default consultoriosService;
