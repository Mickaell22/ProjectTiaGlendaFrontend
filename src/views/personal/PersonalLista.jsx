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
  Grid,
  MenuItem,
  InputAdornment,
  Stack,
  Avatar,
  Chip,
  Tooltip,
  Box
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
  Email
} from '@mui/icons-material';

// Servicios
import PersonalService from '../../services/personalService.js';
import EspecialidadService from '../../services/especialidadService.js';

const PersonalLista = ({ 
  personal = [], 
  onEdit, 
  onDelete, 
  onViewDetail, 
  onAddNew 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Datos filtrados
  let filteredPersonal = PersonalService.filterPersonal(personal, searchTerm);
  filteredPersonal = PersonalService.filterByArea(filteredPersonal, filterArea);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" mb={2} display="flex" alignItems="center">
          <SupervisorAccount sx={{ mr: 1 }} />
          Lista de Personal
          <Chip 
            label={`${filteredPersonal.length} empleado${filteredPersonal.length !== 1 ? 's' : ''}`} 
            color="primary" 
            size="small" 
            sx={{ ml: 2 }}
          />
        </Typography>
        
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              label="Buscar personal"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
              placeholder="Buscar por nombre, título profesional o especialidad..."
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Filtrar por área"
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
            >
              <MenuItem value="">Todas las áreas</MenuItem>
              {PersonalService.getUniqueAreas(personal).map((area) => (
                <MenuItem key={area} value={area}>
                  {EspecialidadService.getAreaLabel(area)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Add />}
              onClick={onAddNew}
              sx={{ height: '40px' }}
            >
              Nuevo Personal
            </Button>
          </Grid>
        </Grid>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Empleado</TableCell>
              <TableCell>Título Profesional</TableCell>
              <TableCell>Especialidades</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPersonal
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item) => {
                const estadoInfo = PersonalService.getEstadoInfo(item.estado);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {PersonalService.getFullName(item)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.cedula}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {item.titulo_profesional}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {item.especialidades && item.especialidades.length > 0 ? (
                          item.especialidades.map((esp, index) => (
                            <span key={index} style={{ marginRight: '4px', marginBottom: '4px', display: 'inline-block' }}>
                              <Chip 
                                label={esp.nombre}
                                color={PersonalService.getEspecialidadColor(esp.area)}
                                size="small"
                              />
                            </span>
                          ))
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Sin especialidades asignadas
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" display="flex" alignItems="center" fontSize="0.75rem">
                          <Phone sx={{ fontSize: '14px', mr: 0.5 }} />
                          {item.telefono || 'Sin teléfono'}
                        </Typography>
                        <Typography variant="body2" display="flex" alignItems="center" fontSize="0.75rem" color="text.secondary">
                          <Email sx={{ fontSize: '14px', mr: 0.5 }} />
                          {item.correo || 'Sin email'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={estadoInfo.label} 
                        color={estadoInfo.color}
                        size="small"
                      />
                      <Typography variant="caption" display="block" color="text.secondary">
                        Desde: {PersonalService.formatDate(item.fecha_creacion)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Ver detalles">
                          <IconButton 
                            color="info" 
                            size="small"
                            onClick={() => onViewDetail(item)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton 
                            color="primary" 
                            size="small"
                            onClick={() => onEdit(item)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton 
                            color="error" 
                            size="small"
                            onClick={() => onDelete(item.id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>

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