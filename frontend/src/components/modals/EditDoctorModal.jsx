import { useState, useEffect } from "react";
import Modal from "./Modal";
import { useDoctors } from "../../contexts/useDoctors";
import doctorsService from "../../services/doctors";

const EditDoctorModal = ({ isOpen, onClose, doctor, onSuccess }) => {
  const { updateDoctor, loading: loadingContext, error: contextError } = useDoctors();
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    matricula: "",
    especialidad_id: "",
    horario_inicio: "",
    horario_fin: "",
    dias_trabajo: "",
    estado: true,
  });
  const [specialties, setSpecialties] = useState([]);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const loadSpecs = async () => {
      setLoadingSpecs(true);
      try {
        const data = await doctorsService.getSpecialties();
        setSpecialties(data || []);
      } catch (err) {
        console.error('Error cargando especialidades', err);
      } finally {
        setLoadingSpecs(false);
      }
    };
    loadSpecs();
  }, [isOpen]);

  useEffect(() => {
    if (doctor) {
      setFormData({
        nombre: doctor.nombre || (doctor.usuario && doctor.usuario.nombre) || "",
        apellido: doctor.apellido || (doctor.usuario && doctor.usuario.apellido) || "",
        email: doctor.email || (doctor.usuario && doctor.usuario.correo) || "",
        telefono: doctor.telefono || doctor.usuario?.telefono || "",
        matricula: doctor.matricula || "",
        especialidad_id: doctor.especialidad_id || doctor.id_especialidad || doctor.especialidad?.id || "",
        horario_inicio: doctor.horario_inicio || "",
        horario_fin: doctor.horario_fin || "",
        dias_trabajo: doctor.dias_trabajo || "",
        estado: doctor.estado !== undefined ? doctor.estado : true,
      });
    }
  }, [doctor]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError(null);
    if (!doctor || !doctor.id) {
      setSubmissionError('Doctor inválido');
      return;
    }
    const payload = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      telefono: formData.telefono,
      matricula: formData.matricula,
      especialidad_id: formData.especialidad_id,
      horario_inicio: formData.horario_inicio,
      horario_fin: formData.horario_fin,
      dias_trabajo: formData.dias_trabajo,
      estado: formData.estado,
    };

    try {
      console.log('Actualizando doctor con payload:', payload);
      await updateDoctor(doctor.id, payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error actualizando doctor', err);
      const errMsg = err.response?.data?.message || err.message || contextError || 'Error desconocido';
      setSubmissionError(errMsg);
    }
  };

  const loading = loadingContext || loadingSpecs;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Doctor">
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
          <label className="block">
            <span className="text-gray-700">Matrícula</span>
            <input type="text" name="matricula" value={formData.matricula} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
          </label>
          <label className="block col-span-2">
            <span className="text-gray-700">Especialidad</span>
            <select name="especialidad_id" value={formData.especialidad_id} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
              <option value="">Seleccione...</option>
              {specialties.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <label className="block">
            <span className="text-gray-700">Horario Inicio</span>
            <input 
              type="time" 
              name="horario_inicio" 
              value={formData.horario_inicio} 
              onChange={handleChange} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" 
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Horario Fin</span>
            <input 
              type="time" 
              name="horario_fin" 
              value={formData.horario_fin} 
              onChange={handleChange} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" 
            />
          </label>
          <label className="block col-span-2">
            <span className="text-gray-700">Días de Trabajo</span>
            <input 
              type="text" 
              name="dias_trabajo" 
              value={formData.dias_trabajo} 
              onChange={handleChange} 
              placeholder="Ej: Lunes a Viernes, Lunes-Miércoles-Viernes"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" 
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Estado</span>
            <select 
              name="estado" 
              value={formData.estado} 
              onChange={(e) => setFormData(prev => ({...prev, estado: e.target.value === 'true'}))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            >
              <option value={true}>Activo</option>
              <option value={false}>Inactivo</option>
            </select>
          </label>
        </div>

        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-md">Cancelar</button>
          <button type="submit" disabled={loading} className={`px-4 py-2 text-white rounded-md ${loading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'}`}>Guardar</button>
        </div>
      </form>
    </Modal>
  );
};

export default EditDoctorModal;
