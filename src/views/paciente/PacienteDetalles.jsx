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
  Visibility,
  Person,
  LocalHospital,
  CalendarToday,
  FamilyRestroom,
  Assignment,
  Edit,
  Description,
  Star as StarIcon,
  History
} from '@mui/icons-material';

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

const PacienteDetalles = ({
  open,
  onClose,
  pacienteData,
  onEdit,
  onViewDocuments,
  onViewHistorialPausas
}) => {
  if (!pacienteData) return null;

  const handleEdit = () => {
    onEdit(pacienteData);
    onClose();
  };

  const handleViewDocuments = () => {
    onViewDocuments(pacienteData);
    onClose();
  };

  const handleViewHistorialPausas = () => {
    if (onViewHistorialPausas) {
      onViewHistorialPausas(pacienteData);
      onClose();
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return 'success';
      case 'en pausa':
        return 'warning';
      case 'completado':
        return 'info';
      case 'suspendido':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center' }}>
        <Visibility sx={{ mr: 1 }} />
        Detalle del Paciente
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, mt: 2 }}>
        {/* Header del paciente */}
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
              <Person fontSize="large" />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {pacienteData.nombre_completo}
              </Typography>
              <Typography variant="h6" color="primary" gutterBottom>
                Cédula: {pacienteData.cedula}
              </Typography>
              <Chip 
                label={pacienteData.estado_tratamiento || 'Sin estado'}
                color={getEstadoColor(pacienteData.estado_tratamiento)}
                icon={<LocalHospital />}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Información Personal */}
            <Grid item xs={12} md={6}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
                    <Person sx={{ mr: 1 }} />
                    Información Personal
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Nombre Completo</Typography>
                      <Typography variant="body1" fontWeight="bold">{pacienteData.nombre_completo}</Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">Cédula de Identidad</Typography>
                      <Typography variant="body1" fontWeight="bold">{pacienteData.cedula}</Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">Estado del Tratamiento</Typography>
                      <Chip
                        label={pacienteData.estado_tratamiento || 'Sin estado'}
                        color={getEstadoColor(pacienteData.estado_tratamiento)}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>

                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Información del Tutor */}
            <Grid item xs={12} md={6}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
                    <FamilyRestroom sx={{ mr: 1 }} />
                    Tutor/Representante
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Nombre del Tutor</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {pacienteData.nombre_tutor || 'Sin tutor asignado'}
                      </Typography>
                    </Box>
                    
                    {pacienteData.tutor_cedula && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">Cédula del Tutor</Typography>
                        <Typography variant="body1" fontWeight="bold">{pacienteData.tutor_cedula}</Typography>
                      </Box>
                    )}

                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Información del Tratamiento */}
            <Grid item xs={12}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
                    <LocalHospital sx={{ mr: 1 }} />
                    Resumen del Tratamiento
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Fecha de Ingreso</Typography>
                        <Typography variant="body1" fontWeight="bold" display="flex" alignItems="center" sx={{ mt: 0.5 }}>
                          <CalendarToday sx={{ fontSize: 16, mr: 0.5 }} />
                          {formatDateLocal(pacienteData.fecha_ingreso)}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Total Especialidades</Typography>
                        <Typography variant="h4" color="primary" fontWeight="bold" sx={{ mt: 0.5 }}>
                          {pacienteData.especialidades?.length || 0}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Especialidades Activas</Typography>
                        <Typography variant="h4" color="success.main" fontWeight="bold" sx={{ mt: 0.5 }}>
                          {pacienteData.especialidades?.filter(esp => esp.estado === 'activo').length || 0}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Especialidades Detalladas */}
            <Grid item xs={12}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
                    <Assignment sx={{ mr: 1 }} />
                    Especialidades Asignadas
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {!pacienteData.especialidades || pacienteData.especialidades.length === 0 ? (
                    <Box textAlign="center" py={4}>
                      <LocalHospital sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Sin Especialidades Asignadas
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Este paciente no tiene especialidades médicas registradas aún.
                      </Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={3}>
                      {pacienteData.especialidades.map((especialidad, index) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Card
                            variant="outlined"
                            sx={{
                              height: '100%',
                              border: especialidad.es_principal ? '2px solid' : '1px solid',
                              borderColor: especialidad.es_principal ? 'primary.main' : 'divider',
                              position: 'relative',
                              '&:hover': {
                                boxShadow: 2
                              }
                            }}
                          >
                            <CardContent>
                              {/* Header con nombre y badge de principal */}
                              <Box display="flex" alignItems="center" mb={2}>
                                <LocalHospital color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6" color="primary" sx={{ flex: 1, fontWeight: 'bold' }}>
                                  {especialidad.especialidad_nombre || 'Especialidad sin nombre'}
                                </Typography>
                                {especialidad.es_principal && (
                                  <Chip
                                    icon={<StarIcon />}
                                    label="PRINCIPAL"
                                    color="primary"
                                    size="small"
                                    sx={{ fontWeight: 'bold' }}
                                  />
                                )}
                              </Box>

                              {/* Área de especialidad */}
                              {especialidad.especialidad_area && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    mb: 2,
                                    fontStyle: 'italic',
                                    bgcolor: 'grey.50',
                                    p: 1,
                                    borderRadius: 1
                                  }}
                                >
                                  {especialidad.especialidad_area}
                                </Typography>
                              )}

                              {/* Información principal */}
                              <Stack spacing={2}>
                                {/* Estados y prioridad */}
                                <Box>
                                  <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        ESTADO
                                      </Typography>
                                      <Chip
                                        label={especialidad.estado || 'Sin estado'}
                                        size="small"
                                        color={especialidad.estado === 'activo' ? 'success' : 'default'}
                                        sx={{ fontWeight: 'bold' }}
                                      />
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        PRIORIDAD
                                      </Typography>
                                      <Chip
                                        label={especialidad.prioridad || 'Media'}
                                        size="small"
                                        color={
                                          especialidad.prioridad === 'urgente' ? 'error' :
                                          especialidad.prioridad === 'alta' ? 'warning' :
                                          especialidad.prioridad === 'baja' ? 'info' : 'default'
                                        }
                                        sx={{ fontWeight: 'bold' }}
                                      />
                                    </Grid>
                                  </Grid>
                                </Box>

                                {/* Fechas importantes */}
                                <Box>
                                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                    FECHAS DEL TRATAMIENTO
                                  </Typography>
                                  <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                      <Typography variant="body2" color="text.secondary">Inicio:</Typography>
                                      <Typography variant="body2" fontWeight="bold">
                                        {formatDateLocal(especialidad.fecha_inicio_tratamiento)}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Typography variant="body2" color="text.secondary">Fin:</Typography>
                                      <Typography variant="body2" fontWeight="bold">
                                        {formatDateLocal(especialidad.fecha_fin_tratamiento)}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                </Box>

                                {/* Observaciones */}
                                {especialidad.observaciones && (
                                  <Box>
                                    <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                      OBSERVACIONES
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                      p: 1.5,
                                      bgcolor: 'grey.50',
                                      borderRadius: 1,
                                      border: '1px solid',
                                      borderColor: 'grey.200',
                                      fontSize: '0.875rem',
                                      lineHeight: 1.4
                                    }}>
                                      {especialidad.observaciones}
                                    </Typography>
                                  </Box>
                                )}
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Observaciones */}
            {(pacienteData.observaciones_tratamiento || pacienteData.observaciones) && (
              <Grid item xs={12}>
                <Card elevation={1}>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
                      <Assignment sx={{ mr: 1 }} />
                      Observaciones
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={3}>
                      {pacienteData.observaciones_tratamiento && (
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Observaciones del Tratamiento
                            </Typography>
                            <Typography variant="body1" sx={{ 
                              p: 2, 
                              bgcolor: 'grey.50', 
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'grey.200'
                            }}>
                              {pacienteData.observaciones_tratamiento}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      
                      {pacienteData.observaciones && (
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Observaciones Generales
                            </Typography>
                            <Typography variant="body1" sx={{ 
                              p: 2, 
                              bgcolor: 'grey.50', 
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'grey.200'
                            }}>
                              {pacienteData.observaciones}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} variant="outlined">
            Cerrar
          </Button>
          <Button
            onClick={handleViewHistorialPausas}
            variant="outlined"
            color="secondary"
            startIcon={<History />}
          >
            Historial Pausas
          </Button>
          <Button
            onClick={handleViewDocuments}
            variant="outlined"
            color="info"
            startIcon={<Description />}
          >
            Ver Documentos
          </Button>
          <Button
            onClick={handleEdit}
            variant="contained"
            startIcon={<Edit />}
          >
            Editar Paciente
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default PacienteDetalles;