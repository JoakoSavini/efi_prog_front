// src/pages/DashboardAdmin.jsx
import { useState, useEffect, useCallback } from "react";
// 1. Importar useNavigate
import { useAppointments } from "../../contexts/useAppointments";
import { useDoctors } from "../../contexts/useDoctors";
import { usePatients } from "../../contexts/usePatients";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";

import CreatePatientModal from "../../components/modals/CreatePatientModal";
import CreateDoctorModal from "../../components/modals/CreateDoctorModal";
import CreateAppointmentModal from "../../components/modals/CreateAppointmentModal";
import EditAppointmentModal from "../../components/modals/EditAppointmentModal";
import EditDoctorModal from "../../components/modals/EditDoctorModal";
import EditPatientModal from "../../components/modals/EditPatientModal";

const DashboardAdmin = () => {
  // 2. Inicializar useNavigate

  // 3. Estados para controlar la visibilidad de los Modales
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  // Estados para edición
  const [isEditAppointmentOpen, setIsEditAppointmentOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [isEditDoctorOpen, setIsEditDoctorOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [isEditPatientOpen, setIsEditPatientOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  // Estado para popup de eliminar/cancelar cita
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

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
    deleteAppointment,
    updateAppointment,
    loading: appointmentsLoading,
  } = useAppointments();
  // ... (otros hooks y estados de stats/loadData/useEffect) ...
  const { doctors, fetchDoctors, deleteDoctor, loading: doctorsLoading } = useDoctors();
  const { patients, fetchPatients, deletePatient, loading: patientsLoading } = usePatients();
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
        pendingAppointments:
          appointments.filter(
            (app) =>
              app.estado === "programada" ||
              app.estado === "pendiente"
          ).length || 0,
        completedAppointments:
          appointments.filter(
            (app) => app.estado === "completada"
          ).length || 0,
        cancelledAppointments:
          appointments.filter(
            (app) => app.estado === "cancelada"
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
      url: "/dashboard/admin/patient/list",
    },
    {
      title: "Total Doctores",
      value: stats.totalDoctors,
      icon: "⚕️",
      color: "bg-green-500",
      textColor: "text-green-600",
      url: "/dashboard/admin/doctor/list",
    },
    {
      title: "Total Citas",
      value: stats.totalAppointments,
      icon: "📅",
      color: "bg-purple-500",
      textColor: "text-purple-600",
      url: "/dashboard/admin/appointments/list",
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
    const status = appointment.estado;
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

  // Función para obtener el nombre del paciente desde el array de pacientes
  const getPatientName = (appointment) => {
    if (appointment.id_paciente && patients.length > 0) {
      const patient = patients.find((p) => p.id === appointment.id_paciente);
      if (patient) {
        return `${patient.nombre || patient.usuario?.nombre || ""} ${patient.apellido || patient.usuario?.apellido || ""}`.trim();
      }
    }
    return "N/A";
  };

  // Función para obtener el nombre del doctor desde el array de doctores
  const getDoctorName = (appointment) => {
    if (appointment.id_medico && doctors.length > 0) {
      const doctor = doctors.find((d) => d.id === appointment.id_medico);
      if (doctor) {
        return `${doctor.nombre || doctor.usuario?.nombre || ""} ${doctor.apellido || doctor.usuario?.apellido || ""}`.trim();
      }
    }
    return "N/A";
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
                <div className={`shrink-0 ${stat.color} rounded-md p-3`}>
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
                  {stat.url && (
                    <div className="mt-2">
                      <Link to={stat.url} className="text-sm text-blue-500 hover:underline">Ver todos</Link>
                    </div>
                    )}
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
                  {appointments.slice(0, 5).map((appointment, index) => {
                    return (
                      <tr key={appointment.id || index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {getPatientName(appointment)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getDoctorName(appointment)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {appointment.fecha
                            ? new Date(appointment.fecha).toLocaleDateString("es-ES")
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                              appointment
                            )}`}
                          >
                            {appointment.estado || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center space-x-2 justify-end">
                            <button
                              type="button"
                              onClick={async () => {
                                setEditingAppointment(appointment);
                                setIsEditAppointmentOpen(true);
                              }}
                              className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAppointmentToDelete(appointment);
                              }}
                              className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
          type="button"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 text-left"
          onClick={handleOpenPatientModal} // 👈 Nuevo handler
        >
          <div className="flex items-center">
            <div className="shrink-0 bg-indigo-500 rounded-md p-3">
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
          type="button"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 text-left"
          onClick={handleOpenDoctorModal} // 👈 Nuevo handler
        >
          <div className="flex items-center">
            <div className="shrink-0 bg-green-500 rounded-md p-3">
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
          type="button"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 text-left"
          onClick={handleOpenAppointmentModal} // 👈 Nuevo handler
        >
          <div className="flex items-center">
            <div className="shrink-0 bg-purple-500 rounded-md p-3">
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

      {isEditAppointmentOpen && editingAppointment && (
        <EditAppointmentModal
          isOpen={isEditAppointmentOpen}
          onClose={() => { setIsEditAppointmentOpen(false); setEditingAppointment(null); }}
          appointment={editingAppointment}
          onSuccess={fetchAppointments}
        />
      )}

      {isEditDoctorOpen && editingDoctor && (
        <EditDoctorModal
          isOpen={isEditDoctorOpen}
          onClose={() => { setIsEditDoctorOpen(false); setEditingDoctor(null); }}
          doctor={editingDoctor}
          onSuccess={fetchDoctors}
        />
      )}

      {isEditPatientOpen && editingPatient && (
        <EditPatientModal
          isOpen={isEditPatientOpen}
          onClose={() => { setIsEditPatientOpen(false); setEditingPatient(null); }}
          patient={editingPatient}
          onSuccess={fetchPatients}
        />
      )}

      {/* Modal de confirmación: Eliminar o Cancelar Cita */}
      {appointmentToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ¿Qué deseas hacer con esta cita?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {getPatientName(appointmentToDelete)} con {getDoctorName(appointmentToDelete)}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={async () => {
                  try {
                    // Cambiar estado a cancelada (no eliminar)
                    await updateAppointment(appointmentToDelete.id, { estado: 'cancelada' });
                    await fetchAppointments();
                    setAppointmentToDelete(null);
                  } catch (err) {
                    console.error('Error cancelando cita:', err);
                  }
                }}
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await deleteAppointment(appointmentToDelete.id);
                    await fetchAppointments();
                    setAppointmentToDelete(null);
                  } catch (err) {
                    console.error('Error eliminando cita:', err);
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
              >
                Eliminar
              </button>
              <button
                type="button"
                onClick={() => setAppointmentToDelete(null)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 text-sm"
              >
                Atras
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Doctores - gestión básica */}
      <div className="bg-white shadow rounded-lg mt-8 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Doctores</h2>
        </div>
        {doctors && doctors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctors.map((doc) => {
                  const fullName = `${doc.nombre || doc.usuario?.nombre || ''} ${doc.apellido || doc.usuario?.apellido || ''}`.trim();
                  const email = doc.correo || doc.email || doc.usuario?.correo || doc.usuario?.email || 'N/A';
                  return (
                    <tr key={doc.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fullName || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button type="button" onClick={() => { setEditingDoctor(doc); setIsEditDoctorOpen(true); }} className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600">Editar</button>
                          <button type="button" onClick={async () => { if (!window.confirm('¿Eliminar este doctor?')) return; try { await deleteDoctor(doc.id); await fetchDoctors(); } catch (err) { console.error('Error eliminando doctor', err); } }} className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No hay doctores registrados</p>
        )}
      </div>

      {/* Lista de Pacientes - gestión básica */}
      <div className="bg-white shadow rounded-lg mt-8 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Pacientes</h2>
        </div>
        {patients && patients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((pat) => {
                  const fullName = `${pat.nombre || pat.usuario?.nombre || ''} ${pat.apellido || pat.usuario?.apellido || ''}`.trim();
                  const email = pat.correo || pat.email || pat.usuario?.correo || pat.usuario?.email || 'N/A';
                  return (
                    <tr key={pat.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fullName || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button type="button" onClick={() => { setEditingPatient(pat); setIsEditPatientOpen(true); }} className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600">Editar</button>
                          <button type="button" onClick={async () => { if (!window.confirm('¿Eliminar este paciente?')) return; try { await deletePatient(pat.id); await fetchPatients(); } catch (err) { console.error('Error eliminando paciente', err); } }} className="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No hay pacientes registrados</p>
        )}
      </div>
    </div>
  );
};

export default DashboardAdmin;
