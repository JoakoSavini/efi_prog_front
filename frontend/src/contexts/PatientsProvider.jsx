// src/contexts/PatientsProvider.jsx
import { useState, useCallback } from 'react';
import PatientsContext from './PatientsContext';
import patientsService from '../services/patients';

export const PatientsProvider = ({ children }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPatients = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await patientsService.getAll(params);
            setPatients(data);
            return data;
        } catch (err) {
            setError(err.message || 'Error al cargar pacientes');
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
            setError(err.message || 'Error al cargar paciente');
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
            setPatients(prev => [...prev, data]);
            return data;
        } catch (err) {
            setError(err.message || 'Error al crear paciente');
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
            setPatients(prev =>
                prev.map(pat => pat.id === id ? data : pat)
            );
            return data;
        } catch (err) {
            setError(err.message || 'Error al actualizar paciente');
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
            setPatients(prev => prev.filter(pat => pat.id !== id));
        } catch (err) {
            setError(err.message || 'Error al eliminar paciente');
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
            return data;
        } catch (err) {
            setError(err.message || 'Error al buscar pacientes');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getPatientMedicalHistory = useCallback(async (patientId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await patientsService.getMedicalHistory(patientId);
            return data;
        } catch (err) {
            setError(err.message || 'Error al obtener historial médico');
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
        searchPatients,
        getPatientMedicalHistory
    };

    return (
        <PatientsContext.Provider value={value}>
            {children}
        </PatientsContext.Provider>
    );
};