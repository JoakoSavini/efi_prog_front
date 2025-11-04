// src/components/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="text-2xl font-bold text-indigo-600">
                                MediCitas
                            </span>
                        </Link>

                        <div className="hidden md:ml-6 md:flex md:space-x-8">
                            {user?.role === 'admin' && (
                                <>
                                    <Link
                                        to="/dashboard/admin"
                                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-indigo-600"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/patients"
                                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-indigo-600"
                                    >
                                        Pacientes
                                    </Link>
                                    <Link
                                        to="/doctors"
                                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-indigo-600"
                                    >
                                        Doctores
                                    </Link>
                                    <Link
                                        to="/appointments"
                                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-indigo-600"
                                    >
                                        Citas
                                    </Link>
                                </>
                            )}

                            {user?.role === 'doctor' && (
                                <>
                                    <Link
                                        to="/dashboard/doctor"
                                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-indigo-600"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/my-appointments"
                                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-indigo-600"
                                    >
                                        Mis Citas
                                    </Link>
                                    <Link
                                        to="/my-patients"
                                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-indigo-600"
                                    >
                                        Mis Pacientes
                                    </Link>
                                </>
                            )}

                            {user?.role === 'patient' && (
                                <>
                                    <Link
                                        to="/dashboard/patient"
                                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-indigo-600"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/my-appointments"
                                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-indigo-600"
                                    >
                                        Mis Citas
                                    </Link>
                                    <Link
                                        to="/book-appointment"
                                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-indigo-600"
                                    >
                                        Agendar Cita
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="hidden md:ml-6 md:flex md:items-center">
                        <div className="ml-3 relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="ml-2 text-gray-700">{user?.name}</span>
                            </button>

                            {isMenuOpen && (
                                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                                    <div className="py-1">
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Mi Perfil
                                        </Link>
                                        <Link
                                            to="/settings"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Configuración
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                handleLogout();
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        >
                            <span className="sr-only">Abrir menú</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        {user?.role === 'admin' && (
                            <>
                                <Link
                                    to="/dashboard/admin"
                                    className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/patients"
                                    className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Pacientes
                                </Link>
                                <Link
                                    to="/doctors"
                                    className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Doctores
                                </Link>
                                <Link
                                    to="/appointments"
                                    className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Citas
                                </Link>
                            </>
                        )}
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-200">
                        <div className="flex items-center px-4">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div className="ml-3">
                                <div className="text-base font-medium text-gray-800">{user?.name}</div>
                                <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                            </div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <Link
                                to="/profile"
                                className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Mi Perfil
                            </Link>
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    handleLogout();
                                }}
                                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;