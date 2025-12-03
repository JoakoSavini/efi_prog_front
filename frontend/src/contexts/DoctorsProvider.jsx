import { useState, useCallback } from "react";
import DoctorsContext from "./DoctorsContext";
import doctorsService from "../services/doctors";
import usersService from "../services/users";
import api from "../services/api/axiosInstance";

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
      // Create via the auth register endpoint so the backend applies the same
      // registration logic (password hashing, defaults) as public register.
      const payload = {
        nombre: doctorData.nombre,
        apellido: doctorData.apellido,
        correo: doctorData.email || doctorData.correo,
        contraseña: doctorData.contraseña || doctorData.password,
        rol: doctorData.rol || "médico",
        telefono: doctorData.telefono,
        direccion: doctorData.direccion,
        // doctor-specific
        matricula: doctorData.matricula,
        especialidad_id: doctorData.especialidad_id,
      };

      const res = await api.post("/auth/register", payload);
      const created = res.data?.data?.user || res.data?.data || res.data;
      // keep provider list in sync
      setDoctors((prev) => [...prev, created]);
      return created;
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
      // update via usersService to keep records consistent
      const data = await usersService.update(id, { ...doctorData, rol: doctorData.rol || 'médico' });
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
      // delete via usersService (doctor is a user)
      await usersService.delete(id);
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
