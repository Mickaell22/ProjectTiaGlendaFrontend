// src/views/centro/CentroDetalles.jsx
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
  Business,
  Edit,
  Phone,
  Email,
  LocationOn,
  Schedule,
  Notes,
  CalendarMonth
} from '@mui/icons-material';

const turnoLabels = {
  matutino: 'Matutino',
  vespertino: 'Vespertino',
  mixto: 'Mixto',
};

const InfoRow = ({ label, value, icon }) => (
  <Box>
    <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
      {icon}
      {label}
    </Typography>
    <Typography variant="body1" fontWeight="bold">
      {value || '--'}
    </Typography>
  </Box>
);

const CentroDetalles = ({ open, data, onClose, onEdit }) => {
  if (!data) return null;

  const handleEdit = () => {
    onEdit?.(data);
    onClose?.();
  };

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
        <Business sx={{ mr: 1 }} />
        Detalles del Centro
      </DialogTitle>

      <DialogContent sx={{ p: 0, mt: 2 }}>
        {/* Encabezado con avatar e info principal */}
        <Box sx={{ p: 3, bgcolor: 'primary.50' }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: data.estado === 'activo' ? 'primary.main' : 'grey.400',
                mr: 3,
                fontSize: '2rem'
              }}
            >
              <Business fontSize="large" />
            </Avatar>

            <Box flex={1}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {data.nombre || '--'}
              </Typography>

              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip label={data.codigo} size="small" variant="outlined" />
                <Chip
                  label={data.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  color={data.estado === 'activo' ? 'success' : 'error'}
                  size="small"
                />
                <Chip
                  label={turnoLabels[data.turno_principal] || data.turno_principal || 'Sin turno'}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Secciones en tarjetas */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Informacion general */}
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
                    Informacion General
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={2}>
                    <InfoRow label="Nombre" value={data.nombre} icon={<Business fontSize="small" />} />
                    <InfoRow label="Codigo" value={data.codigo} />
                    <InfoRow label="Direccion" value={data.direccion} icon={<LocationOn fontSize="small" />} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Contacto */}
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
                    <Phone sx={{ mr: 1 }} />
                    Contacto
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={2}>
                    <InfoRow label="Telefono" value={data.telefono} icon={<Phone fontSize="small" />} />
                    <InfoRow label="Email" value={data.email} icon={<Email fontSize="small" />} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Horario */}
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
                    <Schedule sx={{ mr: 1 }} />
                    Horario
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={2}>
                    <InfoRow
                      label="Turno principal"
                      value={turnoLabels[data.turno_principal] || data.turno_principal}
                    />
                    <InfoRow
                      label="Horario apertura"
                      value={data.horario_apertura}
                      icon={<Schedule fontSize="small" />}
                    />
                    <InfoRow
                      label="Horario cierre"
                      value={data.horario_cierre}
                      icon={<Schedule fontSize="small" />}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Observaciones y fechas */}
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
                    <Notes sx={{ mr: 1 }} />
                    Observaciones
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={2}>
                    <InfoRow label="Observaciones" value={data.observaciones} icon={<Notes fontSize="small" />} />
                    <InfoRow
                      label="Fecha creacion"
                      value={data.fecha_creacion}
                      icon={<CalendarMonth fontSize="small" />}
                    />
                    <InfoRow
                      label="Ultima modificacion"
                      value={data.fecha_modificacion}
                      icon={<CalendarMonth fontSize="small" />}
                    />
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
          <Button
            onClick={handleEdit}
            variant="contained"
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

export default CentroDetalles;
