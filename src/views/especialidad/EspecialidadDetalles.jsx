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
  MedicalServices,
  Edit
} from '@mui/icons-material';

// Servicios
import EspecialidadService from '../../services/especialidadService.js';

const EspecialidadDetalles = ({ 
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
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <MedicalServices sx={{ mr: 2 }} />
          Detalles de la Especialidad
        </Box>
      </DialogTitle>
      <DialogContent>
        {data && (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="primary">Información Básica</Typography>
              <Typography variant="body2">
                <strong>Nombre:</strong> {data.nombre}
              </Typography>
              <Typography variant="body2">
                <strong>Área:</strong> {EspecialidadService.getAreaInfo(data.area).label}
              </Typography>
              <Typography variant="body2">
                <strong>ID:</strong> {data.id}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="primary">Estado y Fechas</Typography>
              <Typography variant="body2">
                <strong>Estado:</strong> 
                <Chip 
                  label={EspecialidadService.getEstadoInfo(data.estado).label} 
                  color={EspecialidadService.getEstadoInfo(data.estado).color}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography variant="body2">
                <strong>Fecha de creación:</strong> {EspecialidadService.formatDate(data.fecha_creacion)}
              </Typography>
              <Typography variant="body2">
                <strong>Última modificación:</strong> {EspecialidadService.formatDate(data.fecha_modificacion)}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="primary">Descripción</Typography>
              <Typography variant="body2">
                {data.descripcion || 'Sin descripción disponible'}
              </Typography>
            </Grid>
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

export default EspecialidadDetalles;