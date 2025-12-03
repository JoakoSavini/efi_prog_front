import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Container, Typography } from "@mui/material";
import ModelsTable from "../../components/ModelsTable";
import doctorsService from "../../services/doctors";
import usersService from "../../services/users";

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
    { 
      field: "especialidad", 
      headerName: "Especialidad", 
      editable: true, 
      options: specialties.length > 0 ? specialties.map(s => ({ value: s.id, label: s.nombre })) : [] 
    },
    { field: "usuario_id", headerName: "ID Usuario", editable: false },
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
      // Prefer users endpoint filtered by role if available
      const data = await usersService.getAll({ rol: "médico" });
      const list = Array.isArray(data) ? data : data.items ?? [];
      // Normalize shape for the table
      const normalized = list.map((d) => ({
        id: d.id ?? d._id,
        nombre: d.nombre || d.usuario?.nombre || "",
        apellido: d.apellido || d.usuario?.apellido || "",
        email: d.correo || d.email || d.usuario?.email || "",
        telefono: d.telefono || d.usuario?.telefono || "",
        especialidad: d.especialidad?.id || d.especialidad_id || "",
        usuario_id: d.usuario_id || d.usuario?.id || "",
        creado: d.creado || d.created_at || d.createdAt || "",
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
    // convert table fields back to backend shape expected by users/medicos endpoints
    const out = { ...input };
    delete out.id;
    delete out.creado;
    delete out.raw;
    // Convert email field to correo for backend compatibility
    if (out.email) {
      out.correo = out.email;
      delete out.email;
    }
    return out;
  }

  async function handleCreate(newData) {
    try {
      const payload = buildPayload(newData);
      // Create via users service to ensure consistent listing
      const created = await usersService.create({ ...payload, rol: "médico" });
      if (created && (created.id || created._id)) {
        await loadDoctors();
      } else {
        await loadDoctors();
      }
    } catch (err) {
      console.error("Error creando doctor:", err);
      throw err;
    }
  }

  async function handleUpdate(updated) {
    try {
      const id = updated.id ?? updated._id;
      const payload = buildPayload(updated);
      // Convertir especialidad_id si viene como ID
      const updatePayload = {
        ...payload,
        rol: "médico",
      };
      if (payload.especialidad) {
        updatePayload.especialidad_id = payload.especialidad;
        delete updatePayload.especialidad;
      }
      const res = await usersService.update(id, updatePayload);
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
      await usersService.delete(id);
      setRows((prev) => prev.filter((r) => (r.id ?? r._id) !== id));
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
          getRowId={(r) => r.id ?? r._id}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          initialPageSize={10}
        />
      )}
    </Container>
  );
}
