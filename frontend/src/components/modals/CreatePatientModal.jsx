import { useState } from "react";
import Modal from "./Modal";
import { usePatients } from "../../contexts/usePatients"; // Asume que este context está disponible

const initialState = {
  nombre: "",
  apellido: "",
  correo: "",
  contraseña: "", // Necesario para crear usuario
  telefono: "",
  direccion: "",
  fecha_nacimiento: "",
  // Campos específicos de paciente
  historia_clinica: "",
  tipo_sangre: "",
  alergias: "",
  contacto_emergencia: "",
};

const CreatePatientModal = ({ isOpen, onClose, onSuccess }) => {
  const {
    createPatient,
    loading: loadingContext,
    error: contextError,
  } = usePatients();
  const [formData, setFormData] = useState(initialState);
  const [submissionError, setSubmissionError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError(null);

    // Los datos para crear el usuario deben incluir el rol "paciente"
    const userData = {
      ...formData,
      rol: "paciente",
    };

    try {
      // Llamada al context para crear el paciente (que internamente llama al service)
      const newPatient = await createPatient(userData);

      console.log("Paciente creado:", newPatient);

      // Si tiene éxito:
      if (onSuccess) onSuccess();
      onClose();
      setFormData(initialState);
    } catch (err) {
      console.error("Error al crear paciente:", err);
      // Usar el mensaje de error del backend o uno por defecto
      const errMsg =
        err.message ||
        contextError ||
        "Error desconocido al crear el paciente.";
      setSubmissionError(errMsg);
    }
  };

  const loading = loadingContext;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Nuevo Paciente"
      size="max-w-lg" // Tamaño estándar
    >
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
        <h4 className="text-lg font-medium border-b pb-2 text-indigo-600">
          Datos de Usuario (Requerido)
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-gray-700">Nombre</span>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
            />
          </label>
          <label className="block col-span-2">
            <span className="text-gray-700">Correo Electrónico</span>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Contraseña</span>
            <input
              type="password"
              name="contraseña"
              value={formData.contraseña}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Teléfono</span>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">F. Nacimiento</span>
            <input
              type="date"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
            />
          </label>
          <label className="block col-span-2">
            <span className="text-gray-700">Dirección</span>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
            />
          </label>
        </div>

        {/* Sección de Paciente (Opcional) */}
        <h4 className="text-lg font-medium border-b pb-2 text-indigo-600 pt-4">
          Datos Clínicos (Opcional)
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-gray-700">Tipo de Sangre</span>
            <input
              type="text"
              name="tipo_sangre"
              value={formData.tipo_sangre}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Alergias</span>
            <input
              type="text"
              name="alergias"
              value={formData.alergias}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
            />
          </label>
          <label className="block col-span-2">
            <span className="text-gray-700">Contacto de Emergencia</span>
            <input
              type="text"
              name="contacto_emergencia"
              value={formData.contacto_emergencia}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
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
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Creando..." : "Crear Paciente"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePatientModal;
