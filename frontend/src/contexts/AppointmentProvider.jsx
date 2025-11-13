import React, { useState, useCallback } from "react";
import { AppointmentContext } from "./AppointmentContext"; // Importación nombrada
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
      setAppointments(data);
      return data;
    } catch (err) {
      setError(err.message || "Error al cargar citas");
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
      return data;
    } catch (err) {
      setError(err.message || "Error al cargar cita");
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
      setError(err.message || "Error al crear cita");
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
      setError(err.message || "Error al actualizar cita");
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
      setError(err.message || "Error al eliminar cita");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelAppointment = useCallback(async (id, reason) => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentsService.cancel(id, reason);
      setAppointments((prev) =>
        prev.map((app) => (app.id === id ? data : app))
      );
      return data;
    } catch (err) {
      setError(err.message || "Error al cancelar cita");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmAppointment = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentsService.confirm(id);
      setAppointments((prev) =>
        prev.map((app) => (app.id === id ? data : app))
      );
      return data;
    } catch (err) {
      setError(err.message || "Error al confirmar cita");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeAppointment = useCallback(async (id, notes) => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentsService.complete(id, notes);
      setAppointments((prev) =>
        prev.map((app) => (app.id === id ? data : app))
      );
      return data;
    } catch (err) {
      setError(err.message || "Error al completar cita");
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
