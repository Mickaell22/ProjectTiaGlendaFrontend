// src/views/personal/PersonalDetalles.jsx
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
  SupervisorAccount,
  Person,
  Phone,
  Email,
  Badge,
  Edit
} from '@mui/icons-material';

// Servicios
import PersonalService from '../../services/personalService.js';
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

const PersonalDetalles = ({
  open,
  data,
  onClose,
  onEdit
}) => {
  if (!data) return null;

  const handleEdit = () => {
    onEdit(data);
    onClose();
  };

  // Estado (usa el service para mantener la semántica de colores)
  const estadoInfo = PersonalService.getEstadoInfo
    ? PersonalService.getEstadoInfo(data.estado)
    : { label: data.estado || 'activo', color: 'default' };

  // Fechas: usa lo que tengas disponible
  const fechaCreacion =
    data.fecha_creacion || data.created_at || data.fechaRegistro || null;
  const fechaModificacion =
    data.fecha_modificacion || data.updated_at || data.fechaActualizacion || null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      {/* Header morado con icono (igual estilo que PersonaDetalles) */}
      <DialogTitle
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Visibility sx={{ mr: 1 }} />
        Detalles del Personal
      </DialogTitle>

      <DialogContent sx={{ p: 0, mt: 2 }}>
        {/* Encabezado del colaborador */}
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
              <SupervisorAccount fontSize="large" />
            </Avatar>

            <Box flex={1}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {PersonalService.getFullName ? PersonalService.getFullName(data) : `${data.nombre || ''} ${data.apellido || ''}`.trim()}
              </Typography>

              {/* Cédula y título como subtítulos */}
              <Typography variant="h6" color="primary" gutterBottom>
                Cédula: {data.cedula || 'Sin cédula'}
              </Typography>

              <Box display="flex" gap={1} flexWrap="wrap">
                {/* Estado */}
                <Chip
                  label={estadoInfo.label}
                  color={estadoInfo.color}
                />
                {/* Título profesional (si tiene) */}
                {data.titulo_profesional ? (
                  <Chip
                    label={data.titulo_profesional}
                    color="info"
                  />
                ) : null}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Cuerpo con tarjetas (igual estructura que PersonaDetalles) */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Información del Colaborador */}
            <Grid item xs={12} md={6}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
                    <Person sx={{ mr: 1 }} />
                    Información del Colaborador
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Nombre Completo</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {PersonalService.getFullName ? PersonalService.getFullName(data) : `${data.nombre || ''} ${data.apellido || ''}`.trim()}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">Cédula</Typography>
                      <Typography variant="body1" fontWeight="bold" display="flex" alignItems="center">
                        <Badge sx={{ fontSize: 16, mr: 0.5 }} />
                        {data.cedula || 'Sin cédula'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">Título Profesional</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {data.titulo_profesional || '—'}
                      </Typography>
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
                      {data.telefono ? (
                        <Typography variant="body1" fontWeight="bold" display="flex" alignItems="center">
                          <Phone sx={{ fontSize: 16, mr: 0.5 }} />
                          {data.telefono}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                          Sin teléfono registrado
                        </Typography>
                      )}
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">Correo Electrónico</Typography>
                      {data.correo ? (
                        <Typography variant="body1" fontWeight="bold" display="flex" alignItems="center">
                          <Email sx={{ fontSize: 16, mr: 0.5 }} />
                          {data.correo}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                          Sin correo registrado
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Especialidades */}
            <Grid item xs={12}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Especialidades Asignadas
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {data.especialidades && data.especialidades.length > 0 ? (
                    <Box>
                      {data.especialidades.map((esp, index) => (
                        <Box key={index} sx={{ mb: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                          <Chip
                            label={esp.nombre}
                            color={PersonalService.getEspecialidadColor ? PersonalService.getEspecialidadColor(esp.area) : 'default'}
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            Área: {EspecialidadService.getAreaLabel ? EspecialidadService.getAreaLabel(esp.area) : esp.area}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Sin especialidades asignadas
                    </Typography>
                  )}
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
                          {data.id}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Typography variant="caption" color="text.secondary">
                          Estado
                        </Typography>
                        <Box>
                          <Chip label={estadoInfo.label} color={estadoInfo.color} size="small" />
                        </Box>
                      </Box>
                    </Grid>

                    {fechaCreacion && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Box textAlign="center" p={2}>
                          <Typography variant="caption" color="text.secondary">
                            Fecha de Registro
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {PersonalService.formatDate
                              ? PersonalService.formatDate(fechaCreacion)
                              : formatDateLocal(fechaCreacion)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {fechaModificacion && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Box textAlign="center" p={2}>
                          <Typography variant="caption" color="text.secondary">
                            Última Actualización
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {PersonalService.formatDate
                              ? PersonalService.formatDate(fechaModificacion)
                              : formatDateLocal(fechaModificacion)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {/* Información de usuario (si aplica) */}
                    {data.usuario_id && (
                      <>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box textAlign="center" p={2}>
                            <Typography variant="caption" color="text.secondary">
                              Usuario del Sistema
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {data.nombre_usuario || 'Sí'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Box textAlign="center" p={2}>
                            <Typography variant="caption" color="text.secondary">
                              Rol
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {data.rol_usuario || 'N/A'}
                            </Typography>
                          </Box>
                        </Grid>
                      </>
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
            Editar
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default PersonalDetalles;
