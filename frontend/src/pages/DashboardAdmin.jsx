// src/pages/DashboardAdmin.jsx
import { useState, useEffect, useCallback } from "react";
// 1. Importar useNavigate
import { useAppointments } from "../contexts/useAppointments";
import { useDoctors } from "../contexts/useDoctors";
import { usePatients } from "../contexts/usePatients";
import Loader from "../components/Loader";

import CreatePatientModal from "../components/modals/CreatePatientModal";
import CreateDoctorModal from "../components/modals/CreateDoctorModal";
import CreateAppointmentModal from "../components/modals/CreateAppointmentModal";

const DashboardAdmin = () => {
  // 2. Inicializar useNavigate

  // 3. Estados para controlar la visibilidad de los Modales
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  // Funciones para abrir/cerrar los modales
  const handleOpenPatientModal = () => setIsPatientModalOpen(true);
  const handleClosePatientModal = () => setIsPatientModalOpen(false);

  const handleOpenDoctorModal = () => setIsDoctorModalOpen(true);
  const handleCloseDoctorModal = () => setIsDoctorModalOpen(false);

  const handleOpenAppointmentModal = () => setIsAppointmentModalOpen(true);
  const handleCloseAppointmentModal = () => setIsAppointmentModalOpen(false);

  // (Resto de tu código, no necesita cambios)
  const {
    appointments,
    fetchAppointments,
    loading: appointmentsLoading,
  } = useAppointments();
  // ... (otros hooks y estados de stats/loadData/useEffect) ...
  const { doctors, fetchDoctors, loading: doctorsLoading } = useDoctors();
  const { patients, fetchPatients, loading: patientsLoading } = usePatients();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
  });
  const loadData = useCallback(async () => {
    try {
      await Promise.all([fetchAppointments(), fetchDoctors(), fetchPatients()]);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  }, [fetchAppointments, fetchDoctors, fetchPatients]);
  useEffect(() => {
    loadData();
  }, [loadData]);
  useEffect(() => {
    if (appointments && doctors && patients) {
      // 🐛 DEBUG: Ver qué datos están llegando
      console.log("📊 Datos recibidos:");
      console.log("Appointments:", appointments);
      console.log("Doctors:", doctors);
      console.log("Patients:", patients);
      // 🐛 DEBUG: Ver los estados de las citas
      if (appointments.length > 0) {
        console.log("📋 Estados de citas encontrados:");
        const uniqueStatuses = [
          ...new Set(appointments.map((app) => app.status)),
        ];
        console.log(uniqueStatuses);
      }
      setStats({
        totalPatients: patients.length || 0,
        totalDoctors: doctors.length || 0,
        totalAppointments: appointments.length || 0,
        // ✅ CORRECCIÓN: Verificar ambos formatos (normalizado y original)
        pendingAppointments:
          appointments.filter(
            (app) =>
              app.status === "programada" ||
              app.status === "pendiente" ||
              app.estado === "programada" ||
              app.estado === "pendiente"
          ).length || 0,
        completedAppointments:
          appointments.filter(
            (app) => app.status === "completada" || app.estado === "completada"
          ).length || 0,
        cancelledAppointments:
          appointments.filter(
            (app) => app.status === "cancelada" || app.estado === "cancelada"
          ).length || 0,
      });
    }
  }, [appointments, doctors, patients]);
  if (appointmentsLoading || doctorsLoading || patientsLoading) {
    return <Loader fullScreen />;
  }
  const statCards = [
    {
      title: "Total Pacientes",
      value: stats.totalPatients,
      icon: "👥",
      color: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      title: "Total Doctores",
      value: stats.totalDoctors,
      icon: "⚕️",
      color: "bg-green-500",
      textColor: "text-green-600",
    },
    {
      title: "Total Citas",
      value: stats.totalAppointments,
      icon: "📅",
      color: "bg-purple-500",
      textColor: "text-purple-600",
    },
    {
      title: "Citas Pendientes",
      value: stats.pendingAppointments,
      icon: "⏳",
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
    },
    {
      title: "Citas Completadas",
      value: stats.completedAppointments,
      icon: "✅",
      color: "bg-teal-500",
      textColor: "text-teal-600",
    },
    {
      title: "Citas Canceladas",
      value: stats.cancelledAppointments,
      icon: "❌",
      color: "bg-red-500",
      textColor: "text-red-600",
    },
  ];
  // Función helper para obtener el estado normalizado
  const getStatusBadgeClass = (appointment) => {
    const status = appointment.status || appointment.estado;
    if (status === "completada") {
      return "bg-green-100 text-green-800";
    } else if (
      status === "programada" ||
      status === "pendiente" ||
      status === "confirmada"
    ) {
      return "bg-yellow-100 text-yellow-800";
    } else if (status === "cancelada") {
      return "bg-red-100 text-red-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ... (Tus componentes de cabecera y Stats Grid) ... */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Panel de Administración
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Gestión completa del sistema de citas médicas
        </p>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.title}
                    </dt>
                    <dd className={`text-3xl font-semibold ${stat.textColor}`}>
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Recent Appointments */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Citas Recientes
          </h2>
          {appointments && appointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.slice(0, 5).map((appointment, index) => (
                    <tr key={appointment.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {appointment.patientName || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.doctorName || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.date
                          ? new Date(appointment.date).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                            appointment
                          )}`}
                        >
                          {appointment.status || appointment.estado || "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No hay citas registradas
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions - Botones con Funcionalidad */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Botón Nuevo Paciente */}
        <button
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 text-left"
          onClick={handleOpenPatientModal} // 👈 Nuevo handler
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
              <span className="text-2xl">➕</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                Nuevo Paciente
              </h3>
              <p className="text-sm text-gray-500">Registrar nuevo paciente</p>
            </div>
          </div>
        </button>

        {/* Botón Nuevo Doctor */}
        <button
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 text-left"
          onClick={handleOpenDoctorModal} // 👈 Nuevo handler
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <span className="text-2xl">👨‍⚕️</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                Nuevo Doctor
              </h3>
              <p className="text-sm text-gray-500">Registrar nuevo doctor</p>
            </div>
          </div>
        </button>

        {/* Botón Nueva Cita */}
        <button
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 text-left"
          onClick={handleOpenAppointmentModal} // 👈 Nuevo handler
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Nueva Cita</h3>
              <p className="text-sm text-gray-500">Agendar nueva cita</p>
            </div>
          </div>
        </button>
      </div>

      {/* 4. Implementación de los Modales (Visibilidad controlada por estado) */}
      {isPatientModalOpen && (
        <CreatePatientModal
          isOpen={isPatientModalOpen}
          onClose={handleClosePatientModal}
          // Aquí puedes pasar `fetchPatients` si quieres actualizar la lista al cerrar
          onSuccess={fetchPatients}
        />
      )}

      {isDoctorModalOpen && (
        <CreateDoctorModal
          isOpen={isDoctorModalOpen}
          onClose={handleCloseDoctorModal}
          onSuccess={fetchDoctors}
        />
      )}

      {isAppointmentModalOpen && (
        <CreateAppointmentModal
          isOpen={isAppointmentModalOpen}
          onClose={handleCloseAppointmentModal}
          onSuccess={fetchAppointments}
        />
      )}
    </div>
  );
};

export default DashboardAdmin;
