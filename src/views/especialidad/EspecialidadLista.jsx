// src/views/especialidades/EspecialidadLista.jsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
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
  Chip,
  Tooltip,
  Box,
  FormControl,
  Select,
  MenuItem,

  useTheme
} from '@mui/material';
import {
  MedicalServices,
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Work,
  LocalHospital,
  School
} from '@mui/icons-material';

// Servicios
import EspecialidadService from '../../services/especialidadService.js';

/* ---------------- Helpers (estilo unificado con otras listas) ---------------- */
const purpleOutlineSX = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'primary.main' },
    '&:hover fieldset': { borderColor: 'primary.main' },
    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
  }
};

const EspecialidadLista = ({
  especialidades = [],
  centros = [],
  user = null,
  onEdit,
  onDelete,
  onViewDetail,
  onAddNew
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Datos filtrados (servicio) - Solo por búsqueda y área
  let filteredEspecialidades = EspecialidadService.filterEspecialidades(especialidades, searchTerm);
  filteredEspecialidades = EspecialidadService.filterByArea(filteredEspecialidades, filterArea);

  const renderAreaIcon = (areaIcon) => {
    switch (areaIcon) {
      case 'LocalHospital':
        return <LocalHospital />;
      case 'School':
        return <School />;
      default:
        return <Work />;
    }
  };

  return (
    <Card
      elevation={8}
      sx={{
        borderRadius: 4,
        mb: 4,
        backgroundColor: 'background.paper',
        border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
        overflow: 'hidden',
        width: '100%',
        maxWidth: { xs: '100%', sm: 800, md: 900 },
        mx: 'auto'
      }}
    >
      {/* Header morado con contador (consistente con otras vistas) */}
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
            <MedicalServices sx={{ mr: 1 }} />
            Lista de Especialidades
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Busca, filtra por área y gestiona las especialidades
          </Typography>
        </Box>

        <Chip
          label={`${filteredEspecialidades.length} especialidad${filteredEspecialidades.length !== 1 ? 'es' : ''}`}
          color="default"
          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
          size="small"
        />
      </Box>

      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        {/* Toolbar (búsqueda + filtro área + botón nuevo) */}
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
          {/* Buscar */}
          <TextField
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre..."
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

          {/* Filtro Área */}
          <FormControl size="small" sx={{ ...purpleOutlineSX, width: 200 }}>
            <Select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              displayEmpty
              renderValue={(val) =>
                val === ''
                  ? 'Todas las áreas'
                  : (EspecialidadService.getAreas().find((a) => a.value === val)?.label || 'Área')
              }
            >
              <MenuItem value="">Todas las áreas</MenuItem>
              {EspecialidadService.getAreas().map((area) => (
                <MenuItem key={area.value} value={area.value}>
                  {area.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>


          {/* Nueva especialidad */}
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onAddNew}
            sx={{ height: 40, px: 2 }}
          >
            Nueva Especialidad
          </Button>
        </Box>

        {/* Tabla */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Especialidad</TableCell>
              <TableCell>Área</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEspecialidades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm || filterArea
                      ? 'No se encontraron especialidades con los filtros aplicados'
                      : 'No hay especialidades registradas'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredEspecialidades
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item) => {
                  const estadoInfo = EspecialidadService.getEstadoInfo(item.estado);
                  const areaInfo = EspecialidadService.getAreaInfo(item.area);
                  return (
                    <TableRow key={item.id}>
                      {/* Especialidad */}
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: areaInfo.color }}>
                            {renderAreaIcon(areaInfo.icon)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {item.nombre}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Área */}
                      <TableCell>
                        <Chip
                          label={areaInfo.label}
                          color={areaInfo.color}
                          size="small"
                          icon={renderAreaIcon(areaInfo.icon)}
                        />
                      </TableCell>


                      {/* Estado */}
                      <TableCell>
                        <Chip label={estadoInfo.label} color={estadoInfo.color} size="small" />
                        <Typography variant="caption" display="block" color="text.secondary">
                          Desde: {EspecialidadService.formatDate(item.fecha_creacion)}
                        </Typography>
                      </TableCell>

                      {/* Acciones */}
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Ver detalles">
                            <IconButton color="info" size="small" onClick={() => onViewDetail(item)}>
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton color="primary" size="small" onClick={() => onEdit(item)}>
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton color="error" size="small" onClick={() => onDelete(item.id)}>
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

        {/* Paginación */}
        <TablePagination
          component="div"
          count={filteredEspecialidades.length}
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

export default EspecialidadLista;
