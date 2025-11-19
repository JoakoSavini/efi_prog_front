import { useState, useCallback } from "react";
import PatientsContext from "./PatientsContext";
import patientsService from "../services/patients";
import usersService from "../services/users";

export const PatientsProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPatients = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersService.getAll({ ...params, rol: "paciente" });

      if (!Array.isArray(data)) {
        throw new Error("Formato inesperado en doctores");
      }

      setPatients(data);
      return data;
    } catch (err) {
      const errorMsg = err.message || "Error al cargar pacientes";
      setError(errorMsg);
      console.error("Error en fetchPatients:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPatientById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientsService.getById(id);
      return data;
    } catch (err) {
      const errorMsg = err.message || "Error al cargar paciente";
      setError(errorMsg);
      console.error("Error en getPatientById:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPatient = useCallback(async (patientData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientsService.create(patientData);
      setPatients((prev) => [...prev, data]);
      return data;
    } catch (err) {
      const errorMsg = err.message || "Error al crear paciente";
      setError(errorMsg);
      console.error("Error en createPatient:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePatient = useCallback(async (id, patientData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientsService.update(id, patientData);
      setPatients((prev) => prev.map((pat) => (pat.id === id ? data : pat)));
      return data;
    } catch (err) {
      const errorMsg = err.message || "Error al actualizar paciente";
      setError(errorMsg);
      console.error("Error en updatePatient:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePatient = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await patientsService.delete(id);
      setPatients((prev) => prev.filter((pat) => pat.id !== id));
    } catch (err) {
      const errorMsg = err.message || "Error al eliminar paciente";
      setError(errorMsg);
      console.error("Error en deletePatient:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    patients,
    loading,
    error,
    fetchPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient,
  };

  return (
    <PatientsContext.Provider value={value}>
      {children}
    </PatientsContext.Provider>
  );
};
