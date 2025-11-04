// src/contexts/DoctorsContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';
import doctorsService from '../services/doctors';

const DoctorsContext = createContext();

export const useDoctors = () => {
    const context = useContext(DoctorsContext);
    if (!context) {
        throw new Error('useDoctors debe ser usado dentro de un DoctorsProvider');
    }
    return context;
};

export const DoctorsProvider = ({ children }) => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchDoctors = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await doctorsService.getAll(params);
            setDoctors(data);
            return data;
        } catch (err) {
            setError(err.message || 'Error al cargar doctores');
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
            setError(err.message || 'Error al cargar doctor');
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
            setDoctors(prev => [...prev, data]);
            return data;
        } catch (err) {
            setError(err.message || 'Error al crear doctor');
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
            setDoctors(prev =>
                prev.map(doc => doc.id === id ? data : doc)
            );
            return data;
        } catch (err) {
            setError(err.message || 'Error al actualizar doctor');
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
            setDoctors(prev => prev.filter(doc => doc.id !== id));
        } catch (err) {
            setError(err.message || 'Error al eliminar doctor');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getDoctorsBySpecialty = useCallback(async (specialty) => {
        setLoading(true);
        setError(null);
        try {
            const data = await doctorsService.getBySpecialty(specialty);
            return data;
        } catch (err) {
            setError(err.message || 'Error al buscar doctores por especialidad');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getDoctorAvailability = useCallback(async (doctorId, date) => {
        setLoading(true);
        setError(null);
        try {
            const data = await doctorsService.getAvailability(doctorId, date);
            return data;
        } catch (err) {
            setError(err.message || 'Error al obtener disponibilidad');
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
        getDoctorsBySpecialty,
        getDoctorAvailability
    };

    return (
        <DoctorsContext.Provider value={value}>
            {children}
        </DoctorsContext.Provider>
    );
};

export default DoctorsContext;