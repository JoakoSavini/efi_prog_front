// src/routes/PublicRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

const PublicRoute = ({ restricted = false }) => {
    const { isAuthenticated, user } = useAuth();

    // Si la ruta es restringida (como login/register) y el usuario ya está autenticado
    // redirigir al dashboard correspondiente según su rol
    if (restricted && isAuthenticated) {
        switch (user?.role) {
            case 'admin':
                return <Navigate to="/dashboard/admin" replace />;
            case 'doctor':
                return <Navigate to="/dashboard/doctor" replace />;
            case 'patient':
                return <Navigate to="/dashboard/patient" replace />;
            default:
                return <Navigate to="/" replace />;
        }
    }

    return <Outlet />;
};

export default PublicRoute;