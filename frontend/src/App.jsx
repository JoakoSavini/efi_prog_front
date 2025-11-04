// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppointmentProvider } from './contexts/AppointmentContext';
import { DoctorsProvider } from './contexts/DoctorsContext';
import { PatientsProvider } from './contexts/PatientsContext';

// Routes
import PrivateRoute from './routes/PrivateRoute';
import PublicRoute from './routes/PublicRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

// Dashboards
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardDoctor from './pages/DashboardDoctor';
import DashboardPatient from './pages/DashboardPatient';

// Components
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppointmentProvider>
          <DoctorsProvider>
            <PatientsProvider>
              <div className="min-h-screen bg-gray-50">
                <Routes>
                  {/* Rutas públicas */}
                  <Route element={<PublicRoute restricted={true} />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                  </Route>

                  {/* Rutas privadas - Admin */}
                  <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                    <Route
                      path="/dashboard/admin"
                      element={
                        <>
                          <Navbar />
                          <DashboardAdmin />
                        </>
                      }
                    />
                  </Route>

                  {/* Rutas privadas - Doctor */}
                  <Route element={<PrivateRoute allowedRoles={['doctor']} />}>
                    <Route
                      path="/dashboard/doctor"
                      element={
                        <>
                          <Navbar />
                          <DashboardDoctor />
                        </>
                      }
                    />
                  </Route>

                  {/* Rutas privadas - Patient */}
                  <Route element={<PrivateRoute allowedRoles={['patient']} />}>
                    <Route
                      path="/dashboard/patient"
                      element={
                        <>
                          <Navbar />
                          <DashboardPatient />
                        </>
                      }
                    />
                  </Route>

                  {/* Rutas generales privadas */}
                  <Route element={<PrivateRoute />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route
                      path="/dashboard"
                      element={<Navigate to="/dashboard/patient" replace />}
                    />
                  </Route>

                  {/* Ruta 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </PatientsProvider>
          </DoctorsProvider>
        </AppointmentProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;