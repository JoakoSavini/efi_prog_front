// src/pages/DashboardDoctor.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/useAuth';
import { useAppointments } from '../contexts/useAppointments';
import appointmentsService from '../services/appointments';
import Loader from '../components/Loader';

const DashboardDoctor = () => {
    const { user } = useAuth();
    const { loading } = useAppointments();
    const [myAppointments, setMyAppointments] = useState([]);
    const [stats, setStats] = useState({
        todayAppointments: 0,
        pendingAppointments: 0,
        completedToday: 0
    });

    const loadMyAppointments = useCallback(async () => {
        if (!user) return;
        
        try {
            // Asumiendo que tienes el ID del doctor en user.doctorId o user.id
            const data = await appointmentsService.getByDoctor(user?.doctorId || user?.id);
            setMyAppointments(data);

            // Calcular estadísticas
            const today = new Date().toISOString().split('T')[0];
            const todayAppts = data.filter(app => app.date?.startsWith(today));

            setStats({
                todayAppointments: todayAppts.length,
                pendingAppointments: data.filter(app => app.status === 'pending').length,
                completedToday: todayAppts.filter(app => app.status === 'completed').length
            });
        } catch (error) {
            console.error('Error al cargar citas:', error);
        }
    }, [user]);

    useEffect(() => {
        loadMyAppointments();
    }, [loadMyAppointments]);

    if (loading) {
        return <Loader fullScreen />;
    }

    const statCards = [
        {
            title: 'Citas de Hoy',
            value: stats.todayAppointments,
            icon: '📅',
            color: 'bg-blue-500',
            textColor: 'text-blue-600'
        },
        {
            title: 'Pendientes',
            value: stats.pendingAppointments,
            icon: '⏳',
            color: 'bg-yellow-500',
            textColor: 'text-yellow-600'
        },
        {
            title: 'Completadas Hoy',
            value: stats.completedToday,
            icon: '✅',
            color: 'bg-green-500',
            textColor: 'text-green-600'
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Bienvenido, Dr. {user?.name}
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                    Panel de gestión de tus citas médicas
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

            {/* Today's Schedule */}
            <div className="bg-white shadow rounded-lg mb-8">
                <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Agenda de Hoy
                    </h2>
                    {myAppointments && myAppointments.length > 0 ? (
                        <div className="space-y-4">
                            {myAppointments
                                .filter(app => {
                                    const today = new Date().toISOString().split('T')[0];
                                    return app.date?.startsWith(today);
                                })
                                .map((appointment, index) => (
                                    <div
                                        key={index}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {appointment.patientName || 'Paciente sin nombre'}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Hora: {appointment.time || 'N/A'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Motivo: {appointment.reason || 'Sin especificar'}
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {appointment.status || 'pending'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex space-x-3">
                                            {appointment.status === 'pending' && (
                                                <>
                                                    <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                                        Completar
                                                    </button>
                                                    <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                                        Cancelar
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            {myAppointments.filter(app => {
                                const today = new Date().toISOString().split('T')[0];
                                return app.date?.startsWith(today);
                            }).length === 0 && (
                                    <p className="text-gray-500 text-center py-4">
                                        No tienes citas programadas para hoy
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

            {/* Upcoming Appointments */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Próximas Citas
                    </h2>
                    {myAppointments && myAppointments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Paciente
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
                                                {appointment.patientName || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {appointment.date || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {appointment.time || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {appointment.status || 'pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">
                            No tienes citas próximas
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardDoctor;