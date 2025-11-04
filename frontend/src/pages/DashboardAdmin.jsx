// src/pages/DashboardAdmin.jsx
import { useState, useEffect } from 'react';
import { useAppointments } from '../contexts/AppointmentContext';
import { useDoctors } from '../contexts/DoctorsContext';
import { usePatients } from '../contexts/PatientsContext';
import Loader from '../components/Loader';

const DashboardAdmin = () => {
    const { appointments, fetchAppointments, loading: appointmentsLoading } = useAppointments();
    const { doctors, fetchDoctors, loading: doctorsLoading } = useDoctors();
    const { patients, fetchPatients, loading: patientsLoading } = usePatients();

    const [stats, setStats] = useState({
        totalPatients: 0,
        totalDoctors: 0,
        totalAppointments: 0,
        pendingAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            await Promise.all([
                fetchAppointments(),
                fetchDoctors(),
                fetchPatients()
            ]);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        }
    };

    useEffect(() => {
        if (appointments && doctors && patients) {
            setStats({
                totalPatients: patients.length || 0,
                totalDoctors: doctors.length || 0,
                totalAppointments: appointments.length || 0,
                pendingAppointments: appointments.filter(app => app.status === 'pending').length || 0,
                completedAppointments: appointments.filter(app => app.status === 'completed').length || 0,
                cancelledAppointments: appointments.filter(app => app.status === 'cancelled').length || 0
            });
        }
    }, [appointments, doctors, patients]);

    if (appointmentsLoading || doctorsLoading || patientsLoading) {
        return <Loader fullScreen />;
    }

    const statCards = [
        {
            title: 'Total Pacientes',
            value: stats.totalPatients,
            icon: '👥',
            color: 'bg-blue-500',
            textColor: 'text-blue-600'
        },
        {
            title: 'Total Doctores',
            value: stats.totalDoctors,
            icon: '⚕️',
            color: 'bg-green-500',
            textColor: 'text-green-600'
        },
        {
            title: 'Total Citas',
            value: stats.totalAppointments,
            icon: '📅',
            color: 'bg-purple-500',
            textColor: 'text-purple-600'
        },
        {
            title: 'Citas Pendientes',
            value: stats.pendingAppointments,
            icon: '⏳',
            color: 'bg-yellow-500',
            textColor: 'text-yellow-600'
        },
        {
            title: 'Citas Completadas',
            value: stats.completedAppointments,
            icon: '✅',
            color: 'bg-teal-500',
            textColor: 'text-teal-600'
        },
        {
            title: 'Citas Canceladas',
            value: stats.cancelledAppointments,
            icon: '❌',
            color: 'bg-red-500',
            textColor: 'text-red-600'
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
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
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {appointment.patientName || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {appointment.doctorName || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {appointment.date || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {appointment.status || 'N/A'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No hay citas registradas</p>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <button className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 text-left">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                            <span className="text-2xl">➕</span>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Nuevo Paciente
                            </h3>
                            <p className="text-sm text-gray-500">
                                Registrar nuevo paciente
                            </p>
                        </div>
                    </div>
                </button>

                <button className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 text-left">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                            <span className="text-2xl">👨‍⚕️</span>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Nuevo Doctor
                            </h3>
                            <p className="text-sm text-gray-500">
                                Registrar nuevo doctor
                            </p>
                        </div>
                    </div>
                </button>

                <button className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 text-left">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                            <span className="text-2xl">📅</span>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Nueva Cita
                            </h3>
                            <p className="text-sm text-gray-500">
                                Agendar nueva cita
                            </p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default DashboardAdmin;