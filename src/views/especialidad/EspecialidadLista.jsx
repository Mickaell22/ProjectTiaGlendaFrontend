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

const EspecialidadLista = ({ 
  especialidades = [], 
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
    <Card>
      <CardContent>
        <Typography variant="h6" mb={2} display="flex" alignItems="center">
          <MedicalServices sx={{ mr: 1 }} />
          Lista de Especialidades
          <Chip 
            label={`${filteredEspecialidades.length} especialidad${filteredEspecialidades.length !== 1 ? 'es' : ''}`} 
            color="primary" 
            size="small" 
            sx={{ ml: 2 }}
          />
        </Typography>
        
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Buscar especialidades"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
              placeholder="Buscar por nombre o descripción..."
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
              {EspecialidadService.getAreas().map((area) => (
                <MenuItem key={area.value} value={area.value}>
                  {area.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Add />}
              onClick={onAddNew}
              sx={{ height: '40px' }}
            >
              Nueva Especialidad
            </Button>
          </Grid>
        </Grid>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Especialidad</TableCell>
              <TableCell>Área</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEspecialidades
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item) => {
                const estadoInfo = EspecialidadService.getEstadoInfo(item.estado);
                const areaInfo = EspecialidadService.getAreaInfo(item.area);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: areaInfo.color }}>
                          {renderAreaIcon(areaInfo.icon)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {item.nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {item.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={areaInfo.label} 
                        color={areaInfo.color}
                        size="small"
                        icon={renderAreaIcon(areaInfo.icon)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontSize="0.75rem">
                        {item.descripcion || 'Sin descripción'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={estadoInfo.label} 
                        color={estadoInfo.color}
                        size="small"
                      />
                      <Typography variant="caption" display="block" color="text.secondary">
                        Desde: {EspecialidadService.formatDate(item.fecha_creacion)}
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