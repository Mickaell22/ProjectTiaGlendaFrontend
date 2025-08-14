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
  Avatar
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
import { useNavigate } from 'react-router-dom';

// Helpers
function formatDateLocal(dateString) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  } catch {
    return '—';
  }
}

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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleDocs = (paciente) => {
    navigate(`/pacientes/${paciente.id}/documentos`);
  };

  // Filtrar pacientes
  const filteredPacientes = pacientes.filter(p =>
    p.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cedula?.includes(searchTerm) ||
    p.nombre_tutor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.especialidad_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card elevation={3} sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 0, display: 'flex', alignItems: 'center' }}>
          <LocalHospital sx={{ mr: 1 }} />
          Lista de Pacientes
          <Chip 
            label={`${filteredPacientes.length} paciente${filteredPacientes.length !== 1 ? 's' : ''}`} 
            color="primary" 
            size="small" 
            sx={{ ml: 2 }}
          />
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={onNewPatient}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Nuevo Paciente
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar pacientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
        />
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Paciente</TableCell>
            <TableCell>Cédula</TableCell>
            <TableCell>Tutor</TableCell>
            <TableCell>Fecha Ingreso</TableCell>
            <TableCell>Especialidad</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredPacientes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
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
            filteredPacientes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
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
                <TableCell>{p.cedula}</TableCell>
                <TableCell>{p.nombre_tutor || 'Sin tutor'}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <CalendarToday sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                    {formatDateLocal(p.fecha_ingreso)}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={p.especialidad_nombre || 'Sin especialidad'} 
                    color={p.especialidad_nombre ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={p.estado_tratamiento || 'Sin estado'} 
                    color={
                      p.estado_tratamiento === 'activo' ? 'success' :
                      p.estado_tratamiento === 'inactivo' ? 'error' :
                      p.estado_tratamiento === 'finalizado' ? 'info' : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'nowrap' }}>
                    <Tooltip title="Ver Detalles">
                      <IconButton color="primary" onClick={() => onViewDetail(p)} size="small">
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton color="success" onClick={() => onEdit(p)} size="small">
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
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
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
    </Card>
  );
};

export default PacienteLista;