import { useState, useCallback } from "react";
import AppointmentContext from "./AppointmentContext";
import appointmentsService from "../services/appointments";

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAppointments = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentsService.getAll(params);
      console.log("Datos recibidos de la API de citas:", data);

      if (!Array.isArray(data)) {
        throw new Error("Formato inesperado en la API");
      }

      setAppointments(data);
      return data;
    } catch (err) {
      const errorMsg = err.message || "Error al cargar citas";
      setError(errorMsg);
      console.error("Error en fetchAppointments:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAppointmentById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentsService.getById(id);

      if (!data || typeof data !== "object") {
        throw new Error("Formato inesperado de la cita");
      }

      return data;
    } catch (err) {
      const errorMsg = err.message || "Error al cargar cita";
      setError(errorMsg);
      console.error("Error en getAppointmentById:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createAppointment = useCallback(async (appointmentData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentsService.create(appointmentData);
      setAppointments((prev) => [...prev, data]);
      return data;
    } catch (err) {
      const errorMsg = err.message || "Error al crear cita";
      setError(errorMsg);
      console.error("Error en createAppointment:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAppointment = useCallback(async (id, appointmentData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentsService.update(id, appointmentData);
      setAppointments((prev) =>
        prev.map((app) => (app.id === id ? data : app))
      );
      return data;
    } catch (err) {
      const errorMsg = err.message || "Error al actualizar cita";
      setError(errorMsg);
      console.error("Error en updateAppointment:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAppointment = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await appointmentsService.delete(id);
      setAppointments((prev) => prev.filter((app) => app.id !== id));
    } catch (err) {
      const errorMsg = err.message || "Error al eliminar cita";
      setError(errorMsg);
      console.error("Error en deleteAppointment:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelAppointment = useCallback(async (id, motivo_cancelacion) => {
    setLoading(true);
    setError(null);
    try {
      const response = await appointmentsService.cancel(id, motivo_cancelacion);
      const data = response.cita || response;

      setAppointments((prev) =>
        prev.map((app) => (app.id === id ? data : app))
      );

      return data;
    } catch (err) {
      const errorMsg = err.message || "Error al cancelar cita";
      setError(errorMsg);
      console.error("Error en cancelAppointment:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmAppointment = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await appointmentsService.confirm(id);
      const data = response.cita || response;

      setAppointments((prev) =>
        prev.map((app) => (app.id === id ? data : app))
      );

      return data;
    } catch (err) {
      const errorMsg = err.message || "Error al confirmar cita";
      setError(errorMsg);
      console.error("Error en confirmAppointment:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeAppointment = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await appointmentsService.complete(id);
      const data = response.cita || response;

      setAppointments((prev) =>
        prev.map((app) => (app.id === id ? data : app))
      );

      return data;
    } catch (err) {
      const errorMsg = err.message || "Error al completar cita";
      setError(errorMsg);
      console.error("Error en completeAppointment:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    appointments,
    loading,
    error,
    fetchAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    cancelAppointment,
    confirmAppointment,
    completeAppointment,
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};
