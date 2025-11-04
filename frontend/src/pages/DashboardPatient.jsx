// src/pages/DashboardPatient.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/useAuth';
import { useAppointments } from '../contexts/useAppointments';
import appointmentsService from '../services/appointments';
import Loader from '../components/Loader';

const DashboardPatient = () => {
    const { user } = useAuth();
    const { loading } = useAppointments();
    const [myAppointments, setMyAppointments] = useState([]);
    const [stats, setStats] = useState({
        upcomingAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0
    });

    const loadMyAppointments = useCallback(async () => {
        if (!user) return;
        
        try {
            // Asumiendo que tienes el ID del paciente en user.patientId o user.id
            const data = await appointmentsService.getByPatient(user?.patientId || user?.id);
            setMyAppointments(data);

            // Calcular estadísticas
            const now = new Date();
            setStats({
                upcomingAppointments: data.filter(app =>
                    app.status === 'pending' && new Date(app.date) > now
                ).length,
                completedAppointments: data.filter(app => app.status === 'completed').length,
                cancelledAppointments: data.filter(app => app.status === 'cancelled').length
            });
        } catch (error) {
            console.error('Error al cargar citas:', error);
        }
    }, [user]);

    useEffect(() => {
        loadMyAppointments();
    }, [loadMyAppointments]);

    const handleCancelAppointment = async (appointmentId) => {
        if (!window.confirm('¿Estás seguro de cancelar esta cita?')) return;

        try {
            await appointmentsService.cancel(appointmentId, 'Cancelada por el paciente');
            loadMyAppointments();
        } catch (error) {
            console.error('Error al cancelar cita:', error);
        }
    };

    if (loading) {
        return <Loader fullScreen />;
    }

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Bienvenido, {user?.name}
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

            {/* Quick Action */}
            <div className="mb-8">
                <button className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
                    <span className="flex items-center justify-center">
                        <span className="text-xl mr-2">➕</span>
                        Agendar Nueva Cita
                    </span>
                </button>
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
                                            <div className="flex-shrink-0">
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
                                            <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                                                Reprogramar
                                            </button>
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

            {/* Appointment History */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Historial de Citas
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
                                            Fecha
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Hora
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {myAppointments.slice(0, 5).map((appointment, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                Dr. {appointment.doctorName || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {appointment.date ? new Date(appointment.date).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {appointment.time || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {appointment.status === 'completed' ? 'Completada' :
                                                        appointment.status === 'pending' ? 'Pendiente' :
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
    );
};

export default DashboardPatient;