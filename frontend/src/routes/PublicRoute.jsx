// src/routes/PublicRoute.jsx

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Asumiendo que usas este hook
import Loader from "../components/Loader"; // 🚨 ¡IMPORTAR EL LOADER!

const PublicRoute = () => {
  const { isAuthenticated, user, loading } = useAuth();

  // 🚨 Mostrar el Loader mientras el contexto está cargando
  if (loading) {
    return <Loader fullScreen />; // Asume que fullScreen es una prop válida
  }

  // Si está autenticado, redirigir al dashboard según el rol
  if (isAuthenticated) {
    const role = user?.rol; // Roles: 'admin', 'médico', 'paciente'

    if (role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (role === "médico") return <Navigate to="/medico/dashboard" replace />;
    if (role === "paciente")
      return <Navigate to="/paciente/dashboard" replace />;

    // Fallback si el rol no es válido
    return <Navigate to="/" replace />;
  }

  // Si no está autenticado, permitir el acceso a la ruta pública
  return <Outlet />;
};

export default PublicRoute;
