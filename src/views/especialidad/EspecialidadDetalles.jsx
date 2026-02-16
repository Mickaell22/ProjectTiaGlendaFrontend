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
  Stack
} from '@mui/material';
import {
  MedicalServices,
  Edit,
  Work,
  LocalHospital,
  School,
  Business,
  People,
  CalendarToday
} from '@mui/icons-material';

// Servicios
import EspecialidadService from '../../services/especialidadService.js';

/* ===== Helpers ===== */

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

  const areaInfo = EspecialidadService.getAreaInfo(data.area);
  const estadoInfo = EspecialidadService.getEstadoInfo(data.estado);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* Header */}
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
                {data.nombre || '--'}
              </Typography>

              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip
                  label={areaInfo.label}
                  color={areaInfo.color || 'default'}
                  icon={renderAreaIcon(areaInfo.icon)}
                />
                <Chip
                  label={estadoInfo.label}
                  color={estadoInfo.color}
                  size="small"
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Secciones en tarjetas */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Informacion de la Especialidad */}
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
                    Informacion General
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Nombre
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {data.nombre || '--'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Area
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        {renderAreaIcon(areaInfo.icon)}
                        <Typography variant="body1" fontWeight="bold">
                          {areaInfo.label}
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Estado
                      </Typography>
                      <Chip
                        label={estadoInfo.label}
                        color={estadoInfo.color}
                        size="small"
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Centro y Personal */}
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
                    <Business sx={{ mr: 1 }} />
                    Centro y Personal
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Centro
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {data.centro_nombre || '--'}
                      </Typography>
                      {data.centro_codigo && (
                        <Typography variant="caption" color="text.secondary">
                          Codigo: {data.centro_codigo}
                        </Typography>
                      )}
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Personal asignado
                      </Typography>
                      <Chip
                        icon={<People />}
                        label={`${data.personal_asignado ?? 0} profesional${(data.personal_asignado ?? 0) !== 1 ? 'es' : ''}`}
                        color="info"
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Fechas */}
            <Grid item xs={12}>
              <Card elevation={1}>
                <CardContent>
                  <Typography
                    variant="h6"
                    color="primary"
                    gutterBottom
                    display="flex"
                    alignItems="center"
                  >
                    <CalendarToday sx={{ mr: 1 }} />
                    Fechas
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Stack direction="row" spacing={4}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Fecha de creacion
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {EspecialidadService.formatDate(data.fecha_creacion)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Ultima modificacion
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {EspecialidadService.formatDate(data.fecha_modificacion)}
                      </Typography>
                    </Box>
                  </Stack>
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
          <Button onClick={handleEdit} variant="contained"
            startIcon={<Edit />}
            sx={(theme) => ({
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            })}
          >
            Editar
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default EspecialidadDetalles;
