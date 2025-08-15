// src/views/especialidades/EspecialidadDetalles.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Chip,
  Card,
  CardContent,
  Avatar,
  Divider,
  Stack,
  Icon
} from '@mui/material';
import {
  MedicalServices,
  Edit,
  Work,
  LocalHospital,
  School
} from '@mui/icons-material';

// Servicios
import EspecialidadService from '../../services/especialidadService.js';

/* ===== Helpers ===== */
function formatDateLocal(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-ES');
  } catch {
    return '—';
  }
}

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

const EspecialidadDetalles = ({ open, data, onClose, onEdit }) => {
  if (!data) return null;

  const handleEdit = () => {
    onEdit?.(data);
    onClose?.();
  };

  const areaInfo = EspecialidadService.getAreaInfo
    ? EspecialidadService.getAreaInfo(data.area)
    : { label: data.area || '—', color: 'default', icon: 'Work' };

  const estadoInfo = EspecialidadService.getEstadoInfo
    ? EspecialidadService.getEstadoInfo(data.estado)
    : { label: data.estado || 'activo', color: 'default' };

  const fechaCreacion =
    data.fecha_creacion || data.created_at || data.fechaRegistro || null;
  const fechaModificacion =
    data.fecha_modificacion || data.updated_at || data.fechaActualizacion || null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* Header morado con icono */}
      <DialogTitle
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <MedicalServices sx={{ mr: 1 }} />
        Detalles de la Especialidad
      </DialogTitle>

      <DialogContent sx={{ p: 0, mt: 2 }}>
        {/* Encabezado con avatar e info principal */}
        <Box sx={{ p: 3, bgcolor: 'primary.50' }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                mr: 3,
                fontSize: '2rem'
              }}
            >
              <MedicalServices fontSize="large" />
            </Avatar>

            <Box flex={1}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {data.nombre || '—'}
              </Typography>

              <Box display="flex" gap={1} flexWrap="wrap">
                {/* Área */}
                <Chip
                  label={areaInfo.label}
                  color={areaInfo.color || 'default'}
                  icon={renderAreaIcon(areaInfo.icon)}
                />
                {/* Estado */}
                <Chip label={estadoInfo.label} color={estadoInfo.color || 'default'} />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Secciones en tarjetas */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Información de la Especialidad */}
            <Grid item xs={12} md={6}>
              <Card elevation={1}>
                <CardContent>
                  <Typography
                    variant="h6"
                    color="primary"
                    gutterBottom
                    display="flex"
                    alignItems="center"
                  >
                    <MedicalServices sx={{ mr: 1 }} />
                    Información de la Especialidad
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Nombre
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {data.nombre || '—'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Área
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        display="flex"
                        alignItems="center"
                        gap={0.5}
                      >
                        <Icon fontSize="small">{renderAreaIcon(areaInfo.icon)}</Icon>
                        {areaInfo.label}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Información del Sistema */}
            <Grid item xs={12} md={6}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Información del Sistema
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box p={1}>
                        <Typography variant="caption" color="text.secondary">
                          ID del Sistema
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {data.id}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box p={1}>
                        <Typography variant="caption" color="text.secondary">
                          Estado
                        </Typography>
                        <Box>
                          <Chip
                            label={estadoInfo.label}
                            color={estadoInfo.color || 'default'}
                            size="small"
                          />
                        </Box>
                      </Box>
                    </Grid>

                    {fechaCreacion && (
                      <Grid item xs={12} sm={6}>
                        <Box p={1}>
                          <Typography variant="caption" color="text.secondary">
                            Fecha de Registro
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {EspecialidadService.formatDate
                              ? EspecialidadService.formatDate(fechaCreacion)
                              : formatDateLocal(fechaCreacion)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {fechaModificacion && (
                      <Grid item xs={12} sm={6}>
                        <Box p={1}>
                          <Typography variant="caption" color="text.secondary">
                            Última Actualización
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {EspecialidadService.formatDate
                              ? EspecialidadService.formatDate(fechaModificacion)
                              : formatDateLocal(fechaModificacion)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} variant="outlined">
            Cerrar
          </Button>
          <Button onClick={handleEdit} variant="contained" startIcon={<Edit />}>
            Editar
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default EspecialidadDetalles;
