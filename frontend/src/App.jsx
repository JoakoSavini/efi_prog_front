// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider";
import { AppointmentProvider } from "./contexts/AppointmentProvider";
import { DoctorsProvider } from "./contexts/DoctorsProvider";
import { PatientsProvider } from "./contexts/PatientsProvider";

// Routes
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

// Dashboards
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardDoctor from "./pages/DashboardDoctor";
import DashboardPatient from "./pages/DashboardPatient";

// Components
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Podemos definir estas rutas para probarlas hasta que funcione la logica del login */}
            <Route path="/dashboard-doctor" element={<DashboardDoctor />} />
            <Route path="/dashboard-patient" element={<DashboardPatient />} />
            <Route path="/dashboard-admin" element={<DashboardAdmin />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
