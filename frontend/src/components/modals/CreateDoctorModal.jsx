// src/components/Modals/CreateDoctorModal.jsx
import { useState, useEffect } from "react";
import { useDoctors } from "../../contexts/useDoctors";
import doctorsService from "../../services/doctors";
// Asume que el componente Modal base es el mismo que en CreatePatientModal
const ModalComponent = ({ children, title, onClose }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
    <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
      <div className="flex justify-between items-start pb-3 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <button
          type="button"
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
          onClick={onClose}
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
      </div>
      <div className="pt-4">{children}</div>
    </div>
  </div>
);

const initialDoctorState = {
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  matricula: "",
  especialidad_id: "",
  usuario_id: "",
};

const CreateDoctorModal = ({ isOpen, onClose, onSuccess }) => {
  const {
    createDoctor,
    loading: loadingContext,
    error: contextError,
  } = useDoctors();
  const [formData, setFormData] = useState(initialDoctorState);
  const [specialties, setSpecialties] = useState([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  useEffect(() => {
    // Cargar especialidades al abrir el modal
    const loadSpecialties = async () => {
      setLoadingSpecialties(true);
      try {
        const data = await doctorsService.getSpecialties();
        console.log("Especialidades cargadas:", data);
        setSpecialties(data);
      } catch (err) {
        console.error("Error cargando especialidades:", err);
        setSubmissionError("No se pudieron cargar las especialidades.");
      } finally {
        setLoadingSpecialties(false);
      }
    };

    if (isOpen) {
      loadSpecialties();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // Convierte a número si es necesario
    const finalValue =
      type === "number" && name !== "telefono" ? Number(value) : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError(null);

    // Los datos para la API de creación de médico - solo los campos del initialDoctorState
    const doctorData = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      telefono: formData.telefono,
      matricula: formData.matricula,
      especialidad_id: formData.especialidad_id,
      usuario_id: formData.usuario_id,
      rol: "médico",
    };

    if (!doctorData.especialidad_id || !doctorData.matricula) {
      setSubmissionError(
        "La Especialidad y la Matrícula son campos obligatorios."
      );
      return;
    }

    try {
      const newDoctor = await createDoctor(doctorData);
      console.log("Doctor creado:", newDoctor);

      if (onSuccess) onSuccess();
      onClose();
      setFormData(initialDoctorState);
    } catch (err) {
      console.error("Error al crear doctor:", err);
      setSubmissionError(
        err.message || "Error desconocido al crear el doctor."
      );
    }
  };

  if (!isOpen) return null;

  const loading = loadingContext || loadingSpecialties;

  return (
    <ModalComponent title="Registrar Nuevo Doctor" onClose={onClose}>
      {(submissionError || contextError) && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          {submissionError || contextError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sección de Usuario */}
        <h4 className="text-lg font-medium border-b pb-2 text-green-600">
          Datos de Usuario (Requerido)
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {/* Nombre, Apellido, email, Contraseña, Teléfono, F. Nacimiento, Dirección... (Igual que en paciente) */}
          <label className="block">
            <span className="text-gray-700">Nombre</span>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Apellido</span>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2"
            />
          </label>
          <label className="block col-span-2">
            <span className="text-gray-700">Correo Electrónico</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Contraseña</span>
            <input
              type="password"
              name="contraseña"
              value={formData.contraseña || ""}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Teléfono</span>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">F. Nacimiento</span>
            <input
              type="date"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2"
            />
          </label>
          <label className="block col-span-2">
            <span className="text-gray-700">Dirección</span>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2"
            />
          </label>
        </div>

        {/* Sección de Doctor (Obligatorio para el perfil médico) */}
        <h4 className="text-lg font-medium border-b pb-2 text-green-600 pt-4">
          Datos de Médico (Requerido)
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-gray-700">Especialidad</span>
            <select
              name="especialidad_id"
              value={formData.especialidad_id}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2"
              disabled={loadingSpecialties}
            >
              <option value="" disabled>
                Seleccione...
              </option>
              {loadingSpecialties ? (
                <option value="">Cargando...</option>
              ) : (
                specialties.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.nombre}
                  </option>
                ))
              )}
            </select>
          </label>
          <label className="block">
            <span className="text-gray-700">Matrícula Profesional</span>
            <input
              type="text"
              name="matricula"
              value={formData.matricula}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Años de Experiencia</span>
            <input
              type="number"
              name="anos_experiencia"
              value={formData.anos_experiencia}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 p-2"
            />
          </label>
        </div>

        <div className="flex justify-end pt-4 space-x-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
              loading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Creando..." : "Crear Doctor"}
          </button>
        </div>
      </form>
    </ModalComponent>
  );
};

export default CreateDoctorModal;
