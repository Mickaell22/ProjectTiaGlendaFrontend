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
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  Search,
  Add,
  Person,
  Phone,
  Email,
  LocationOn,
  CalendarToday
} from '@mui/icons-material';

// Helper para normalizar búsquedas
function normalize(s = '') {
  return s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Helper para formatear fechas
function formatDateLocal(dateString) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  } catch {
    return '—';
  }
}

// Helper para calcular edad
function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return '—';
  try {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return `${edad} años`;
  } catch {
    return '—';
  }
}

const PersonaLista = ({ 
  personas = [], 
  onEdit, 
  onDelete, 
  onViewDetail, 
  onNewPersona,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filtrar personas
  const filteredPersonas = personas.filter(p => {
    const searchMatch = !searchTerm || 
      normalize(p.nombre).includes(normalize(searchTerm)) ||
      normalize(p.apellido).includes(normalize(searchTerm)) ||
      normalize(`${p.nombre} ${p.apellido}`).includes(normalize(searchTerm)) ||
      p.cedula?.includes(searchTerm) ||
      normalize(p.correo || '').includes(normalize(searchTerm)) ||
      p.telefono?.includes(searchTerm);
    
    const estadoMatch = !filterEstado || p.estado === filterEstado;
    
    return searchMatch && estadoMatch;
  });

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return 'success';
      case 'inactivo':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card elevation={3} sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 0, display: 'flex', alignItems: 'center' }}>
          <Person sx={{ mr: 1 }} />
          Lista de Personas
          <Chip 
            label={`${filteredPersonas.length} persona${filteredPersonas.length !== 1 ? 's' : ''}`} 
            color="primary" 
            size="small" 
            sx={{ ml: 2 }}
          />
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onNewPersona}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Nueva Persona
        </Button>
      </Box>

      {/* Filtros */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por nombre, apellido, cédula, email o teléfono..."
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
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Estado</InputLabel>
            <Select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              label="Estado"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="activo">Activo</MenuItem>
              <MenuItem value="inactivo">Inactivo</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Persona</TableCell>
            <TableCell>Cédula</TableCell>
            <TableCell>Contacto</TableCell>
            <TableCell>Edad</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredPersonas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                <Box>
                  <Search sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {searchTerm || filterEstado ? 'No se encontraron personas' : 'No hay personas registradas'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {searchTerm || filterEstado
                      ? 'Intenta con otros términos de búsqueda o filtros'
                      : 'Comienza agregando la primera persona al sistema'}
                  </Typography>
                  {!searchTerm && !filterEstado && (
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={onNewPersona}
                      sx={{ mt: 2 }}
                    >
                      Agregar Primera Persona
                    </Button>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            filteredPersonas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {`${p.nombre} ${p.apellido}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {p.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {p.cedula || 'Sin cédula'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    {p.telefono && (
                      <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" sx={{ mb: 0.5 }}>
                        <Phone sx={{ fontSize: 12, mr: 0.5 }} />
                        {p.telefono}
                      </Typography>
                    )}
                    {p.correo && (
                      <Typography variant="caption" color="text.secondary" display="flex" alignItems="center">
                        <Email sx={{ fontSize: 12, mr: 0.5 }} />
                        {p.correo}
                      </Typography>
                    )}
                    {!p.telefono && !p.correo && (
                      <Typography variant="caption" color="text.disabled">
                        Sin contacto
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <CalendarToday sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2">
                        {calcularEdad(p.fecha_nacimiento)}
                      </Typography>
                      {p.fecha_nacimiento && (
                        <Typography variant="caption" color="text.secondary">
                          {formatDateLocal(p.fecha_nacimiento)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={p.estado || 'activo'} 
                    color={getEstadoColor(p.estado)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
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
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      <TablePagination
        component="div"
        count={filteredPersonas.length}
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

export default PersonaLista;