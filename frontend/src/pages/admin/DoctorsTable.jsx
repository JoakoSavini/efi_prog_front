import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Container, Typography } from "@mui/material";
import ModelsTable from "../../components/ModelsTable";
import doctorsService from "../../services/doctors";

export default function DoctorsTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState([]);

  const columns = [
    { field: "id", headerName: "ID", editable: false },
    { field: "nombre", headerName: "Nombre", editable: true },
    { field: "apellido", headerName: "Apellido", editable: true },
    { field: "email", headerName: "Email", editable: true },
    { field: "telefono", headerName: "Teléfono", editable: true },
    { field: "matricula", headerName: "Matrícula", editable: true },
    { 
      field: "especialidad", 
      headerName: "Especialidad", 
      editable: true, 
      options: specialties.length > 0 ? specialties.map(s => ({ value: s.id, label: s.nombre })) : [] 
    },
    { field: "horario_inicio", headerName: "Horario Inicio", editable: true },
    { field: "horario_fin", headerName: "Horario Fin", editable: true },
    { field: "estado", headerName: "Estado", editable: true, options: [{ value: true, label: "Activo" }, { value: false, label: "Inactivo" }] },
    { field: "creado", headerName: "Creado", editable: false, accessor: (r) => (r.creado ? new Date(r.creado).toLocaleString() : "") },
  ];

  useEffect(() => {
    loadSpecialties();
    loadDoctors();
  }, []);

  async function loadSpecialties() {
    try {
      const data = await doctorsService.getSpecialties();
      setSpecialties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando especialidades:", err);
    }
  }

  async function loadDoctors() {
    setLoading(true);
    try {
      // Usar el endpoint de médicos directamente
      const data = await doctorsService.getAll();
      const list = Array.isArray(data) ? data : [];
      // Normalize shape for the table basado en el modelo Médico
      const normalized = list
        .filter(d => d.estado === true) // Solo mostrar doctores activos
        .map((d) => ({
          id: d.id,
          nombre: d.usuario?.nombre || d.nombre || "",
          apellido: d.usuario?.apellido || "",
          email: d.usuario?.correo || d.usuario?.email || "",
          telefono: d.usuario?.telefono || "",
          matricula: d.matricula || "",
          especialidad: d.especialidad?.id || d.id_especialidad || "",
          horario_inicio: d.horario_inicio || "",
          horario_fin: d.horario_fin || "",
          estado: d.estado !== undefined ? d.estado : true,
          creado: d.creado || "",
          raw: d, 
        }));
      setRows(normalized);
    } catch (err) {
      console.error("Error cargando doctores:", err);
    } finally {
      setLoading(false);
    }
  }

  function buildPayload(input) {
    // convert table fields back to backend shape expected by medicos endpoints
    const out = { ...input };
    delete out.id;
    delete out.creado;
    delete out.raw;
    
    // Mapear especialidad a especialidad_id
    if (out.especialidad) {
      out.especialidad_id = out.especialidad;
      delete out.especialidad;
    }
    
    return out;
  }

  async function handleCreate(newData) {
    try {
      const payload = buildPayload(newData);
      // Crear vía el servicio de médicos
      const created = await doctorsService.create(payload);
      if (created && created.id) {
        await loadDoctors();
      }
    } catch (err) {
      console.error("Error creando doctor:", err);
      throw err;
    }
  }

  async function handleUpdate(updated) {
    try {
      const id = updated.id;
      const payload = buildPayload(updated);
      
      // Actualizar vía el servicio de médicos
      const res = await doctorsService.update(id, payload);
      if (res) {
        await loadDoctors();
      }
    } catch (err) {
      console.error("Error actualizando doctor:", err);
      throw err;
    }
  }

  async function handleDelete(id) {
    try {
      await doctorsService.delete(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error eliminando doctor:", err);
      throw err;
    }
  }

  return (
    <Container className="py-4">
      <Box className="mb-4">
        <Typography variant="h5">Doctores</Typography>
      </Box>

      {loading ? (
        <Box className="flex justify-center py-8">
          <CircularProgress />
        </Box>
      ) : (
        <ModelsTable
          title="Doctores"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          initialPageSize={10}
        />
      )}
    </Container>
  );
}
