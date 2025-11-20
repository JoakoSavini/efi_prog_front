// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../../services/auth";
import Toast from "../../components/Toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Error al enviar correo de recuperación");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-sm w-full space-y-8 bg-white p-6 sm:p-8 rounded-xl">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <span className="text-2xl text-green-600">✓</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 leading-tight">
              ¡Correo Enviado!
            </h2>
            <p className="mt-2 text-base text-gray-500">
              Hemos enviado un enlace de recuperación a tu correo electrónico.
              Por favor revisa tu bandeja de entrada.
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm w-full space-y-8 bg-white p-6 sm:p-8 rounded-xl">
        <div className="text-center space-y-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <span className="text-blue-500 text-xl font-bold">↻</span>
          </div>

          <h2 className="text-center text-3xl font-extrabold text-gray-900 leading-tight">
            Recuperar Contraseña
          </h2>

          <p className="text-center text-base text-gray-500">
            Introduce tu email para recibir las instrucciones.
          </p>
        </div>

        {error && (
          <Toast message={error} type="error" onClose={() => setError("")} />
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 text-left"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 appearance-none block w-full px-3 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out bg-white"
              placeholder="Introduce tu email"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              {loading ? "Enviando..." : "Enviar Instrucciones"}
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-sm text-gray-600">
              ¿Recuerdas tu contraseña?{" "}
              <Link to="/login" className="text-blue-500 hover:text-blue-600">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
