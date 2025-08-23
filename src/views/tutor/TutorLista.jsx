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
  Person,
  FamilyRestroom,
  Phone,
  Email
} from '@mui/icons-material';

const purpleOutlineSX = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'primary.main' },
    '&:hover fieldset': { borderColor: 'primary.main' },
    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
  }
};

const TutorLista = ({
  tutores = [],
  onEdit,
  onDelete,
  onViewDetail,
  onNewTutor,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filtrar tutores
  const filteredTutores = tutores.filter((t) =>
    (t.nombre_completo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.cedula || '').includes(searchTerm) ||
    (t.parentesco || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.telefono || '').includes(searchTerm) ||
    (t.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      {/* Header morado estilo PersonalLista */}
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
            <FamilyRestroom sx={{ mr: 1 }} />
            Lista de Tutores
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Busca y gestiona los tutores registrados
          </Typography>
        </Box>

        <Chip
          label={`${filteredTutores.length} tutor${filteredTutores.length !== 1 ? 'es' : ''}`}
          color="default"
          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
          size="small"
        />
      </Box>

      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        {/* Toolbar (búsqueda + botón nuevo) */}
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
            placeholder="Buscar por nombre, cédula, correo, parentesco o teléfono..."
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
            startIcon={<PersonAdd />}
            onClick={onNewTutor}
            sx={{ height: 40, px: 2 }}
          >
            Nuevo Tutor
          </Button>
        </Box>

        {/* Tabla (contenedor con scroll horizontal) */}
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tutor</TableCell>
                <TableCell>Cédula</TableCell>
                <TableCell>Parentesco</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredTutores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Box>
                      <Search sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        {searchTerm ? 'No se encontraron tutores' : 'No hay tutores registrados'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {searchTerm
                          ? 'Intenta con otros términos de búsqueda'
                          : 'Comienza agregando el primer tutor al sistema'}
                      </Typography>
                      {!searchTerm && (
                        <Button
                          variant="contained"
                          startIcon={<PersonAdd />}
                          onClick={onNewTutor}
                          sx={{ mt: 2 }}
                        >
                          Agregar Primer Tutor
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTutores
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((t) => (
                    <TableRow key={t.id}>
                      {/* Tutor (avatar morado + nombre y correo) */}
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: '#7e57c2' }}>
                            <Person />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {t.nombre_completo}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="flex" alignItems="center">
                              <Email sx={{ fontSize: 12, mr: 0.5 }} />
                              {t.email || 'Sin correo'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Cédula */}
                      <TableCell>
                        <Typography variant="body2" color="text.primary">
                          {t.cedula || '—'}
                        </Typography>
                      </TableCell>

                      {/* Parentesco */}
                      <TableCell>
                        <Chip
                          label={t.parentesco || 'No especificado'}
                          color="secondary"
                          size="small"
                        />
                      </TableCell>

                      {/* Teléfono (solo número) */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          display="flex"
                          alignItems="center"
                          fontSize="0.75rem"
                        >
                          <Phone sx={{ fontSize: 14, mr: 0.5 }} />
                          {t.telefono || t.telefono_emergencia || 'Sin teléfono'}
                        </Typography>
                      </TableCell>

                      {/* Estado */}
                      <TableCell>
                        <Chip
                          label={t.estado || 'activo'}
                          color={
                            t.estado === 'activo'
                              ? 'success'
                              : t.estado === 'inactivo'
                              ? 'error'
                              : 'default'
                          }
                          size="small"
                        />
                      </TableCell>

                      {/* Acciones */}
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Ver detalles">
                            <IconButton color="info" onClick={() => onViewDetail(t)} size="small">
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton color="primary" onClick={() => onEdit(t)} size="small">
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton color="error" onClick={() => onDelete(t.id)} size="small">
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
        </Box>

        {/* Paginación */}
        <TablePagination
          component="div"
          count={filteredTutores.length}
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

export default TutorLista;
