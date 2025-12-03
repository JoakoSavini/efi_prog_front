// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import Toast from "../../components/Toast";

const Register = () => {
  const navigate = useNavigate();
  const { register, user: authUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "patient",
    phone: "",
    dni: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Para Contraseña
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Para Confirmar Contraseña

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword: _, name, role, phone, dni, ...rest } = formData;
      // split name into nombre/apellido when possible
      const [firstName, ...lastParts] = (name || "").trim().split(" ");
      const lastName = lastParts.join(" ") || "";
      const payload = {
        nombre: firstName || rest.nombre || "",
        apellido: lastName || rest.apellido || "",
        correo: formData.email,
        contraseña: formData.password,
        rol: role === "doctor" ? "médico" : "paciente",
        telefono: phone,
        dni: dni,
      };

      const res = await register(payload);
      // Prefer the normalized role returned in response, fallback to auth context
      const userRole = res.user?.role || authUser?.role || res.user?.rol;

      if (userRole === "admin" || userRole === "administrador") navigate("/dashboard/admin");
      else if (userRole === "doctor" || userRole === "médico") navigate("/dashboard/doctor");
      else if (userRole === "patient" || userRole === "paciente") navigate("/dashboard/patient");
      else navigate("/");
    } catch (err) {
      setError(err.message || "Error al registrar usuario");
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
            Crear Cuenta
          </h2>

          <p className="mt-1 text-center text-base text-gray-500">
            Regístrate en el sistema para empezar.
          </p>
        </div>

        {error && (
          <Toast message={error} type="error" onClose={() => setError("")} />
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {" "}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 text-left"
              >
                Nombre completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 appearance-none block w-full px-3 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out bg-white"
                placeholder="Tu nombre y apellido"
              />
            </div>

            <div>
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
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none block w-full px-3 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out bg-white"
                placeholder="tucorreo@ejemplo.com"
              />
            </div>

            <div>
              <label
                htmlFor="dni"
                className="block text-sm font-medium text-gray-700 text-left"
              >
                DNI
              </label>
              <input
                id="dni"
                name="dni"
                type="text"
                required
                value={formData.dni}
                onChange={handleChange}
                className="mt-1 appearance-none block w-full px-3 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out bg-white"
                placeholder="Documento de identidad"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 text-left"
              >
                Teléfono
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 appearance-none block w-full px-3 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out bg-white"
                placeholder="Número de contacto"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 text-left"
              >
                Tipo de usuario
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-3 border border-gray-200 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out bg-white"
              >
                <option value="patient">Paciente</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>

            <div>
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
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 appearance-none block w-full pr-10 pl-3 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out bg-white"
                  placeholder="Introduce una contraseña segura"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 top-1/2 -translate-y-1/2 flex items-center pr-3 text-xs font-semibold text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Ocultar" : "Mostrar"}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 text-left"
              >
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 appearance-none block w-full pr-10 pl-3 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out bg-white"
                  placeholder="Repite la contraseña"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 top-1/2 -translate-y-1/2 flex items-center pr-3 text-xs font-semibold text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? "Ocultar" : "Mostrar"}
                >
                  {showConfirmPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              {loading ? "Registrando..." : "Registrarse"}
            </button>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-blue-500 hover:text-blue-600">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
