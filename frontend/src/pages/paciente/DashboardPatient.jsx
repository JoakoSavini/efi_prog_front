// src/pages/DashboardPatient.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/useAuth';
import { useAppointments } from '../../contexts/useAppointments';
import appointmentsService from '../../services/appointments';
import usersService from '../../services/users';
import Loader from '../../components/Loader';
import CreateAppointmentModal from '../../components/modals/CreateAppointmentModal';
import EditPatientModal from '../../components/modals/EditPatientModal';

const DashboardPatient = () => {
    const { user, refreshProfile } = useAuth();
    const { loading, cancelAppointment } = useAppointments();
    const [myAppointments, setMyAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [stats, setStats] = useState({
        upcomingAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0
    });

    const loadMyAppointments = useCallback(async () => {
        if (!user) return;
        
            try {
                // Derivar ID del paciente desde diferentes formas que puede devolver el backend
                const patientId = user?.id || user?.usuario?.id || user?.patientId || user?.paciente_id;

                if (!patientId) {
                    console.warn('No se encontró patientId en user:', user);
                    setMyAppointments([]);
                    return;
                }

                const data = await appointmentsService.getByPatient(patientId);

                // Normalizar la lista de citas para que el frontend trabaje con campos consistentes
                const normalized = (Array.isArray(data) ? data : (data?.items || []))
                    .map((app) => {
                        const fecha = app.fecha || app.fecha_hora || app.date;
                        let dateObj = fecha ? new Date(fecha) : null;
                        const time = app.time || app.hora || (dateObj ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');
                        const status = app.estado || app.status || app.estado_cita || '';
                        const doctorName =
                            app.medico?.nombre || app.medico?.usuario?.nombre ||
                            app.medico_nombre || app.doctorName || '';
                        const specialty = app.especialidad?.nombre || app.specialty || app.especialidad_nombre || '';

                        return {
                            id: app.id || app._id,
                            date: dateObj ? dateObj.toISOString() : fecha,
                            time,
                            status,
                            doctorName,
                            specialty,
                            reason: app.motivo || app.reason || app.descripcion || app.notes || '',
                            raw: app,
                        };
                    });

                setMyAppointments(normalized);

                // Calcular estadísticas usando valores normalizados
                const now = new Date();
                setStats({
                    upcomingAppointments: normalized.filter(app =>
                        (app.status === 'pending' || app.status === 'pendiente' || app.status === 'confirmada' || app.status === 'confirmado') && new Date(app.date) > now
                    ).length,
                    completedAppointments: normalized.filter(app => app.status === 'completed' || app.status === 'completada').length,
                    cancelledAppointments: normalized.filter(app => app.status === 'cancelled' || app.status === 'cancelada').length
                });
            } catch (error) {
                console.error('Error al cargar citas:', error);
            }
    }, [user]);

    useEffect(() => {
        loadMyAppointments();
    }, [loadMyAppointments]);

    useEffect(() => {
        const loadDoctors = async () => {
            setLoadingDoctors(true);
            try {
                // Pedimos la lista de usuarios filtrando por rol 'médico' para evitar mostrar usuarios que no lo son
                const data = await usersService.getAll({ rol: 'médico' });
                setDoctors(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error cargando doctores disponibles:', err);
            } finally {
                setLoadingDoctors(false);
            }
        };
        loadDoctors();
    }, []);

    const handleCancelAppointment = async (appointmentId) => {
        if (!window.confirm('¿Estás seguro de cancelar esta cita?')) return;

        try {
            await cancelAppointment(appointmentId, 'Cancelada por el paciente');
            // reload using local loader
            await loadMyAppointments();
        } catch (error) {
            console.error('Error al cancelar cita:', error);
        }
    };

    // Patients cannot create appointments from this dashboard; keep the handlers only for modal prop compatibility
    const closeCreateAppointment = () => setIsAppointmentModalOpen(false);

    if (loading) {
        return <Loader fullScreen />;
    }

    const getUserFullName = () => {
        if (!user) return 'Usuario';
        // Try several shapes returned by backend
        return (
            user.name ||
            `${user.nombre || user.usuario?.nombre || ''} ${user.apellido || user.usuario?.apellido || ''}`.trim() ||
            user.email ||
            'Usuario'
        );
    };

    const statCards = [
        {
            title: 'Próximas Citas',
            value: stats.upcomingAppointments,
            icon: '📅',
            color: 'bg-blue-500',
            textColor: 'text-blue-600'
        },
        {
            title: 'Completadas',
            value: stats.completedAppointments,
            icon: '✅',
            color: 'bg-green-500',
            textColor: 'text-green-600'
        },
        {
            title: 'Canceladas',
            value: stats.cancelledAppointments,
            icon: '❌',
            color: 'bg-red-500',
            textColor: 'text-red-600'
        }
    ];

    return (
        <>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Bienvenido, {getUserFullName()}
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                    Gestiona tus citas médicas
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
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Action */}
            {/* Los pacientes no pueden crear citas desde su dashboard; solo ver y cancelar */}

            {/* Perfil del Paciente y Doctores Disponibles */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Perfil */}
                <div className="col-span-1 bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-medium text-gray-900">Mi Perfil</h3>
                        <button
                            onClick={() => setIsEditProfileOpen(true)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                        >
                            Editar
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Información básica de tu cuenta</p>
                    <div className="space-y-2">
                        <div>
                            <div className="text-xs text-gray-500">Nombre</div>
                            <div className="text-sm font-semibold">{user?.name || `${user?.nombre || ''} ${user?.apellido || ''}`.trim()}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Correo</div>
                            <div className="text-sm">{user?.email || user?.correo || user?.usuario?.email || 'N/A'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Teléfono</div>
                            <div className="text-sm">{user?.telefono || user?.usuario?.telefono || 'N/A'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Dirección</div>
                            <div className="text-sm">{user?.direccion || user?.usuario?.direccion || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                {/* Doctores disponibles (ocupa 2 columnas en lg) */}
                <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Doctores Disponibles</h3>
                    <p className="text-sm text-gray-600 mb-4">Selecciona un médico para ver detalles o agendar</p>
                    {loadingDoctors ? (
                        <div className="text-gray-500">Cargando doctores...</div>
                    ) : doctors && doctors.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {doctors.map((doc) => (
                                <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                                                    <div className="text-sm font-semibold">{doc.usuario ? `${doc.usuario.nombre} ${doc.usuario.apellido}` : doc.nombre || `Dr ${doc.id}`}</div>
                                                                    <div className="text-xs text-gray-500">{doc.especialidad ? doc.especialidad.nombre : doc.especialidad_id ? `Especialidad ${doc.especialidad_id}` : 'Especialidad no especificada'}</div>
                                        </div>
                                        <div>
                                            <button onClick={() => setIsAppointmentModalOpen(true)} className="px-3 py-1 bg-indigo-600 text-white rounded-md text-xs">Agendar</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No hay médicos disponibles</p>
                    )}
                </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white shadow rounded-lg mb-8">
                <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Próximas Citas
                    </h2>
                    {myAppointments && myAppointments.length > 0 ? (
                        <div className="space-y-4">
                            {myAppointments
                                .filter(app => {
                                    const now = new Date();
                                    return app.status === 'pending' && new Date(app.date) > now;
                                })
                                .map((appointment, index) => (
                                    <div
                                        key={index}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    Dr. {appointment.doctorName || 'Sin asignar'}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Especialidad: {appointment.specialty || 'N/A'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Fecha: {appointment.date ? new Date(appointment.date).toLocaleDateString() : 'N/A'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Hora: {appointment.time || 'N/A'}
                                                </p>
                                                {appointment.reason && (
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        Motivo: {appointment.reason}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="shrink-0">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex space-x-3">
                                            <button
                                                onClick={() => handleCancelAppointment(appointment.id)}
                                                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                Cancelar Cita
                                            </button>
                                                {/* Patients cannot reprogram from UI; only cancel */}
                                        </div>
                                    </div>
                                ))}
                            {myAppointments.filter(app => {
                                const now = new Date();
                                return app.status === 'pending' && new Date(app.date) > now;
                            }).length === 0 && (
                                    <p className="text-gray-500 text-center py-4">
                                        No tienes citas próximas. ¡Agenda una nueva!
                                    </p>
                                )}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">
                            No tienes citas programadas
                        </p>
                    )}
                </div>
            </div>

            {/* Appointment History - ALL APPOINTMENTS */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Todas mis Citas
                    </h2>
                    {myAppointments && myAppointments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Doctor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Especialidad
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Hora
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Motivo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {myAppointments.map((appointment, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                Dr. {appointment.doctorName || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {appointment.specialty || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {appointment.date ? new Date(appointment.date).toLocaleDateString('es-ES') : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {appointment.time || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {appointment.reason || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${appointment.status === 'completada' || appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        (appointment.status === 'pendiente' || appointment.status === 'programada' || appointment.status === 'pending') ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {appointment.status === 'completada' || appointment.status === 'completed' ? 'Completada' :
                                                        (appointment.status === 'pendiente' || appointment.status === 'programada') ? 'Pendiente' :
                                                            'Cancelada'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">
                            No tienes historial de citas
                        </p>
                    )}
                </div>
            </div>
        </div>
        {isAppointmentModalOpen && (
            <CreateAppointmentModal
                isOpen={isAppointmentModalOpen}
                onClose={closeCreateAppointment}
                onSuccess={loadMyAppointments}
            />
        )}
        {isEditProfileOpen && user && (
            <EditPatientModal
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
                patient={user}
                    onSuccess={() => {
                        setIsEditProfileOpen(false);
                        refreshProfile();
                    }}
            />
        )}
        </>
    );
};

export default DashboardPatient;