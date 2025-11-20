import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Container, Typography } from "@mui/material";
import ModelsTable from "../../components/ModelsTable";
import patientsService from "../../services/patients";

export default function TableViewPatient() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    { field: "id", headerName: "ID", editable: false },
    { field: "numero_historia_clinica", headerName: "N° Historia", editable: true },
    { field: "fecha_nacimiento", headerName: "Fecha Nac.", editable: true, type: "date", accessor: (r) => (r.fecha_nacimiento ? r.fecha_nacimiento.split("T")[0] : "") },
    { field: "genero", headerName: "Género", editable: true },
    { field: "telefono", headerName: "Teléfono", editable: true },
    { field: "direccion", headerName: "Dirección", editable: true },
    { field: "grupo_sanguineo", headerName: "Grupo Sanguíneo", editable: true },
    { field: "alergias", headerName: "Alergias", editable: true },
    { field: "antecedentes", headerName: "Antecedentes", editable: true },
    { field: "id_usuario", headerName: "ID Usuario", editable: false },
    { field: "creado", headerName: "Creado", editable: false, accessor: (r) => (r.creado ? new Date(r.creado).toLocaleString() : "") },
    { field: "actualizado", headerName: "Actualizado", editable: false, accessor: (r) => (r.actualizado ? new Date(r.actualizado).toLocaleString() : "") },
  ];

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    setLoading(true);
    try {
      const data = await patientsService.getAll();
      const list = Array.isArray(data) ? data : data.items ?? [];
      setRows(list);
    } catch (err) {
      console.error("Error cargando pacientes:", err);
    } finally {
      setLoading(false);
    }
  }

  function buildPayload(input) {
    const out = { ...input };
    delete out.id;
    delete out.creado;
    delete out.actualizado;
    return out;
  }

  async function handleCreate(newData) {
    try {
      const payload = buildPayload(newData);
      if (payload.fecha_nacimiento && payload.fecha_nacimiento.length === 10) {
        payload.fecha_nacimiento = payload.fecha_nacimiento; 
      }
      const created = await patientsService.create(payload);
      if (created && created.id) {
        setRows((prev) => [created, ...prev]);
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
      if (payload.fecha_nacimiento && payload.fecha_nacimiento.length === 10) {
        payload.fecha_nacimiento = payload.fecha_nacimiento;
      }
      const res = await patientsService.update(id, payload);
      if (res && (res.id ?? res._id)) {
        setRows((prev) => prev.map((r) => {
          const rid = r.id ?? r._id;
          return rid === (res.id ?? res._id) ? res : r;
        }));
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
      await patientsService.delete(id);
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