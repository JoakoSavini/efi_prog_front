// src/contexts/usePatients.js
import { useContext } from 'react';
import PatientsContext from './PatientsContext';

export const usePatients = () => {
    const context = useContext(PatientsContext);
    if (!context) {
        throw new Error('usePatients debe ser usado dentro de un PatientsProvider');
    }
    return context;
};