// src/views/pacientes/PacienteLista.jsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  IconButton,
  InputAdornment,
  Typography,
  Box,
  Tooltip,
  Chip,
  Avatar,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  Search,
  PersonAdd,
  Description,
  Person,
  LocalHospital,
  CalendarToday
} from '@mui/icons-material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useNavigate } from 'react-router-dom';

/* ---------------- Helpers ---------------- */
const purpleOutlineSX = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'primary.main' },
    '&:hover fieldset': { borderColor: 'primary.main' },
    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
  }
};

function normalize(s = '') {
  return s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function formatDateLocal(dateString) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  } catch {
    return '—';
  }
}

function slug(text = '') {
  return text
    .toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

/**
 * Genera un PDF con la info del paciente.
 * Se hace import dinámico para no cargar jspdf en el bundle si no se usa.
 */
async function exportPacientePDF(paciente) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginX = 48;
  let cursorY = 56;

  // Encabezado
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Centro Tía Glenda', marginX, cursorY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 595 - marginX, cursorY, { align: 'right' });

  cursorY += 24;
  doc.setDrawColor(103, 58, 183); // morado
  doc.setLineWidth(1.2);
  doc.line(marginX, cursorY, 595 - marginX, cursorY);
  cursorY += 24;

  // Título
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Ficha del Paciente', marginX, cursorY);
  cursorY += 18;

  // Ficha (dos columnas)
  const leftColX = marginX;
  const rightColX = 300;

  const field = (label, value, x, y) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(label, x, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(value || '—', x, y + 14);
  };

  field('Nombre completo', paciente?.nombre_completo, leftColX, cursorY);
  field('Cédula', paciente?.cedula, rightColX, cursorY);

  cursorY += 38;
  field('Tutor', paciente?.nombre_tutor, leftColX, cursorY);
  field('Especialidad', paciente?.especialidad_nombre, rightColX, cursorY);

  cursorY += 38;
  field('Fecha de ingreso', formatDateLocal(paciente?.fecha_ingreso), leftColX, cursorY);
  field('Estado tratamiento', paciente?.estado_tratamiento, rightColX, cursorY);

  cursorY += 48;

  // Sección adicionales con tabla (autoTable)
  const adicionales = [
    ['ID', String(paciente?.id ?? '—')],
    ['Teléfono', paciente?.telefono ?? '—'],
    ['Correo', paciente?.correo ?? '—'],
    ['Dirección', paciente?.direccion ?? '—'],
    ['Fecha nacimiento', formatDateLocal(paciente?.fecha_nacimiento)],
    ['Diagnóstico', paciente?.diagnostico ?? '—'],
    ['Observaciones', paciente?.observaciones ?? '—'],
  ].filter(([_, v]) => v && v !== '—'); // omitimos filas totalmente vacías

  if (adicionales.length) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Datos adicionales', marginX, cursorY);
    cursorY += 10;

    autoTable(doc, {
      startY: cursorY + 8,
      margin: { left: marginX, right: marginX },
      head: [['Campo', 'Valor']],
      body: adicionales,
      styles: { font: 'helvetica', fontSize: 10, cellPadding: 6, overflow: 'linebreak' },
      headStyles: { fillColor: [103, 58, 183] }, // morado MUI
      columnStyles: {
        0: { cellWidth: 180 },
        1: { cellWidth: 595 - marginX * 2 - 180 }
      }
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      `Documento generado por el sistema — Página ${i} de ${pageCount}`,
      595 / 2,
      842 - 24,
      { align: 'center' }
    );
  }

  const filename = `Paciente_${paciente?.id ?? ''}_${slug(paciente?.nombre_completo ?? '')}.pdf`;
  doc.save(filename || 'paciente.pdf');
}

/* ---------------- Componente ---------------- */
const PacienteLista = ({
  pacientes = [],
  onEdit,
  onDelete,
  onViewDetail,
  onNewPatient,
  loading = false
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleDocs = (paciente) => {
    navigate(`/pacientes/${paciente.id}/documentos`);
  };

  const handleExportPdf = async (paciente) => {
    try {
      await exportPacientePDF(paciente);
    } catch (err) {
      // En producción podrías usar tu Snackbar aquí
      console.error('Error generando PDF del paciente:', err);
      alert('No se pudo generar el PDF. Revisa la consola para más detalles.');
    }
  };

  // Filtrar pacientes (búsqueda + estado)
  let filteredPacientes = (pacientes || []).filter((p) => {
    const searchOk =
      !searchTerm ||
      normalize(p.nombre_completo).includes(normalize(searchTerm)) ||
      (p.cedula || '').includes(searchTerm) ||
      normalize(p.nombre_tutor || '').includes(normalize(searchTerm)) ||
      normalize(p.especialidad_nombre || '').includes(normalize(searchTerm));

    const estado = normalize(p.estado_tratamiento || '');
    const estadoOk =
      !filterEstado ||
      (filterEstado === 'activo' && estado === 'activo') ||
      (filterEstado === 'inactivo' && estado === 'inactivo') ||
      (filterEstado === 'finalizado' && estado === 'finalizado');

    return searchOk && estadoOk;
  });

  return (
    <Card
      elevation={8}
      sx={{
        borderRadius: 4,
        mb: 4,
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: { xs: '100%', sm: 800, md: 900 },
        mx: 'auto'
      }}
    >
      {/* Header morado estilo unificado */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #7e57c2 0%, #673ab7 100%)',
          color: 'white',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center">
            <LocalHospital sx={{ mr: 1 }} />
            Lista de Pacientes
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Busca, filtra por estado y gestiona los pacientes
          </Typography>
        </Box>

        <Chip
          label={`${filteredPacientes.length} paciente${filteredPacientes.length !== 1 ? 's' : ''}`}
          color="default"
          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
          size="small"
        />
      </Box>

      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        {/* Toolbar (búsqueda + filtro estado + botón nuevo) */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
            flexWrap: 'nowrap',
            overflowX: 'auto',
            pb: 1,
            '& > *': { flex: '0 0 auto' }
          }}
        >
          <TextField
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, cédula, tutor o especialidad..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
            sx={{
              ...purpleOutlineSX,
              minWidth: 260,
              flex: '1 1 380px'
            }}
          />

          <FormControl size="small" sx={{ ...purpleOutlineSX, width: 180 }}>
            <Select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              displayEmpty
              renderValue={(val) =>
                val === ''
                  ? 'Todos'
                  : val === 'activo'
                  ? 'Activo'
                  : val === 'inactivo'
                  ? 'Inactivo'
                  : 'Finalizado'
              }
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="activo">Activo</MenuItem>
              <MenuItem value="inactivo">Inactivo</MenuItem>
              <MenuItem value="finalizado">Finalizado</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={onNewPatient}
            sx={{ height: 40, px: 2 }}
            disabled={loading}
          >
            Nuevo Paciente
          </Button>
        </Box>

        {/* Tabla con scroll horizontal y ancho mínimo para que quepan las acciones */}
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 980 }}>
            <TableHead>
              <TableRow>
                <TableCell>Paciente</TableCell>
                <TableCell>Cédula</TableCell>
                <TableCell>Tutor</TableCell>
                <TableCell>Fecha Ingreso</TableCell>
                <TableCell>Especialidad</TableCell>
                {/* Estado eliminado */}
                <TableCell sx={{ whiteSpace: 'nowrap', minWidth: 260 /* +40 para el nuevo botón */ }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPacientes.length === 0 ? (
                <TableRow>
                  {/* colSpan ajustado a 6 por eliminación de la columna Estado */}
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Box>
                      <Search sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        {searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {searchTerm
                          ? 'Intenta con otros términos de búsqueda'
                          : 'Comienza agregando el primer paciente al sistema'}
                      </Typography>
                      {!searchTerm && (
                        <Button
                          variant="contained"
                          startIcon={<PersonAdd />}
                          onClick={onNewPatient}
                          sx={{ mt: 2 }}
                        >
                          Agregar Primer Paciente
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPacientes
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((p) => (
                    <TableRow key={p.id}>
                      {/* Paciente */}
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: '#7e57c2' }}>
                            <Person />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {p.nombre_completo}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {p.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Cédula */}
                      <TableCell>
                        <Typography variant="body2" color="text.primary">
                          {p.cedula || '—'}
                        </Typography>
                      </TableCell>

                      {/* Tutor */}
                      <TableCell>
                        <Typography variant="body2" color="text.primary">
                          {p.nombre_tutor || 'Sin tutor'}
                        </Typography>
                      </TableCell>

                      {/* Fecha Ingreso */}
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <CalendarToday sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.primary">
                            {formatDateLocal(p.fecha_ingreso)}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Especialidad */}
                      <TableCell>
                        <Chip
                          label={p.especialidad_nombre || 'Sin especialidad'}
                          color={p.especialidad_nombre ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>

                      {/* Acciones */}
                      <TableCell sx={{ whiteSpace: 'nowrap', minWidth: 260 }}>
                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'nowrap' }}>
                          <Tooltip title="Ver Detalles">
                            <IconButton color="info" onClick={() => onViewDetail(p)} size="small">
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton color="primary" onClick={() => onEdit(p)} size="small">
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton color="error" onClick={() => onDelete(p.id)} size="small">
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Documentos">
                            <IconButton color="info" onClick={() => handleDocs(p)} size="small">
                              <Description fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {/* NUEVO: Exportar PDF */}
                          <Tooltip title="Exportar PDF">
                            <IconButton color="secondary" onClick={() => handleExportPdf(p)} size="small">
                              <PictureAsPdfIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </Box>

        {/* Paginación */}
        <TablePagination
          component="div"
          count={filteredPacientes.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </CardContent>
    </Card>
  );
};

export default PacienteLista;
