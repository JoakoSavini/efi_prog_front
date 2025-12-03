import { useState, useEffect } from "react";
import Modal from "./Modal";
import { useAppointments } from "../../contexts/useAppointments";
import { useAuth } from "../../contexts/useAuth";
import doctorsService from "../../services/doctors";
import patientsService from "../../services/patients";
import consultoriosService from "../../services/consultorios";

const EditAppointmentModal = ({ isOpen, onClose, appointment, onSuccess }) => {
  const { user } = useAuth();
  const { updateAppointment, loading: loadingContext, error: contextError } = useAppointments();
  const [formData, setFormData] = useState({
    id_medico: "",
    id_paciente: "",
    id_consultorio: "",
    fecha_hora: "",
    motivo: "",
    notas: "",
    estado: "",
  });

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [consultorios, setConsultorios] = useState([]);
  const [loadingMasters, setLoadingMasters] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  // Detectar rol del usuario
  const isDoctor = user?.role === "doctor" || user?.role === "médico" || user?.role === "medico";
  const isAdmin = user?.role === "admin" || user?.role === "administrador";

  useEffect(() => {
    if (!isOpen) return;
    const loadMasters = async () => {
      setLoadingMasters(true);
      try {
        const docs = await doctorsService.getAll();
        setDoctors(docs || []);
        const pats = await patientsService.getAll();
        setPatients(pats || []);
        const cons = await consultoriosService.getAll();
        setConsultorios(cons || []);
      } catch (err) {
        console.error("Error cargando listas maestras:", err);
        setSubmissionError(err.message || "Error cargando datos maestros");
      } finally {
        setLoadingMasters(false);
      }
    };
    loadMasters();
  }, [isOpen]);

  useEffect(() => {
    if (appointment) {
      setFormData({
        id_medico: appointment.id_medico || appointment.medico_id || appointment.id_medico || "",
        id_paciente: appointment.id_paciente || appointment.paciente_id || appointment.id_paciente || "",
        id_consultorio: appointment.id_consultorio || appointment.consultorio_id || "",
        fecha_hora: appointment.fecha_hora || appointment.fecha || "",
        motivo: appointment.motivo || appointment.reason || "",
        notas: appointment.notas || appointment.notes || "",
        estado: appointment.estado || appointment.status || "",
      });
    }
  }, [appointment]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name.startsWith("id_") ? Number(value) : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError(null);
    if (!appointment || !appointment.id) {
      setSubmissionError("Cita inválida");
      return;
    }

    // Para doctores, solo permitir cambiar estado a confirmada o cancelada
    let payload = {};
    
    if (isDoctor) {
      // Doctor: solo puede confirmar (confirmada) o rechazar (cancelada)
      payload = {
        estado: formData.estado,
      };
    } else {
      // Admin: puede editar todos los campos
      payload = {
        medico_id: formData.id_medico,
        paciente_id: formData.id_paciente,
        consultorio_id: formData.id_consultorio,
        fecha_hora: formData.fecha_hora ? new Date(formData.fecha_hora).toISOString() : "",
        motivo: formData.motivo,
        notas: formData.notas,
        estado: formData.estado,
      };
    }

    try {
      console.log('Actualizando cita con payload:', payload);
      await updateAppointment(appointment.id, payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Error actualizando cita:", err);
      setSubmissionError(err.response?.data?.message || err.message || contextError || "Error desconocido");
    }
  };

  const loading = loadingContext || loadingMasters;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Cita" size="max-w-2xl">
      {(submissionError || contextError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          {submissionError || contextError}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando...</div>
      ) : isDoctor ? (
        // Vista simplificada para doctores: solo confirmar/rechazar
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm text-blue-800">
              <strong>Paciente:</strong> {appointment?.paciente_nombre || appointment?.paciente?.nombre || `Paciente ${appointment?.id_paciente}`}
            </p>
            <p className="text-sm text-blue-800 mt-2">
              <strong>Fecha y Hora:</strong> {appointment?.fecha_hora ? new Date(appointment.fecha_hora).toLocaleString('es-ES') : appointment?.fecha ? new Date(appointment.fecha).toLocaleString('es-ES') : 'No especificada'}
            </p>
            <p className="text-sm text-blue-800 mt-2">
              <strong>Motivo:</strong> {appointment?.motivo || 'No especificado'}
            </p>
          </div>

          {submissionError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
              {submissionError}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={async () => {
                setSubmissionError(null);
                try {
                  console.log('Doctor rechazando cita:', appointment.id);
                  await updateAppointment(appointment.id, { estado: 'cancelada' });
                  if (onSuccess) onSuccess();
                  onClose();
                } catch (err) {
                  console.error('Error rechazando cita:', err);
                  setSubmissionError(err.response?.data?.message || err.message || 'Error al rechazar la cita');
                }
              }}
              disabled={loadingContext}
              className={`flex-1 px-4 py-2 text-white rounded-md font-medium ${loadingContext ? 'bg-red-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
            >
              {loadingContext ? 'Procesando...' : 'Rechazar Cita'}
            </button>
            <button
              type="button"
              onClick={async () => {
                setSubmissionError(null);
                try {
                  console.log('Doctor confirmando cita:', appointment.id);
                  await updateAppointment(appointment.id, { estado: 'confirmada' });
                  if (onSuccess) onSuccess();
                  onClose();
                } catch (err) {
                  console.error('Error confirmando cita:', err);
                  setSubmissionError(err.response?.data?.message || err.message || 'Error al confirmar la cita');
                }
              }}
              disabled={loadingContext}
              className={`flex-1 px-4 py-2 text-white rounded-md font-medium ${loadingContext ? 'bg-green-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
            >
              {loadingContext ? 'Procesando...' : 'Confirmar Cita'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : (
        // Vista completa para admins
        <form onSubmit={handleSubmit} className="space-y-6">
          {(submissionError || contextError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              {submissionError || contextError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-gray-700 font-medium">Médico *</span>
              <select name="id_medico" value={formData.id_medico} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
                <option value="" disabled>Seleccione un Médico</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.usuario ? `${d.usuario.nombre} ${d.usuario.apellido}` : d.nombre || `Dr ${d.id}`}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">Paciente *</span>
              <select name="id_paciente" value={formData.id_paciente} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
                <option value="" disabled>Seleccione un Paciente</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.usuario ? `${p.usuario.nombre} ${p.usuario.apellido}` : p.nombre || `Paciente ${p.id}`}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">Fecha y Hora *</span>
              <input type="datetime-local" name="fecha_hora" value={formData.fecha_hora} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">Consultorio</span>
              <select name="id_consultorio" value={formData.id_consultorio} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
                <option value="">(Opcional)</option>
                {consultorios.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre} ({c.ubicacion})</option>
                ))}
              </select>
            </label>

            <label className="block col-span-2">
              <span className="text-gray-700 font-medium">Motivo *</span>
              <input type="text" name="motivo" value={formData.motivo} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
            </label>

            <label className="block col-span-2">
              <span className="text-gray-700 font-medium">Notas (Opcional)</span>
              <textarea name="notas" value={formData.notas} onChange={handleChange} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
            </label>

            <label className="block col-span-2">
              <span className="text-gray-700 font-medium">Estado</span>
              <select name="estado" value={formData.estado} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
                <option value="">Seleccione...</option>
                <option value="programada">Programada</option>
                <option value="confirmada">Confirmada</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </label>
          </div>

          <div className="flex justify-end pt-4 space-x-3 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">Cancelar</button>
            <button type="submit" disabled={loadingContext} className={`px-4 py-2 text-sm font-medium text-white rounded-md ${loadingContext ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}>{loadingContext ? 'Actualizando...' : 'Actualizar Cita'}</button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default EditAppointmentModal;
