// src/views/personas/PersonaLista.jsx
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
  Stack,
  Avatar,
  Tooltip,
  Typography,
  Box,
  Chip,
  useTheme
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  Search,
  Add,
  Person,
  Phone,
  CalendarToday
} from '@mui/icons-material';

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

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return '—';
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  if (isNaN(nac.getTime())) return '—';
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return `${edad} años`;
}


/* ---------------- Componente ---------------- */
const PersonaLista = ({
  personas = [],
  onEdit,
  onDelete,
  onViewDetail,
  onNewPersona,
  loading = false
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  let filteredPersonas = (personas || []).filter((p) => {
    const nombre = p.nombre || p.nombres || '';
    const apellido = p.apellido || p.apellidos || '';
    const telefono = p.telefono || '';

    const search =
      !searchTerm ||
      normalize(nombre).includes(normalize(searchTerm)) ||
      normalize(apellido).includes(normalize(searchTerm)) ||
      normalize(`${nombre} ${apellido}`).includes(normalize(searchTerm)) ||
      (p.cedula || '').includes(searchTerm) ||
      (telefono || '').includes(searchTerm);

    return search;
  });

  return (
    <Card
      elevation={8}
      sx={{
        borderRadius: 4,
        mb: 4,
        backgroundColor: 'background.paper',
        overflow: 'hidden',
        width: '100%',
        maxWidth: { xs: '100%', sm: 800, md: 900 },
        mx: 'auto',
        border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center">
            <Person sx={{ mr: 1 }} />
            Lista de Personas
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Filtra por nombre y estado y gestiona las personas del sistema
          </Typography>
        </Box>

        <Chip
          label={`${filteredPersonas.length} persona${filteredPersonas.length !== 1 ? 's' : ''}`}
          color="default"
          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
          size="small"
        />
      </Box>

      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        {/* Toolbar */}
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
            placeholder="Buscar por nombre, apellido, cédula o teléfono..."
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
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={onNewPersona}
            sx={{ height: 40, px: 2, bgcolor: theme.palette.primary.main, color: theme.palette.getContrastText(theme.palette.primary.main), '&:hover': { bgcolor: theme.palette.primary.dark } }}
          >
            Nueva Persona
          </Button>
        </Box>

        {/* Tabla */}
        <Table
          sx={{
            '& .MuiTableHead-root': {
              backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[50]
            }
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Persona</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Cédula</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Contacto</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Edad</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPersonas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No hay personas registradas
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredPersonas
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((p) => {
                  const nombre = p.nombre || p.nombres || '';
                  const apellido = p.apellido || p.apellidos || '';
                  const telefono = p.telefono || '';

                  return (
                    <TableRow
                      key={p.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.04)'
                        }
                      }}
                    >
                      {/* Persona */}
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                            <Person />
                          </Avatar>
                          <Typography variant="body2" fontWeight="bold">
                            {`${nombre} ${apellido}`.trim() || '—'}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Cédula */}
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {p.cedula || '—'}
                        </Typography>
                      </TableCell>

                      {/* Contacto: SOLO teléfono */}
                      <TableCell>
                        {telefono ? (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="flex"
                            alignItems="center"
                          >
                            <Phone sx={{ fontSize: 12, mr: 0.5 }} />
                            {telefono}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            Sin teléfono
                          </Typography>
                        )}
                      </TableCell>

                      {/* Edad: SOLO edad */}
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <CalendarToday sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {calcularEdad(p.fecha_nacimiento)}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Acciones */}
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Ver detalles">
                            <IconButton color="info" size="small" onClick={() => onViewDetail(p)}>
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton color="primary" size="small" onClick={() => onEdit(p)}>
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton color="error" size="small" onClick={() => onDelete(p.id)}>
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
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
      </CardContent>
    </Card>
  );
};

export default PersonaLista;
