import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Container, Typography } from "@mui/material";
import ModelsTable from "../../components/ModelsTable";
import usersService from "../../services/users";

export default function PatientsTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    { field: "id", headerName: "ID", editable: false },
    { field: "nombre", headerName: "Nombre", editable: true },
    { field: "apellido", headerName: "Apellido", editable: true },
    { field: "email", headerName: "Email", editable: true },
    { field: "telefono", headerName: "Teléfono", editable: true },
    { field: "direccion", headerName: "Dirección", editable: true },
    { field: "usuario_id", headerName: "ID Usuario", editable: false },
    { field: "creado", headerName: "Creado", editable: false, accessor: (r) => (r.creado ? new Date(r.creado).toLocaleString() : "") },
  ];

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    setLoading(true);
    try {
      // Use users endpoint filtered by role
      const data = await usersService.getAll({ rol: "paciente" });
      const list = Array.isArray(data) ? data : data.items ?? [];
      // Normalize shape for the table
      const normalized = list.map((p) => ({
        id: p.id ?? p._id,
        nombre: p.nombre || p.usuario?.nombre || "",
        apellido: p.apellido || p.usuario?.apellido || "",
        email: p.correo || p.email || p.usuario?.email || "",
        telefono: p.telefono || p.usuario?.telefono || "",
        direccion: p.direccion || p.usuario?.direccion || "",
        usuario_id: p.usuario_id || p.usuario?.id || "",
        creado: p.creado || p.created_at || p.createdAt || "",
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
    // convert table fields back to backend shape expected by users endpoint
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
      const created = await usersService.create({ ...payload, rol: "paciente" });
      if (created && (created.id || created._id)) {
        await loadPatients();
      } else {
        await loadPatients();
      }
    } catch (err) {
      console.error("Error creando paciente:", err);
      throw err;
    }
  }

  async function handleUpdate(updated) {
    try {
      const id = updated.id ?? updated._id;
      const payload = buildPayload(updated);
      const res = await usersService.update(id, { ...payload, rol: "paciente" });
      if (res && (res.id ?? res._id)) {
        await loadPatients();
      } else {
        await loadPatients();
      }
    } catch (err) {
      console.error("Error actualizando paciente:", err);
      throw err;
    }
  }

  async function handleDelete(id) {
    try {
      await usersService.delete(id);
      setRows((prev) => prev.filter((r) => (r.id ?? r._id) !== id));
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
