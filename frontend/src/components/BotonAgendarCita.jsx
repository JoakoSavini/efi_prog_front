import React, { useState, useEffect } from "react";

// URL base de la API (Asumiendo que se configura en http://localhost:3000/api)
const API_BASE_URL = "http://localhost:3000/api";

const BotonAgendarCita = ({ token, pacienteId }) => {
  // 1. Estado para almacenar las opciones del formulario (médicos y especialidades)
  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [formData, setFormData] = useState({
    medicoId: "",
    fecha: "",
    hora: "",
  });
  const [mensaje, setMensaje] = useState("");

  // --- PREREQUISITO: Consumir API para obtener Médicos y Especialidades ---
  // (Necesario para poblar las opciones de selección en el formulario)
  useEffect(() => {
    const fetchOpciones = async () => {
      if (!token) return;

      try {
        // Endpoint para Especialidades: /api/especialidades [3]
        const [resMedicos, resEspecialidades] = await Promise.all([
          fetch(`${API_BASE_URL}/medicos`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/especialidades`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (resMedicos.ok) setMedicos(await resMedicos.json());
        if (resEspecialidades.ok)
          setEspecialidades(await resEspecialidades.json());
      } catch (error) {
        console.error("Error al cargar opciones:", error);
      }
    };
    fetchOpciones();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- FUNCIÓN CLAVE: Agendar la Cita ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("Agendando cita...");

    // El payload debe incluir el ID del paciente, ya sea extraído del token o pasado como prop.
    const citaPayload = {
      pacienteId: pacienteId,
      medicoId: formData.medicoId,
      fechaCita: `${formData.fecha}T${formData.hora}:00Z`, // Formato de fecha/hora
    };

    try {
      // 2. Realizar la solicitud POST al endpoint de Citas [3]
      const response = await fetch(`${API_BASE_URL}/citas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(citaPayload),
      });

      if (response.ok) {
        setMensaje("Cita agendada con éxito!");
        setFormData({ medicoId: "", fecha: "", hora: "" }); // Limpiar formulario
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al agendar la cita.");
      }
    } catch (error) {
      setMensaje(`Fallo al agendar: ${error.message}`);
      console.error(error);
    }
  };

  // --- Renderizado del Formulario ---
  return (
    <div className="card">
      <h3>Agendar Nueva Cita</h3>
      <form onSubmit={handleSubmit}>
        <label>Especialidad (Ejemplo de filtro):</label>
        <select>
          {especialidades.map((esp) => (
            <option key={esp.id} value={esp.id}>
              {esp.nombre}
            </option>
          ))}
        </select>

        <label>Médico:</label>
        <select
          name="medicoId"
          value={formData.medicoId}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione un médico</option>
          {medicos.map((med) => (
            <option key={med.id} value={med.id}>
              {med.nombre} ({med.especialidad})
            </option>
          ))}
        </select>

        <label>Fecha:</label>
        <input
          type="date"
          name="fecha"
          value={formData.fecha}
          onChange={handleChange}
          required
        />

        <label>Hora:</label>
        <input
          type="time"
          name="hora"
          value={formData.hora}
          onChange={handleChange}
          required
        />

        <button type="submit">Agendar Cita</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default BotonAgendarCita;
