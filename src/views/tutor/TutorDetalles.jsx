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
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Visibility,
  Person,
  FamilyRestroom,
  Phone,
  Email,
  Work,
  Home,
  Edit,
  ContactEmergency,
  WhatsApp,
  LocalHospital,
  PeopleAlt
} from '@mui/icons-material';

const TutorDetalles = ({
  open,
  onClose,
  tutorData,
  onEdit,
  pacientesRelacionados = []
}) => {
  if (!tutorData) return null;

  const handleEdit = () => {
    onEdit(tutorData);
    onClose();
  };

  // Verificar si el usuario es administrador
  const isAdmin = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.rol === 'Administrador';
      }
    } catch (e) {
      console.error('Error checking admin role:', e);
    }
    return false;
  };

  // Función para abrir WhatsApp
  const handleWhatsApp = (telefono) => {
    if (!telefono) return;
    // Limpiar el número de teléfono (quitar espacios, guiones, etc.)
    const cleanNumber = telefono.replace(/\D/g, '');
    // Abrir WhatsApp en nueva pestaña
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return 'success';
      case 'inactivo':
        return 'error';
      default:
        return 'default';
    }
  };

  const getParentescoColor = (parentesco) => {
    switch (parentesco?.toLowerCase()) {
      case 'padre':
      case 'madre':
        return 'primary';
      case 'abuelo':
      case 'abuela':
        return 'secondary';
      case 'tutor_legal':
        return 'warning';
      default:
        return 'info';
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
        Detalle del Tutor
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, mt: 2 }}>
        {/* Header del tutor */}
        <Box sx={{ p: 3, bgcolor: 'primary.50' }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'secondary.main',
                mr: 3,
                fontSize: '2rem'
              }}
            >
              <Person fontSize="large" />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {tutorData.nombre_completo}
              </Typography>
              <Typography variant="h6" color="primary" gutterBottom>
                Cédula: {tutorData.cedula}
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip 
                  label={tutorData.parentesco || 'Sin parentesco'}
                  color={getParentescoColor(tutorData.parentesco)}
                  icon={<FamilyRestroom />}
                />
                <Chip 
                  label={tutorData.estado || 'activo'}
                  color={getEstadoColor(tutorData.estado)}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Información Personal */}
            <Grid size={{ xs: 12, md: 6 }}>
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
                      <Typography variant="body1" fontWeight="bold">{tutorData.nombre_completo}</Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">Cédula de Identidad</Typography>
                      <Typography variant="body1" fontWeight="bold">{tutorData.cedula}</Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">Parentesco</Typography>
                      <Chip 
                        label={tutorData.parentesco || 'No especificado'}
                        color={getParentescoColor(tutorData.parentesco)}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>

                    {tutorData.telefono && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">Teléfono Personal</Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1" fontWeight="bold" display="flex" alignItems="center">
                            <Phone sx={{ fontSize: 16, mr: 0.5 }} />
                            {tutorData.telefono}
                          </Typography>
                          {isAdmin() && (
                            <Tooltip title="Enviar mensaje WhatsApp">
                              <IconButton
                                size="small"
                                onClick={() => handleWhatsApp(tutorData.telefono)}
                                sx={{ color: '#25D366' }}
                              >
                                <WhatsApp fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    )}

                    {tutorData.correo && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">Correo Electrónico</Typography>
                        <Typography variant="body1" fontWeight="bold" display="flex" alignItems="center">
                          <Email sx={{ fontSize: 16, mr: 0.5 }} />
                          {tutorData.correo}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Información de Contacto y Emergencia */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
                    <ContactEmergency sx={{ mr: 1 }} />
                    Contacto de Emergencia
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={2}>
                    {tutorData.telefono_empresa ? (
                      <Box>
                        <Typography variant="body2" color="text.secondary">Teléfono de Empresa</Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1" fontWeight="bold" display="flex" alignItems="center" color="error.main">
                            <Phone sx={{ fontSize: 16, mr: 0.5 }} />
                            {tutorData.telefono_empresa}
                          </Typography>
                          {isAdmin() && (
                            <Tooltip title="Enviar mensaje WhatsApp">
                              <IconButton
                                size="small"
                                onClick={() => handleWhatsApp(tutorData.telefono_empresa)}
                                sx={{ color: '#25D366' }}
                              >
                                <WhatsApp fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Sin teléfono de empresa registrado
                      </Typography>
                    )}

                    <Box>
                      <Typography variant="body2" color="text.secondary">Estado</Typography>
                      <Chip 
                        label={tutorData.estado || 'activo'}
                        color={getEstadoColor(tutorData.estado)}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>

                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Información Laboral */}
            {(tutorData.nombre_empresa || tutorData.ocupacion || tutorData.direccion_empresa) && (
              <Grid size={{ xs: 12 }}>
                <Card elevation={1}>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
                      <Work sx={{ mr: 1 }} />
                      Información Laboral
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={3}>
                      {tutorData.nombre_empresa && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Empresa</Typography>
                            <Typography variant="body1" fontWeight="bold">{tutorData.nombre_empresa}</Typography>
                          </Box>
                        </Grid>
                      )}
                      
                      {tutorData.ocupacion && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Ocupación</Typography>
                            <Typography variant="body1" fontWeight="bold">{tutorData.ocupacion}</Typography>
                          </Box>
                        </Grid>
                      )}

                      {tutorData.direccion_empresa && (
                        <Grid size={{ xs: 12 }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Dirección de Empresa</Typography>
                            <Typography variant="body1" fontWeight="bold" display="flex" alignItems="center">
                              <Home sx={{ fontSize: 16, mr: 0.5 }} />
                              {tutorData.direccion_empresa}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Pacientes Relacionados */}
            <Grid size={{ xs: 12 }}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
                    <PeopleAlt sx={{ mr: 1 }} />
                    Pacientes a Cargo ({pacientesRelacionados.length})
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {pacientesRelacionados.length === 0 ? (
                    <Box textAlign="center" py={4}>
                      <LocalHospital sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Sin Pacientes Asignados
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Este tutor no tiene pacientes registrados actualmente.
                      </Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {pacientesRelacionados.map((paciente, index) => (
                        <Grid key={paciente.id || index} size={{ xs: 12, sm: 6, md: 4 }}>
                          <Card
                            variant="outlined"
                            sx={{
                              height: '100%',
                              '&:hover': {
                                boxShadow: 2,
                                borderColor: 'primary.main'
                              },
                              transition: 'all 0.2s'
                            }}
                          >
                            <CardContent>
                              <Box display="flex" alignItems="center" mb={1}>
                                <Avatar sx={{ bgcolor: 'primary.main', mr: 1.5, width: 40, height: 40 }}>
                                  <Person fontSize="small" />
                                </Avatar>
                                <Box flex={1}>
                                  <Typography variant="body1" fontWeight="bold" noWrap>
                                    {paciente.nombre_completo}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {paciente.cedula}
                                  </Typography>
                                </Box>
                              </Box>

                              <Divider sx={{ my: 1 }} />

                              <Stack spacing={1}>
                                {paciente.especialidad_nombre && (
                                  <Box display="flex" alignItems="center">
                                    <LocalHospital sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                      {paciente.especialidad_nombre}
                                    </Typography>
                                  </Box>
                                )}

                                {paciente.estado_tratamiento && (
                                  <Box>
                                    <Chip
                                      label={paciente.estado_tratamiento}
                                      size="small"
                                      color={
                                        paciente.estado_tratamiento === 'activo' ? 'success' :
                                        paciente.estado_tratamiento === 'completado' ? 'info' :
                                        paciente.estado_tratamiento === 'suspendido' ? 'warning' : 'default'
                                      }
                                      sx={{ fontSize: '0.7rem' }}
                                    />
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
            Editar Tutor
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default TutorDetalles;