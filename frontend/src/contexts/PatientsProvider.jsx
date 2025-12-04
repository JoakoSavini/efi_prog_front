import { useState, useCallback } from "react";
import PatientsContext from "./PatientsContext";
import patientsService from "../services/patients";
import authService from "../services/auth";

export const PatientsProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPatients = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientsService.getAll(params);
      
      // La respuesta del backend puede ser un array directamente
      const patientsArray = Array.isArray(data) ? data : [];
      
      setPatients(patientsArray);
      return patientsArray;
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
      const authPayload = {
        nombre: patientData.nombre,
        apellido: patientData.apellido,
        correo: patientData.email || patientData.correo,
        contraseña: patientData.contraseña,
        rol: "paciente",
        telefono: patientData.telefono,
        dni: patientData.dni,
      };

      if (patientData.direccion) authPayload.direccion = patientData.direccion;

      const registerResponse = await authService.register(authPayload);
      console.log("Usuario creado:", registerResponse);
      
      const userId = registerResponse?.user?.id;
      
      if (!userId) {
        throw new Error("No se pudo obtener el ID del usuario creado");
      }

      const patientPayload = {
        usuario_id: userId,
        telefono: patientData.telefono,
        dni: patientData.dni,
      };

      if (patientData.direccion) patientPayload.direccion = patientData.direccion;
      if (patientData.fecha_nacimiento) patientPayload.fecha_nacimiento = patientData.fecha_nacimiento;
      if (patientData.numero_historia_clinica) patientPayload.numero_historia_clinica = patientData.numero_historia_clinica;
      if (patientData.genero) patientPayload.genero = patientData.genero;
      if (patientData.grupo_sanguineo) patientPayload.grupo_sanguineo = patientData.grupo_sanguineo;
      if (patientData.alergias) patientPayload.alergias = patientData.alergias;
      if (patientData.antecedentes) patientPayload.antecedentes = patientData.antecedentes;

      console.log("Payload para crear paciente:", patientPayload);
      const pacientCreated = await patientsService.create(patientPayload);
      console.log("Paciente creado exitosamente:", pacientCreated);
      
      setPatients((prev) => [...prev, pacientCreated]);
      return pacientCreated;
    } catch (err) {
      const errorMsg = err.message || err || "Error al crear paciente";
      setError(errorMsg);
      console.error("Error completo en createPatient:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePatient = useCallback(async (id, patientData) => {
    setLoading(true);
    setError(null);
    try {
      // Payload que coincida con el modelo Paciente del backend
      const payload = {
        numero_historia_clinica: patientData.numero_historia_clinica,
        telefono: patientData.telefono,
        direccion: patientData.direccion,
        genero: patientData.genero,
        grupo_sanguineo: patientData.grupo_sanguineo,
        alergias: patientData.alergias,
        antecedentes: patientData.antecedentes
      };

      const updated = await patientsService.update(id, payload);
      
      // Actualizar lista local
      setPatients((prev) => prev.map((pat) => (pat.id === id ? updated : pat)));
      return updated;
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
      // El delete del backend hace hard delete pero valida relaciones
      await patientsService.delete(id);
      
      // Actualizar lista local - remover el paciente
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

  // Funciones adicionales para funcionalidad específica de pacientes
  const getPatientByHistoriaClinica = useCallback(async (numeroHistoria) => {
    try {
      return await patientsService.getByHistoriaClinica(numeroHistoria);
    } catch (err) {
      console.error("Error al buscar paciente por historia clínica:", err);
      throw err;
    }
  }, []);

  const getPatientCitas = useCallback(async (patientId, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientsService.getCitas(patientId, params);
      return data;
    } catch (err) {
      const errorMsg = err.message || "Error al cargar citas del paciente";
      setError(errorMsg);
      console.error("Error en getPatientCitas:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchPatients = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientsService.search(query);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      const errorMsg = err.message || "Error al buscar pacientes";
      setError(errorMsg);
      console.error("Error en searchPatients:", err);
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
    getPatientByHistoriaClinica,
    getPatientCitas,
    searchPatients,
  };

  return (
    <PatientsContext.Provider value={value}>
      {children}
    </PatientsContext.Provider>
  );
};
