import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Container, Typography } from "@mui/material";
import ModelsTable from "../../components/ModelsTable";
import patientsService from "../../services/patients";

export default function PatientsTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    { field: "id", headerName: "ID", editable: false },
    { field: "nombre", headerName: "Nombre", editable: true },
    { field: "apellido", headerName: "Apellido", editable: true },
    { field: "email", headerName: "Email", editable: true },
    { field: "telefono", headerName: "Teléfono", editable: true },
    { field: "numero_historia_clinica", headerName: "Historia Clínica", editable: true },
    { field: "genero", headerName: "Género", editable: true, options: [{ value: "M", label: "Masculino" }, { value: "F", label: "Femenino" }, { value: "Otro", label: "Otro" }] },
    { field: "grupo_sanguineo", headerName: "Grupo Sanguíneo", editable: true, options: [{ value: "O+", label: "O+" }, { value: "O-", label: "O-" }, { value: "A+", label: "A+" }, { value: "A-", label: "A-" }, { value: "B+", label: "B+" }, { value: "B-", label: "B-" }, { value: "AB+", label: "AB+" }, { value: "AB-", label: "AB-" }] },
    { field: "creado", headerName: "Creado", editable: false, accessor: (r) => (r.creado ? new Date(r.creado).toLocaleString() : "") },
  ];

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    setLoading(true);
    try {
      // Usar el endpoint de pacientes directamente
      const data = await patientsService.getAll();
      const list = Array.isArray(data) ? data : [];
      // Normalize shape for the table basado en el modelo Paciente
      const normalized = list.map((p) => ({
        id: p.id,
        nombre: p.usuario?.nombre || p.nombre || "",
        apellido: p.usuario?.apellido || "",
        email: p.usuario?.correo || p.usuario?.email || "",
        telefono: p.telefono || p.usuario?.telefono || "",
        direccion: p.direccion || p.usuario?.direccion || "",
        numero_historia_clinica: p.numero_historia_clinica || "",
        genero: p.genero || "",
        grupo_sanguineo: p.grupo_sanguineo || "",
        creado: p.creado || "",
        raw: p,
      }));
      setRows(normalized);
    } catch (err) {
      console.error("Error cargando pacientes:", err);
    } finally {
      setLoading(false);
    }
  }

  function buildPayload(input) {
    // convert table fields back to backend shape expected by pacientes endpoint
    const out = { ...input };
    delete out.id;
    delete out.creado;
    delete out.raw;
    delete out.nombre; // Estos campos se manejan en la tabla usuario
    delete out.apellido;
    delete out.email;
    
    return out;
  }

  async function handleCreate(newData) {
    try {
      const payload = {
        ...buildPayload(newData),
        nombre: newData.nombre,
        apellido: newData.apellido,
        email: newData.email,
      };
      
      // Crear vía el servicio de pacientes
      const created = await patientsService.create(payload);
      if (created && created.id) {
        await loadPatients();
      }
    } catch (err) {
      console.error("Error creando paciente:", err);
      throw err;
    }
  }

  async function handleUpdate(updated) {
    try {
      const id = updated.id;
      const payload = buildPayload(updated);
      
      // Actualizar vía el servicio de pacientes
      const res = await patientsService.update(id, payload);
      if (res) {
        await loadPatients();
      }
    } catch (err) {
      console.error("Error actualizando paciente:", err);
      throw err;
    }
  }

  async function handleDelete(id) {
    try {
      await patientsService.delete(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error eliminando paciente:", err);
      throw err;
    }
  }

  return (
    <Container className="py-4">
      <Box className="mb-4">
        <Typography variant="h5">Pacientes</Typography>
      </Box>

      {loading ? (
        <Box className="flex justify-center py-8">
          <CircularProgress />
        </Box>
      ) : (
        <ModelsTable
          title="Pacientes"
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
