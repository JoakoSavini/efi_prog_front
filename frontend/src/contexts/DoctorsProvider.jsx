import { useState, useCallback } from "react";
import DoctorsContext from "./DoctorsContext";
import doctorsService from "../services/doctors";

export const DoctorsProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDoctors = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Siempre filtrar por estado activo
      const data = await doctorsService.getAll({ ...params, estado: true });
      
      // La respuesta del backend puede ser un array directamente
      const doctorsArray = Array.isArray(data) ? data : [];
      
      setDoctors(doctorsArray);
      return doctorsArray;
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
      // Payload que coincida con el modelo Médico del backend
      const payload = {
        nombre: doctorData.nombre,
        apellido: doctorData.apellido,
        email: doctorData.email,
        telefono: doctorData.telefono,
        matricula: doctorData.matricula,
        especialidad_id: parseInt(doctorData.especialidad_id)
      };

      const created = await doctorsService.create(payload);
      
      // Actualizar lista local
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
      // Payload que coincida con el modelo Médico del backend
      const payload = {
        nombre: doctorData.nombre,
        apellido: doctorData.apellido,
        email: doctorData.email,
        telefono: doctorData.telefono,
        matricula: doctorData.matricula,
        id_especialidad: parseInt(doctorData.especialidad_id || doctorData.id_especialidad),
        horario_inicio: doctorData.horario_inicio,
        horario_fin: doctorData.horario_fin,
        dias_trabajo: doctorData.dias_trabajo,
        estado: doctorData.estado !== undefined ? doctorData.estado : true
      };

      const updated = await doctorsService.update(id, payload);
      
      // Actualizar lista local
      setDoctors((prev) => prev.map((doc) => (doc.id === id ? updated : doc)));
      return updated;
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
    console.log("Deleting doctor with id:", id);
    try {
      // El delete del backend hace soft delete (estado: false)
      await doctorsService.delete(id);
      
      // Actualizar lista local - remover el doctor
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

  // Funciones adicionales para trabajar con especialidades
  const getSpecialties = useCallback(async () => {
    try {
      return await doctorsService.getSpecialties();
    } catch (err) {
      console.error("Error al cargar especialidades:", err);
      throw err;
    }
  }, []);

  const getDoctorsBySpecialty = useCallback(async (especialidadId, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Siempre filtrar por estado activo
      const data = await doctorsService.getBySpecialty(especialidadId, { ...params, estado: true });
      return Array.isArray(data) ? data : [];
    } catch (err) {
      const errorMsg = err.message || "Error al cargar doctores por especialidad";
      setError(errorMsg);
      console.error("Error en getDoctorsBySpecialty:", err);
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
    getSpecialties,
    getDoctorsBySpecialty,
  };

  return (
    <DoctorsContext.Provider value={value}>{children}</DoctorsContext.Provider>
  );
};
