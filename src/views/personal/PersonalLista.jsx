// src/views/personal/PersonalLista.jsx
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
  MenuItem,
  Select,
  FormControl,
  useTheme
} from '@mui/material';
import {
  SupervisorAccount,
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Person,
  Phone,
  Description
} from '@mui/icons-material';

// Servicios
import PersonalService from '../../services/personalService.js';
import EspecialidadService from '../../services/especialidadService.js';

const purpleOutlineSX = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'primary.main' },
    '&:hover fieldset': { borderColor: 'primary.main' },
    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
  }
};

const PersonalLista = ({
  personal = [],
  onEdit,
  onDelete,
  onViewDetail,
  onViewDocuments,
  onAddNew
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Datos filtrados
  let filteredPersonal = PersonalService.filterPersonal(personal, searchTerm);
  filteredPersonal = PersonalService.filterByArea(filteredPersonal, filterArea);

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
      {/* Header morado */}
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
            <SupervisorAccount sx={{ mr: 1 }} />
            Lista de Personal
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Busca, filtra por área y gestiona el personal del centro
          </Typography>
        </Box>

        <Chip
          label={`${filteredPersonal.length} empleado${filteredPersonal.length !== 1 ? 's' : ''}`}
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
          {/* Buscar */}
          <TextField
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, título o especialidad..."
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
                val === '' ? 'Todas las áreas' : EspecialidadService.getAreaLabel(val)
              }
            >
              <MenuItem value="">Todas las áreas</MenuItem>
              {PersonalService.getUniqueAreas(personal).map((area) => (
                <MenuItem key={area} value={area}>
                  {EspecialidadService.getAreaLabel(area)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Nuevo personal */}
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onAddNew}
            sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.getContrastText(theme.palette.primary.main), '&:hover': { bgcolor: theme.palette.primary.dark } }}
              >
            Nuevo Personal
          </Button>
        </Box>

        {/* Tabla */}
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Colaborador</TableCell>
                <TableCell>Título</TableCell>
                <TableCell>Especialidades</TableCell>
                <TableCell>Contacto</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPersonal
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item) => (
                  <TableRow key={item.id}>
                    {/* Colaborador */}
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          sx={{
                            mr: 2,
                            bgcolor: theme.palette.primary.main,}}
                        >
                          <Person />
                        </Avatar>
                        <Typography variant="body2" fontWeight="bold">
                          {PersonalService.getFullName(item)}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Título Profesional */}
                    <TableCell>
                      <Typography variant="body2" color="text.primary">
                        {item.titulo_profesional || '—'}
                      </Typography>
                    </TableCell>

                    {/* Especialidades */}
                    <TableCell>
                      <Box>
                        {item.especialidades?.length > 0 ? (
                          item.especialidades.map((esp, index) => (
                            <Chip
                              key={index}
                              label={esp.nombre}
                              color={PersonalService.getEspecialidadColor(esp.area)}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))
                        ) : (
                          <Typography variant="caption" color="text.primary">
                            Sin especialidades asignadas
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* Contacto */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        display="flex"
                        alignItems="center"
                        fontSize="0.75rem"
                      >
                        <Phone sx={{ fontSize: 14, mr: 0.5 }} />
                        {item.telefono || 'Sin teléfono'}
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
                        <Tooltip title="Documentos">
                          <IconButton color="info" size="small" onClick={() => onViewDocuments(item)}>
                            <Description />
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
                ))}
            </TableBody>
          </Table>
        </Box>

        {/* Paginación */}
        <TablePagination
          component="div"
          count={filteredPersonal.length}
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

export default PersonalLista;
