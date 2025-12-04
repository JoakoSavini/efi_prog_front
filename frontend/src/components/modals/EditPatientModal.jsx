import { useState, useEffect } from "react";
import Modal from "./Modal";
import { usePatients } from "../../contexts/usePatients";

const EditPatientModal = ({ isOpen, onClose, patient, onSuccess }) => {
  const { updatePatient, loading: loadingContext, error: contextError } = usePatients();
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    direccion: "",
    numero_historia_clinica: "",
    genero: "",
    grupo_sanguineo: "",
    alergias: "",
    antecedentes: "",
  });
  const [submissionError, setSubmissionError] = useState(null);

  useEffect(() => {
    if (patient) {
      setFormData({
        nombre: patient.nombre || patient.usuario?.nombre || "",
        apellido: patient.apellido || patient.usuario?.apellido || "",
        email: patient.email || patient.usuario?.correo || "",
        telefono: patient.telefono || patient.usuario?.telefono || "",
        direccion: patient.direccion || patient.usuario?.direccion || "",
        numero_historia_clinica: patient.numero_historia_clinica || "",
        genero: patient.genero || "",
        grupo_sanguineo: patient.grupo_sanguineo || "",
        alergias: patient.alergias || "",
        antecedentes: patient.antecedentes || "",
      });
    }
  }, [patient]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError(null);
    if (!patient || !patient.id) {
      setSubmissionError('Paciente inválido');
      return;
    }
    const payload = {
      numero_historia_clinica: formData.numero_historia_clinica,
      telefono: formData.telefono,
      direccion: formData.direccion,
      genero: formData.genero,
      grupo_sanguineo: formData.grupo_sanguineo,
      alergias: formData.alergias,
      antecedentes: formData.antecedentes,
    };

    try {
          console.log('Actualizando paciente con payload:', payload);
          await updatePatient(patient.id, payload);
          if (onSuccess) onSuccess();
          onClose();
        } catch (err) {
          console.error('Error actualizando paciente', err);
          const errMsg = err.response?.data?.message || err.message || contextError || 'Error desconocido';
          setSubmissionError(errMsg);
    }
  };

  const loading = loadingContext;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Paciente">
      {(submissionError || contextError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          {submissionError || contextError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-gray-700">Nombre</span>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
          </label>
          <label className="block">
            <span className="text-gray-700">Apellido</span>
            <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
          </label>
          <label className="block col-span-2">
            <span className="text-gray-700">Email</span>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
          </label>
          <label className="block">
            <span className="text-gray-700">Teléfono</span>
            <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
          </label>
          <label className="block col-span-2">
            <span className="text-gray-700">Dirección</span>
            <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <label className="block">
            <span className="text-gray-700">N° Historia Clínica</span>
            <input type="text" name="numero_historia_clinica" value={formData.numero_historia_clinica} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
          </label>
          <label className="block">
            <span className="text-gray-700">Género</span>
            <select name="genero" value={formData.genero} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
              <option value="">Seleccionar</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </label>
          <label className="block">
            <span className="text-gray-700">Grupo Sanguíneo</span>
            <select name="grupo_sanguineo" value={formData.grupo_sanguineo} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
              <option value="">Seleccionar</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </label>
          <label className="block">
            <span className="text-gray-700">Alergias</span>
            <input type="text" name="alergias" value={formData.alergias} onChange={handleChange} placeholder="Ej: Penicilina, Maní, Latex" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
          </label>
          <label className="block col-span-2">
            <span className="text-gray-700">Antecedentes Médicos</span>
            <textarea name="antecedentes" value={formData.antecedentes} onChange={handleChange} rows="3" placeholder="Ej: Diabetes, Hipertensión, Alergias previas..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
          </label>
        </div>

        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-md">Cancelar</button>
          <button type="submit" disabled={loading} className={`px-4 py-2 text-white rounded-md ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>Guardar</button>
        </div>
      </form>
    </Modal>
  );
};

export default EditPatientModal;
