import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider";
import { useAuth } from "./contexts/useAuth";

import { AppointmentProvider } from "./contexts/AppointmentProvider";
import { DoctorsProvider } from "./contexts/DoctorsProvider";
import { PatientsProvider } from "./contexts/PatientsProvider";

import PrivateRoute from "./routes/PrivateRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotFound from "./pages/NotFound";
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import DashboardDoctor from "./pages/doctor/DashboardDoctor";
import DashboardPatient from "./pages/paciente/DashboardPatient";
import TableViewPatient from "./pages/paciente/TableViewPatient";

const ROLES = {
  Admin: "admin",
  Doctor: "doctor",
  Patient: "patient",
};

const RoleBasedRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-600">
        Cargando perfil...
      </div>
    );
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  const role = user.role;

  switch (role) {
    case ROLES.Admin:
      return <Navigate to="/dashboard/admin" replace />;
    case ROLES.Doctor:
      return <Navigate to="/dashboard/doctor" replace />;
    case ROLES.Patient:
      return <Navigate to="/dashboard/patient" replace />;
    default:
      console.error("Rol de usuario desconocido o no manejado:", user.role);
      return <Navigate to="/unauthorized" replace />;
  }
};

const App = () => {
  return (
    <Router>
      {/* 1. AuthProvider (El más externo para manejar la sesión global) */}
      <AuthProvider>
        {/* 2. Providers de Datos (Envuelven las rutas que los necesitan) */}
        <AppointmentProvider>
          <DoctorsProvider>
            <PatientsProvider>
              <div className="font-sans antialiased text-gray-800">
                <Routes>
                  {/* Rutas Públicas */}
                  <Route path="/" element={<Navigate to="/login" />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/unauthorized"
                    element={
                      <div className="text-red-500 font-bold p-8 text-center text-3xl">
                        ACCESO DENEGADO
                      </div>
                    }
                  />

                  {/* Rutas Protegidas (DashboardAdmin ya tiene acceso a todos los Providers) */}
                  <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute
                        allowedRoles={[
                          ROLES.Admin,
                          ROLES.Doctor,
                          ROLES.Patient,
                        ]}
                      />
                    }
                  >
                    <Route index element={<RoleBasedRedirect />} />
                  </Route>

                  <Route
                    path="/dashboard/admin"
                    element={<PrivateRoute allowedRoles={[ROLES.Admin]} />}
                  >
                    <Route index element={<DashboardAdmin />} />
                  </Route>

                  <Route
                    path="/dashboard/doctor"
                    element={<PrivateRoute allowedRoles={[ROLES.Doctor]} />}
                  >
                    <Route index element={<DashboardDoctor />} />
                  </Route>

                  <Route
                    path="/dashboard/patient"
                    element={<PrivateRoute allowedRoles={[ROLES.Patient]} />}
                  >
                    <Route index element={<DashboardPatient />} />
                  </Route>

                  <Route
                    path="/dashboard/admin/patient/list"
                    element={<PrivateRoute allowedRoles={[ROLES.Admin]} />}

                  >
                    <Route index element={<TableViewPatient />}/>

                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </PatientsProvider>
          </DoctorsProvider>
        </AppointmentProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
