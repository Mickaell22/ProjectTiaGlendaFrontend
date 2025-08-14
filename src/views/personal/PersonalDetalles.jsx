import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Chip,
  Box
} from '@mui/material';
import {
  SupervisorAccount,
  Edit,
  Phone,
  Email
} from '@mui/icons-material';

// Servicios
import PersonalService from '../../services/personalService.js';
import EspecialidadService from '../../services/especialidadService.js';

const PersonalDetalles = ({ 
  open, 
  data, 
  onClose, 
  onEdit 
}) => {

  const handleEdit = () => {
    onEdit(data);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <SupervisorAccount sx={{ mr: 2 }} />
          Detalles del Personal
        </Box>
      </DialogTitle>
      <DialogContent>
        {data && (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="primary">Información Personal</Typography>
              <Typography variant="body2">
                <strong>Nombre:</strong> {PersonalService.getFullName(data)}
              </Typography>
              <Typography variant="body2">
                <strong>Cédula:</strong> {data.cedula}
              </Typography>
              <Typography variant="body2">
                <strong>Título:</strong> {data.titulo_profesional}
              </Typography>
              <Typography variant="body2" display="flex" alignItems="center">
                <Phone fontSize="small" sx={{ mr: 1 }} />
                {data.telefono || 'Sin teléfono'}
              </Typography>
              <Typography variant="body2" display="flex" alignItems="center">
                <Email fontSize="small" sx={{ mr: 1 }} />
                {data.correo || 'Sin email'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="primary">Especialidades Asignadas</Typography>
              {data.especialidades && data.especialidades.length > 0 ? (
                <Box>
                  {data.especialidades.map((esp, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Chip 
                        label={esp.nombre}
                        color={PersonalService.getEspecialidadColor(esp.area)}
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        Área: {EspecialidadService.getAreaLabel(esp.area)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Sin especialidades asignadas
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="primary">Estado y Fechas</Typography>
              <Box mb={1}>
                <Chip 
                  label={PersonalService.getEstadoInfo(data.estado).label} 
                  color={PersonalService.getEstadoInfo(data.estado).color}
                  size="small"
                />
              </Box>
              <Typography variant="body2">
                <strong>Fecha de creación:</strong> {PersonalService.formatDate(data.fecha_creacion)}
              </Typography>
              <Typography variant="body2">
                <strong>Fecha de modificación:</strong> {PersonalService.formatDate(data.fecha_modificacion)}
              </Typography>
            </Grid>

            {data.usuario_id && (
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Información de Usuario</Typography>
                <Typography variant="body2">
                  <strong>Usuario del sistema:</strong> {data.nombre_usuario || 'Sí'}
                </Typography>
                <Typography variant="body2">
                  <strong>Rol:</strong> {data.rol_usuario || 'N/A'}
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cerrar
        </Button>
        {data && (
          <Button 
            variant="contained" 
            onClick={handleEdit}
            startIcon={<Edit />}
          >
            Editar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PersonalDetalles;