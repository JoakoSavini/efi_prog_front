import { useState } from "react";
import { usePatients } from "../../contexts/usePatients";

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

const initialPatientState = {
  nombre: "",
  apellido: "",
  email: "",
  contraseña: "",
  confirmar_contraseña: "",
  telefono: "",
  dni: "",
  direccion: "",
};

const CreatePatientModal = ({ isOpen, onClose, onSuccess }) => {
  const { createPatient, loading: loadingContext, error: contextError } = usePatients();
  const [formData, setFormData] = useState(initialPatientState);
  const [submissionError, setSubmissionError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!formData.nombre || !formData.apellido || !formData.email || !formData.contraseña || !formData.dni || !formData.telefono) {
      setSubmissionError("Nombre, apellido, email, DNI, teléfono y contraseña son campos requeridos");
      return;
    }

    if (formData.contraseña !== formData.confirmar_contraseña) {
      setSubmissionError("Las contraseñas no coinciden");
      return;
    }

    if (formData.contraseña.length < 6) {
      setSubmissionError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      const patientData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        contraseña: formData.contraseña,
        telefono: formData.telefono,
        dni: formData.dni,
        direccion: formData.direccion,
      };

      await createPatient(patientData);

      if (onSuccess) onSuccess();
      onClose();
      setFormData(initialPatientState);
    } catch (err) {
      console.error("Error al crear paciente:", err);
      setSubmissionError(err.message || "Error desconocido al crear el paciente");
    }
  };

  if (!isOpen) return null;

  return (
    <ModalComponent title="Registrar Nuevo Paciente" onClose={onClose}>
      {(submissionError || contextError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          {submissionError || contextError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <h4 className="text-lg font-medium border-b pb-2 text-indigo-600">
          Datos del Paciente
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
              name="email"
              value={formData.email}
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
              placeholder="Mínimo 6 caracteres"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Confirmar Contraseña</span>
            <input
              type="password"
              name="confirmar_contraseña"
              value={formData.confirmar_contraseña}
              onChange={handleChange}
              required
              placeholder="Repite la contraseña"
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
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">DNI</span>
            <input
              type="text"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              required
              placeholder="Ej: 12345678"
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
            disabled={loadingContext}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
              loadingContext
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loadingContext ? "Creando..." : "Crear Paciente"}
          </button>
        </div>
      </form>
    </ModalComponent>
  );
};

export default CreatePatientModal;
