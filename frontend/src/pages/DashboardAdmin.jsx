// src/pages/DashboardAdmin.jsx
import { useState, useEffect, useCallback } from "react";
import { useAppointments } from "../contexts/useAppointments";
import { useDoctors } from "../contexts/useDoctors";
import { usePatients } from "../contexts/usePatients";
import Loader from "../components/Loader";

// **********************************************
// PASO 2: Importar los iconos de React Icons
// **********************************************
import {
  FaUser, // Pacientes
  FaUserMd, // Doctores
  FaCalendarAlt, // Citas (Total y Nueva Cita)
  FaHourglassHalf, // Pendientes
  FaCheckCircle, // Completadas
  FaTimesCircle, // Canceladas
  FaPlusSquare, // Acción de agregar (para botones)
} from "react-icons/fa";

const DashboardAdmin = () => {
  const {
    appointments,
    fetchAppointments,
    loading: appointmentsLoading,
  } = useAppointments();
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
      setStats({
        totalPatients: patients.length || 0,
        totalDoctors: doctors.length || 0,
        totalAppointments: appointments.length || 0,
        pendingAppointments:
          appointments.filter((app) => app.status === "pending").length || 0,
        completedAppointments:
          appointments.filter((app) => app.status === "completed").length || 0,
        cancelledAppointments:
          appointments.filter((app) => app.status === "cancelled").length || 0,
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
      icon: FaUser, // Componente de icono
      circleColor: "bg-indigo-100",
      iconColor: "text-indigo-600",
      textColor: "text-indigo-600",
    },
    {
      title: "Total Doctores",
      value: stats.totalDoctors,
      icon: FaUserMd, // Componente de icono
      circleColor: "bg-green-100",
      iconColor: "text-green-600",
      textColor: "text-green-600",
    },
    {
      title: "Total Citas",
      value: stats.totalAppointments,
      icon: FaCalendarAlt, // Componente de icono
      circleColor: "bg-purple-100",
      iconColor: "text-purple-600",
      textColor: "text-purple-600",
    },
    {
      title: "Citas Pendientes",
      value: stats.pendingAppointments,
      icon: FaHourglassHalf, // Componente de icono
      circleColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
      textColor: "text-yellow-600",
    },
    {
      title: "Citas Completadas",
      value: stats.completedAppointments,
      icon: FaCheckCircle, // Componente de icono
      circleColor: "bg-teal-100",
      iconColor: "text-teal-600",
      textColor: "text-teal-600",
    },
    {
      title: "Citas Canceladas",
      value: stats.cancelledAppointments,
      icon: FaTimesCircle, // Componente de icono
      circleColor: "bg-red-100",
      iconColor: "text-red-600",
      textColor: "text-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Panel de Administración
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Vista general y gestión de todos los datos del sistema.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon; // Obtenemos el componente de icono
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transition duration-300 hover:shadow-xl"
              >
                <div className="flex items-start">
                  {/* Usamos el componente de icono importado */}
                  <div
                    className={`flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-full ${stat.circleColor}`}
                  >
                    <IconComponent className={`h-7 w-7 ${stat.iconColor}`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate mt-1">
                        {stat.title}
                      </dt>
                      <dd
                        className={`text-4xl font-extrabold ${stat.textColor} leading-none mt-1`}
                      >
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Appointments (No se necesita cambiar aquí, solo se ajustaron clases) */}
        <div className="bg-white shadow-xl rounded-2xl mb-10 overflow-hidden">
          <div className="px-6 py-5 sm:p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Citas Recientes
            </h2>
            {appointments && appointments.length > 0 ? (
              <div className="overflow-x-auto border border-gray-100 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Paciente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {appointments.slice(0, 5).map((appointment, index) => (
                      <tr
                        key={index}
                        className="hover:bg-blue-50/50 transition duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {appointment.patientName || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {appointment.doctorName || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {appointment.date || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                                                        ${
                                                          appointment.status ===
                                                          "completed"
                                                            ? "bg-green-500 text-white"
                                                            : appointment.status ===
                                                              "pending"
                                                            ? "bg-yellow-400 text-gray-800"
                                                            : "bg-red-500 text-white"
                                                        }`}
                          >
                            {appointment.status || "N/A"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
                No hay citas registradas
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Botón Nuevo Paciente */}
          <button className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300 text-left hover:bg-gray-50">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-full p-3 flex items-center justify-center h-12 w-12">
                <FaPlusSquare className="text-2xl text-white" />{" "}
                {/* Icono de suma */}
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Nuevo Paciente
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Registrar nuevo paciente
                </p>
              </div>
            </div>
          </button>

          {/* Botón Nuevo Doctor */}
          <button className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300 text-left hover:bg-gray-50">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-full p-3 flex items-center justify-center h-12 w-12">
                <FaUserMd className="text-2xl text-white" />{" "}
                {/* Icono de doctor */}
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Nuevo Doctor
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Registrar nuevo doctor
                </p>
              </div>
            </div>
          </button>

          {/* Botón Nueva Cita */}
          <button className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300 text-left hover:bg-gray-50">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-full p-3 flex items-center justify-center h-12 w-12">
                <FaCalendarAlt className="text-2xl text-white" />{" "}
                {/* Icono de calendario */}
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Nueva Cita
                </h3>
                <p className="text-sm text-gray-500 mt-1">Agendar nueva cita</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
