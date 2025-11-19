import { useState, useCallback } from "react";
import DoctorsContext from "./DoctorsContext";
import doctorsService from "../services/doctors";
import usersService from "../services/users";

export const DoctorsProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDoctors = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersService.getAll({ ...params, rol: "médico" });

      if (!Array.isArray(data)) {
        throw new Error("Formato inesperado en doctores");
      }

      setDoctors(data);
      return data;
    } catch (err) {
      const errorMsg = err.message || "Error al cargar doctores";
      setError(errorMsg);
      console.error("Error en fetchDoctors:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDoctorById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await doctorsService.getById(id);
      return data;
    } catch (err) {
      const errorMsg = err.message || "Error al cargar doctor";
      setError(errorMsg);
      console.error("Error en getDoctorById:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createDoctor = useCallback(async (doctorData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await doctorsService.create(doctorData);
      setDoctors((prev) => [...prev, data]);
      return data;
    } catch (err) {
      const errorMsg = err.message || "Error al crear doctor";
      setError(errorMsg);
      console.error("Error en createDoctor:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDoctor = useCallback(async (id, doctorData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await doctorsService.update(id, doctorData);
      setDoctors((prev) => prev.map((doc) => (doc.id === id ? data : doc)));
      return data;
    } catch (err) {
      const errorMsg = err.message || "Error al actualizar doctor";
      setError(errorMsg);
      console.error("Error en updateDoctor:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDoctor = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await doctorsService.delete(id);
      setDoctors((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      const errorMsg = err.message || "Error al eliminar doctor";
      setError(errorMsg);
      console.error("Error en deleteDoctor:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    doctors,
    loading,
    error,
    fetchDoctors,
    getDoctorById,
    createDoctor,
    updateDoctor,
    deleteDoctor,
  };

  return (
    <DoctorsContext.Provider value={value}>{children}</DoctorsContext.Provider>
  );
};
