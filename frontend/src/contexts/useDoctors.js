// src/contexts/useDoctors.js
import { useContext } from 'react';
import DoctorsContext from './DoctorsContext';

export const useDoctors = () => {
    const context = useContext(DoctorsContext);
    if (!context) {
        throw new Error('useDoctors debe ser usado dentro de un DoctorsProvider');
    }
    return context;
};