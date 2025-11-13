import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// 🚨 Importa el hook useAuth que se define en tu contexto
import { useAuth } from "../contexts/AuthContext";
// import Toast from "../components/Toast"; // Descomentar si usas este componente

const Login = () => {
  const navigate = useNavigate();
  // 🚨 Obtener la función de login del contexto
  const { login } = useAuth();

  // Usamos nombres de estado estándar para formularios
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // Para mostrar/ocultar password

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Crear el objeto de credenciales con los nombres que espera la API
      const credentials = {
        correo: email, // Mapea 'email' a 'correo'
        contraseña: password, // Mapea 'password' a 'contraseña'
      };

      // 2. Llamar a login, que ahora devuelve la respuesta de la API completa.
      const response = await login(credentials);

      // 3. Acceder al rol para la redirección.
      // Roles de la API: 'admin', 'médico', 'paciente'
      const role = response.user?.rol || response.data?.user?.rol;

      if (!role) {
        throw new Error("Respuesta incompleta: Falta información del rol.");
      }

      // Lógica de redirección basada en el rol oficial de la API
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "médico") {
        navigate("/medico/dashboard");
      } else if (role === "paciente") {
        navigate("/paciente/dashboard");
      } else {
        // En caso de que haya un rol desconocido
        navigate("/");
      }
    } catch (err) {
      // Si el error es relanzado por AuthProvider/authService, vendrá con 'message'
      console.error("Error capturado en el Login.jsx:", err);
      // Si el error tiene una propiedad message, úsala; si no, usa un mensaje genérico.
      setError(
        err.message || "Error al iniciar sesión. Verifica credenciales."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm w-full space-y-8 bg-white p-6 sm:p-8 rounded-xl">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <span className="text-blue-500 text-xl font-bold">+</span>
          </div>

          <h2 className="text-center text-3xl font-extrabold text-gray-900 leading-tight">
            Bienvenido de nuevo
          </h2>

          <p className="mt-1 text-center text-base text-gray-500">
            Gestiona tus citas médicas de forma sencilla.
          </p>
        </div>

        {/* {error && (<Toast message={error} type="error" onClose={() => setError("")} />)} */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 text-left"
            >
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={handleChangeEmail}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out bg-white"
                placeholder="Introduce tu email"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 text-left"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={handleChangePassword}
                className="appearance-none relative block w-full pr-10 pl-3 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out bg-white"
                placeholder="Introduce tu contraseña"
              />

              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-semibold text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Ocultar" : "Mostrar"}
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-500 hover:text-blue-600 font-medium"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{" "}
              <Link
                to="/register"
                className="text-blue-500 hover:text-blue-600"
              >
                Crear Cuenta
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
