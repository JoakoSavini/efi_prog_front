// src/routes/PrivateRoute.jsx

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loader from "../components/Loader"; // 🚨 ¡IMPORTAR EL LOADER!

// Recibe requiredRole como prop, que se define en App.jsx
const PrivateRoute = ({ requiredRole }) => {
  const { isAuthenticated, user, loading, hasRole } = useAuth();

  // 1. Manejar el estado de carga
  if (loading) {
    return <Loader fullScreen />;
  }

  // 2. Manejar la autenticación
  if (!isAuthenticated) {
    // Redirigir a Login si no está autenticado
    return <Navigate to="/login" replace />;
  }

  // 3. Manejar la autorización de rol
  if (requiredRole && !hasRole(requiredRole)) {
    // Redirigir a la raíz o a una página de "Acceso Denegado"
    console.warn(
      `Acceso denegado: Usuario con rol '${user?.rol}' intentó acceder a ruta '${requiredRole}'`
    );
    // Redirigir al dashboard principal del usuario o a /
    return <Navigate to="/" replace />;
  }

  // Si está autenticado y tiene el rol correcto, renderizar la ruta hija
  return <Outlet />;
};

export default PrivateRoute;
