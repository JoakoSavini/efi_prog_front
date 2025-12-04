import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/useAuth";
import Modal from "./Modal";
import { useAppointments } from "../../contexts/useAppointments";

import usersService from "../../services/users";
import doctorsService from "../../services/doctors";
import consultoriosService from "../../services/consultorios";

const initialAppointmentState = {
  id_medico: "",
  id_paciente: "",
  id_consultorio: "",
  fecha_hora: "",
  motivo: "",
  notas: "",
};

const CreateAppointmentModal = ({ isOpen, onClose, onSuccess }) => {
  const {
    createAppointment,
    loading: loadingContext,
    error: contextError,
  } = useAppointments();
  const { user } = useAuth();
  const [formData, setFormData] = useState(initialAppointmentState);
  const [submissionError, setSubmissionError] = useState(null);

  // Datos maestros
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [consultorios, setConsultorios] = useState([]);
  const [loadingMasters, setLoadingMasters] = useState(true);

  useEffect(() => {
    const loadMasterData = async () => {
      if (!isOpen) return;

      setLoadingMasters(true);
      setSubmissionError(null);

      try {
        // 1. Obtener Doctores activos usando doctorsService
        const doctorsData = await doctorsService.getAll({ estado: true });
        const doctorsList = Array.isArray(doctorsData) ? doctorsData : doctorsData?.data || [];
        setDoctors(doctorsList);

        // 2. Obtener Pacientes
        if (user && (user.role === "patient" || user.role === "paciente")) {
          // If logged-in user is a patient, only allow creating for themselves
          const pid = user.id || user.usuario?.id || user.patientId || user.paciente_id;
          if (pid) {
            const me = Array.isArray(user) ? user[0] : user;
            // ensure we have a normalized patient object
            setPatients([{ id: pid, usuario: { nombre: me.nombre || me.usuario?.nombre || me.name || "", apellido: me.apellido || me.usuario?.apellido || "" }, correo: me.correo || me.email || me.usuario?.email }]);
            setFormData((prev) => ({ ...prev, id_paciente: Number(pid) }));
          } else {
            // fallback to fetching patients list
            const patientsData = await usersService.getAll({ rol: "paciente" });
            const patientsList = Array.isArray(patientsData) ? patientsData : patientsData?.data || [];
            setPatients(patientsList);
          }
        } else {
          const patientsData = await usersService.getAll({ rol: "paciente" });
          const patientsList = Array.isArray(patientsData) ? patientsData : patientsData?.data || [];
          setPatients(patientsList);
        }

        // 3. Obtener Consultorios
        const consultoriosData = await consultoriosService.getAll();
        const consultoriosList = Array.isArray(consultoriosData) ? consultoriosData : consultoriosData?.data || [];
        setConsultorios(consultoriosList);
      } catch (err) {
        console.error("Error al cargar datos maestros:", err);
        setSubmissionError(
          err.message ||
            "Error al cargar la lista de médicos, pacientes o consultorios."
        );
      } finally {
        setLoadingMasters(false);
      }
    };

    loadMasterData();
  }, [isOpen, user]); // Dependencia del estado del modal y user

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Conversión a número para IDs
    const finalValue = name.startsWith("id_") ? Number(value) : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError(null);

    // Preparar datos para la API
    const appointmentData = {
      medico_id: formData.id_medico,
      paciente_id: formData.id_paciente,
      consultorio_id: formData.id_consultorio,
      // Se recomienda siempre enviar la fecha en formato ISO para el backend
      fecha_hora: formData.fecha_hora
        ? new Date(formData.fecha_hora).toISOString()
        : "",
      motivo: formData.motivo,
      notas: formData.notas,
    };

    // Ensure newly created appointments have a default status (backend may vary)
    if (!appointmentData.estado) {
      appointmentData.estado = "pendiente";
    }

    if (
      !appointmentData.medico_id ||
      !appointmentData.paciente_id ||
      !appointmentData.fecha_hora ||
      !appointmentData.motivo
    ) {
      setSubmissionError(
        "Los campos Médico, Paciente, Fecha/Hora y Motivo son obligatorios."
      );
      return;
    }

    try {
      const newAppointment = await createAppointment(appointmentData);

      console.log("Cita creada:", newAppointment);

      if (onSuccess) onSuccess();
      onClose();
      setFormData(initialAppointmentState);
    } catch (err) {
      console.error("Error al crear cita:", err);
      const errMsg =
        err.message || contextError || "Error desconocido al crear la cita.";
      setSubmissionError(errMsg);
    }
  };

  const loading = loadingContext || loadingMasters;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agendar Nueva Cita"
      size="max-w-2xl" // Tamaño más ancho
    >
      {(submissionError || contextError) && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          {submissionError || contextError}
        </div>
      )}

      {loadingMasters ? (
        <div className="text-center py-8 text-gray-500">
          Cargando datos maestros...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Campo Médico */}
            <label className="block">
              <span className="text-gray-700 font-medium">Médico *</span>
              <select
                name="id_medico"
                value={formData.id_medico}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 p-2"
              >
                <option value="" disabled>
                  Seleccione un Médico
                </option>
                {doctors.map((doc) => {
                  const name = doc.usuario?.nombre || doc.nombre || doc.name || "";
                  const last = doc.usuario?.apellido || doc.apellido || "";
                  const email = doc.correo || doc.email || doc.usuario?.email || "";
                  const label = (name || last) ? `${name} ${last}`.trim() : (email || `Médico ${doc.id}`);
                  return (
                    <option key={doc.id} value={doc.id}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </label>

            {/* Campo Paciente */}
            <label className="block">
              <span className="text-gray-700 font-medium">Paciente *</span>
              <select
                name="id_paciente"
                value={formData.id_paciente}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 p-2"
              >
                <option value="" disabled>
                  Seleccione un Paciente
                </option>
                {patients.map((pat) => {
                  const name = pat.usuario?.nombre || pat.nombre || pat.name || "";
                  const last = pat.usuario?.apellido || pat.apellido || "";
                  const email = pat.correo || pat.email || pat.usuario?.email || "";
                  const label = (name || last) ? `${name} ${last}`.trim() : (email || `Paciente ${pat.id}`);
                  return (
                    <option key={pat.id} value={pat.id}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </label>

            {/* Campo Fecha y Hora */}
            <label className="block">
              <span className="text-gray-700 font-medium">Fecha y Hora *</span>
              <input
                type="datetime-local"
                name="fecha_hora"
                value={formData.fecha_hora}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 p-2"
              />
            </label>

            {/* Campo Consultorio */}
            <label className="block">
              <span className="text-gray-700 font-medium">Consultorio</span>
              <select
                name="id_consultorio"
                value={formData.id_consultorio}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 p-2"
              >
                <option value="">(Opcional)</option>
                {consultorios.map((cons) => (
                  <option key={cons.id} value={cons.id}>
                    {cons.nombre} ({cons.ubicacion})
                  </option>
                ))}
              </select>
            </label>

            {/* Campo Motivo */}
            <label className="block col-span-2">
              <span className="text-gray-700 font-medium">
                Motivo de la Cita *
              </span>
              <input
                type="text"
                name="motivo"
                value={formData.motivo}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 p-2"
              />
            </label>

            {/* Campo Notas */}
            <label className="block col-span-2">
              <span className="text-gray-700 font-medium">
                Notas (Opcional)
              </span>
              <textarea
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50 p-2"
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
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {loading ? "Agendando..." : "Agendar Cita"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default CreateAppointmentModal;
