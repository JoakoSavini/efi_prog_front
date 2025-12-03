import React, { useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { exportTable } from "../utils/exportPDF";

// Props:
// - columns: [{ field: 'name', headerName: 'Nombre', render?: (row)=>..., editable?: true }]
// - rows: array of objects
// - getRowId: (row)=>id (default row.id)
// - onCreate, onUpdate, onDelete: callbacks
// - initialPageSize: number

export default function ModelsTable({
  columns,
  rows,
  getRowId = (r) => r.id,
  onCreate = async () => {},
  onUpdate = async () => {},
  onDelete = async () => {},
  initialPageSize = 10,
  title = "Modelos",
  showCreate = true,
  showEdit = true,
  showDelete = true,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialPageSize);

  const [editOpen, setEditOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formState, setFormState] = useState({});
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (selectedId != null && !rows.find((r) => getRowId(r) === selectedId)) {
      setSelectedId(null);
    }
  }, [rows, selectedId, getRowId]);

  const selectedRow = useMemo(
    () => rows.find((r) => selectedId != null && getRowId(r) === selectedId) || null,
    [rows, selectedId, getRowId]
  );

  function handleSelectRow(row) {
    const id = getRowId(row);
    setSelectedId((prev) => (prev === id ? null : id));
  }

  function handleOpenCreate() {
    setEditingRow(null);
    const initial = {};
    columns.forEach((c) => {
      initial[c.field] = c.default ?? "";
    });
    setFormState(initial);
    setEditOpen(true);
  }

  function handleOpenEdit() {
    if (!selectedRow) return;
    setEditingRow(selectedRow);
    const initial = {};
    columns.forEach((c) => {
      initial[c.field] = typeof c.accessor === "function" ? c.accessor(selectedRow) : selectedRow[c.field];
      if (initial[c.field] === undefined) initial[c.field] = "";
    });
    setFormState(initial);
    setEditOpen(true);
  }

  async function handleSave() {
    if (editingRow) {
      const updated = { ...editingRow, ...formState };
      await onUpdate(updated);
    } else {
      await onCreate(formState);
    }
    setEditOpen(false);
    setEditingRow(null);
  }

  function handleChangeField(field, value) {
    setFormState((s) => ({ ...s, [field]: value }));
  }

  function handleOpenDelete() {
    if (!selectedRow) return;
    setDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    if (!selectedRow) return;
    await onDelete(getRowId(selectedRow));
    setDeleteOpen(false);
    setSelectedId(null);
  }

  const handleExportCSV = async () => {
    await exportTable({ columns, rows, title });
  };

  const visibleRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const isRowSelected = (r) => selectedId != null && getRowId(r) === selectedId;

  return (
    <Paper className="p-4">
      <Toolbar className="flex justify-between">
        <Typography variant="h6">{title}</Typography>
          <Box className="flex gap-2">
          {showCreate && (
            <Tooltip title="Crear">
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                Crear
              </Button>
            </Tooltip>
          )}
          {showEdit && (
            <Tooltip title="Editar">
              <span>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleOpenEdit}
                  disabled={!selectedRow}
                >
                  Editar
                </Button>
              </span>
            </Tooltip>
          )}
          {showDelete && (
            <Tooltip title="Eliminar">
              <span>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleOpenDelete}
                  disabled={!selectedRow}
                >
                  Eliminar
                </Button>
              </span>
            </Tooltip>
          )}
          <Tooltip title="Exportar PDF">
            <IconButton onClick={handleExportCSV}>
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      <TableContainer>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell />
              {columns.map((col) => (
                <TableCell key={col.field}>{col.headerName ?? col.field}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map((row) => {
              const id = getRowId(row);
              const selected = isRowSelected(row);
              return (
                <TableRow
                  key={id}
                  hover
                  selected={selected}
                  onClick={() => handleSelectRow(row)}
                  className="cursor-pointer"
                >
                  <TableCell padding="checkbox">
                    {selected ? "✓" : ""}
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={col.field}>
                      {col.render
                        ? col.render(row)
                        : typeof col.accessor === "function"
                        ? col.accessor(row)
                        : row[col.field]}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
            {visibleRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + 1}>
                  <Box className="py-4 text-center text-gray-500">No hay registros</Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={rows.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      {/* Edit / Create Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingRow ? "Editar" : "Crear"}</DialogTitle>
        <DialogContent dividers>
          <Box className="flex flex-col gap-3">
            {columns
              .filter((c) => c.editable !== false)
              .map((col) => {
                const value = formState[col.field] ?? "";
                if (Array.isArray(col.options) && col.options.length > 0) {
                  return (
                    <TextField
                      key={col.field}
                      select
                      label={col.headerName ?? col.field}
                      value={value}
                      onChange={(e) => handleChangeField(col.field, e.target.value)}
                      fullWidth
                      variant="outlined"
                    >
                      {col.options.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  );
                }

                return (
                  <TextField
                    key={col.field}
                    label={col.headerName ?? col.field}
                    value={value}
                    onChange={(e) => handleChangeField(col.field, e.target.value)}
                    fullWidth
                    type={col.type ?? "text"}
                    variant="outlined"
                  />
                );
              })}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent dividers>
          <Typography>
            ¿Eliminar el registro seleccionado?
          </Typography>
          {selectedRow && (
            <Box className="mt-3">
              {columns.slice(0, 3).map((c) => (
                <Typography key={c.field} variant="body2">
                  <strong>{c.headerName ?? c.field}:</strong>{" "}
                  {typeof c.accessor === "function" ? c.accessor(selectedRow) : selectedRow[c.field]}
                </Typography>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>No</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>
            Sí, eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

ModelsTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      headerName: PropTypes.string,
      render: PropTypes.func,
      accessor: PropTypes.func,
      editable: PropTypes.bool,
      default: PropTypes.any,
      type: PropTypes.string,
    })
  ).isRequired,
  rows: PropTypes.array.isRequired,
  getRowId: PropTypes.func,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
  initialPageSize: PropTypes.number,
  title: PropTypes.string,
};