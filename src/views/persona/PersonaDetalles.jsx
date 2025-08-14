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
  Phone,
  Email,
  LocationOn,
  CalendarToday,
  Badge,
  Edit
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

// Helper para calcular edad
function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return '—';
  try {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return `${edad} años`;
  } catch {
    return '—';
  }
}

const PersonaDetalles = ({ 
  open, 
  onClose, 
  personaData, 
  onEdit 
}) => {
  if (!personaData) return null;

  const handleEdit = () => {
    onEdit(personaData);
    onClose();
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

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center' }}>
        <Visibility sx={{ mr: 1 }} />
        Detalle de la Persona
      </DialogTitle>
      
      <DialogContent sx={{ p: 0, mt: 2 }}>
        {/* Header de la persona */}
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
                {`${personaData.nombre} ${personaData.apellido}`}
              </Typography>
              <Typography variant="h6" color="primary" gutterBottom>
                Cédula: {personaData.cedula || 'Sin cédula'}
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip 
                  label={personaData.estado || 'activo'}
                  color={getEstadoColor(personaData.estado)}
                />
                {personaData.fecha_nacimiento && (
                  <Chip 
                    label={calcularEdad(personaData.fecha_nacimiento)}
                    color="info"
                    icon={<CalendarToday />}
                  />
                )}
              </Box>
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
                      <Typography variant="body1" fontWeight="bold">
                        {`${personaData.nombre} ${personaData.apellido}`}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">Cédula de Identidad</Typography>
                      <Typography variant="body1" fontWeight="bold" display="flex" alignItems="center">
                        <Badge sx={{ fontSize: 16, mr: 0.5 }} />
                        {personaData.cedula || 'Sin cédula'}
                      </Typography>
                    </Box>

                    {personaData.fecha_nacimiento && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">Fecha de Nacimiento</Typography>
                        <Typography variant="body1" fontWeight="bold" display="flex" alignItems="center">
                          <CalendarToday sx={{ fontSize: 16, mr: 0.5 }} />
                          {formatDateLocal(personaData.fecha_nacimiento)}
                        </Typography>
                        <Typography variant="caption" color="primary">
                          {calcularEdad(personaData.fecha_nacimiento)}
                        </Typography>
                      </Box>
                    )}

                    <Box>
                      <Typography variant="body2" color="text.secondary">Estado</Typography>
                      <Chip 
                        label={personaData.estado || 'activo'}
                        color={getEstadoColor(personaData.estado)}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">ID de la Persona</Typography>
                      <Typography variant="body1" fontWeight="bold">{personaData.id}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Información de Contacto */}
            <Grid item xs={12} md={6}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
                    <Phone sx={{ mr: 1 }} />
                    Información de Contacto
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Teléfono</Typography>
                      {personaData.telefono ? (
                        <Typography variant="body1" fontWeight="bold" display="flex" alignItems="center">
                          <Phone sx={{ fontSize: 16, mr: 0.5 }} />
                          {personaData.telefono}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                          Sin teléfono registrado
                        </Typography>
                      )}
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">Correo Electrónico</Typography>
                      {personaData.correo ? (
                        <Typography variant="body1" fontWeight="bold" display="flex" alignItems="center">
                          <Email sx={{ fontSize: 16, mr: 0.5 }} />
                          {personaData.correo}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                          Sin correo registrado
                        </Typography>
                      )}
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">Dirección</Typography>
                      {personaData.direccion ? (
                        <Typography variant="body1" fontWeight="bold" display="flex" alignItems="flex-start">
                          <LocationOn sx={{ fontSize: 16, mr: 0.5, mt: 0.2 }} />
                          <Box component="span" sx={{ wordBreak: 'break-word' }}>
                            {personaData.direccion}
                          </Box>
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                          Sin dirección registrada
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Información del Sistema */}
            <Grid item xs={12}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Información del Sistema
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Typography variant="caption" color="text.secondary">
                          ID del Sistema
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {personaData.id}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Typography variant="caption" color="text.secondary">
                          Estado
                        </Typography>
                        <Box>
                          <Chip 
                            label={personaData.estado || 'activo'}
                            color={getEstadoColor(personaData.estado)}
                            size="small"
                          />
                        </Box>
                      </Box>
                    </Grid>

                    {personaData.created_at && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Box textAlign="center" p={2}>
                          <Typography variant="caption" color="text.secondary">
                            Fecha de Registro
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatDateLocal(personaData.created_at)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {personaData.updated_at && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Box textAlign="center" p={2}>
                          <Typography variant="caption" color="text.secondary">
                            Última Actualización
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatDateLocal(personaData.updated_at)}
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
          <Button 
            onClick={handleEdit}
            variant="contained"
            startIcon={<Edit />}
          >
            Editar Persona
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default PersonaDetalles;