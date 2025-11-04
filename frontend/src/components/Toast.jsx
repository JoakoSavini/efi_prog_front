// src/components/Toast.jsx
import { useEffect } from 'react';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose && onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const typeStyles = {
        success: 'bg-green-50 text-green-800 border-green-400',
        error: 'bg-red-50 text-red-800 border-red-400',
        warning: 'bg-yellow-50 text-yellow-800 border-yellow-400',
        info: 'bg-blue-50 text-blue-800 border-blue-400'
    };

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    return (
        <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg border-l-4 shadow-lg ${typeStyles[type]} animate-slide-in`}>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <span className="text-xl">{icons[type]}</span>
                </div>
                <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">{message}</p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="ml-4 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                        <span className="sr-only">Cerrar</span>
                        <span className="text-xl">×</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default Toast;