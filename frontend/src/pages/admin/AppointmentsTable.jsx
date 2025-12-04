import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/useAuth";
import { Box, CircularProgress, Container, Typography } from "@mui/material";
import ModelsTable from "../../components/ModelsTable";
import appointmentsService from "../../services/appointments";

export default function AppointmentsTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const role = user?.role;

  let columns = [
    { field: "id", headerName: "ID", editable: false },
    { field: "paciente", headerName: "Paciente", editable: false },
    { field: "medico", headerName: "Médico", editable: false },
    { field: "fecha", headerName: "Fecha", editable: true, accessor: (r) => (r.fecha ? (r.fecha.split ? r.fecha.split('T')[0] : new Date(r.fecha).toISOString().split('T')[0]) : ""), type: "date" },
    { field: "hora", headerName: "Hora", editable: true, type: "time" },
    { field: "estado", headerName: "Estado", editable: true, options: [
      { value: "programada", label: "Programada" },
      { value: "confirmada", label: "Confirmada" },
      { value: "completada", label: "Completada" },
      { value: "cancelada", label: "Cancelada" },
    ] },
    { field: "motivo", headerName: "Motivo", editable: true },
  ];

  // Role-based UI controls
  const isAdmin = role === "admin" || role === "administrador";
  const isDoctor = role === "doctor" || role === "médico" || role === "medico";
  const isPatient = role === "patient" || role === "paciente" || role === "patient";

  // Adjust columns for restricted roles (doctors and patients can only change estado to cancel)
  if (isDoctor || isPatient) {
    // make fecha/hora non-editable
    columns = columns.map((c) => {
      if (c.field === "fecha" || c.field === "hora") return { ...c, editable: false };
      if (c.field === "estado") {
        return {
          ...c,
          editable: true,
          options: [{ value: "cancelada", label: "Cancelada" }],
        };
      }
      return c;
    });
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    setLoading(true);
    try {
      const data = await appointmentsService.getAll();
      const list = Array.isArray(data) ? data : data.items ?? [];
      const normalized = list.map((a) => {
        const fecha = a.fecha || a.fecha_hora || a.date || "";
        const dateObj = fecha ? new Date(fecha) : null;
        const hora = a.hora || a.time || (dateObj ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');
        
        // Obtener nombre del paciente - verificar que tenga datos
        let pacienteName = 'Sin asignar';
        if (a.paciente_id) {
          // Si viene con objeto paciente
          if (a.paciente && typeof a.paciente === 'object') {
            const nombre = a.paciente.usuario?.nombre || a.paciente.nombre || '';
            const apellido = a.paciente.usuario?.apellido || a.paciente.apellido || '';
            pacienteName = `${nombre} ${apellido}`.trim() || 'Sin asignar';
          } else if (a.paciente_nombre) {
            pacienteName = a.paciente_nombre;
          }
        }
        
        // Obtener nombre del médico - verificar que tenga datos
        let medicoName = 'Sin asignar';
        if (a.medico_id) {
          // Si viene con objeto médico
          if (a.medico && typeof a.medico === 'object') {
            const nombre = a.medico.usuario?.nombre || a.medico.nombre || '';
            const apellido = a.medico.usuario?.apellido || a.medico.apellido || '';
            medicoName = `${nombre} ${apellido}`.trim() || 'Sin asignar';
          } else if (a.medico_nombre) {
            medicoName = a.medico_nombre;
          }
        }

        return {
          id: a.id ?? a._id,
          paciente: pacienteName.trim(),
          medico: medicoName.trim(),
          fecha: dateObj ? dateObj.toISOString() : fecha,
          hora: hora,
          estado: a.estado || a.status || '',
          motivo: a.motivo || a.reason || a.descripcion || '',
          raw: a,
        };
      });

      setRows(normalized);
    } catch (err) {
      console.error("Error cargando citas:", err);
    } finally {
      setLoading(false);
    }
  }

  function buildPayload(input) {
    const out = { ...input };
    delete out.id;
    return out;
  }

  async function handleCreate(newData) {
    try {
      // Expectation: admin provides paciente and medico names in table, but API needs IDs.
      // For safety, prevent create from the table (or require raw payload). We'll call API with minimal required fields if present in raw.
      if (newData.raw && (newData.raw.medico_id || newData.raw.paciente_id)) {
        const payload = buildPayload(newData.raw);
        const created = await appointmentsService.create(payload);
        await loadAppointments();
      } else {
        // fallback: reload to reflect no-op
        await loadAppointments();
        throw new Error('Crear citas desde la tabla requiere IDs (medico_id, paciente_id) en el registro. Usa la UI de crear cita.');
      }
    } catch (err) {
      console.error("Error creando cita:", err);
      throw err;
    }
  }

  async function handleUpdate(updated) {
    try {
      const id = updated.id ?? updated._id;
      // Build payload combining date + time into fecha_hora when possible
      const payload = {};
      const fecha = updated.fecha;
      const hora = updated.hora;

      if (fecha && hora) {
        // combine date and time into ISO
        try {
          const iso = new Date(`${fecha}T${hora}`).toISOString();
          payload.fecha_hora = iso;
        } catch (err) {
          payload.fecha_hora = new Date(fecha).toISOString();
        }
      } else if (fecha) {
        payload.fecha_hora = new Date(fecha).toISOString();
      } else if (hora) {
        // if only time updated, try to keep original date from raw
        const original = updated.raw || {};
        const origDate = original.fecha || original.fecha_hora || original.date;
        if (origDate) {
          const d = new Date(origDate);
          const parts = hora.split(":");
          if (parts.length >= 2) {
            d.setHours(Number(parts[0]));
            d.setMinutes(Number(parts[1]));
            payload.fecha_hora = d.toISOString();
          } else {
            payload.hora = hora;
          }
        } else {
          payload.hora = hora;
        }
      }

      if (updated.estado) payload.estado = updated.estado;

      // If user is a doctor, restrict changes: only allow changing estado to 'cancelada'
      if (role === "doctor") {
        // allow only estado change and only to 'cancelada'
        if (updated.estado && updated.estado !== "cancelada") {
          // ignore or throw
          throw new Error("Los doctores sólo pueden marcar citas como canceladas.");
        }
        // build payload only with estado if provided
        const doctorPayload = {};
        if (updated.estado) doctorPayload.estado = "cancelada";
        if (Object.keys(doctorPayload).length === 0) {
          await loadAppointments();
          return;
        }
        await appointmentsService.update(id, doctorPayload);
        await loadAppointments();
        return;
      }

      if (Object.keys(payload).length === 0) {
        await loadAppointments();
        return;
      }

      await appointmentsService.update(id, payload);
      await loadAppointments();
    } catch (err) {
      console.error("Error actualizando cita:", err);
      throw err;
    }
  }

  async function handleDelete(id) {
    try {
      const res = await appointmentsService.delete(id);
      // Remove locally to reflect immediate deletion in UI. Some backends soft-delete (mark cancelada),
      // so avoid reloading which may re-fetch the canceled record.
      setRows((prev) => prev.filter((r) => (r.id ?? r._id) !== id));
      return res;
    } catch (err) {
      console.error("Error eliminando cita:", err);
      throw err;
    }
  }

  return (
    <Container className="py-4">
      <Box className="mb-4">
        <Typography variant="h5">Citas</Typography>
      </Box>

      {loading ? (
        <Box className="flex justify-center py-8">
          <CircularProgress />
        </Box>
      ) : (
        <ModelsTable
          title="Citas"
          columns={columns}
          rows={rows}
          getRowId={(r) => r.id ?? r._id}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          initialPageSize={10}
          // Permissioned controls
          showCreate={isAdmin || isDoctor}
          showEdit={isAdmin || isDoctor || isPatient}
          showDelete={isAdmin}
        />
      )}
    </Container>
  );
}
