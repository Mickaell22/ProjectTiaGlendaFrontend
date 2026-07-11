import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import PacienteService from '../../services/pacienteService';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const ResumeDialog = ({
  open,
  onClose,
  paciente,
  especialidadId = null,
  onResumeSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset error when dialog opens
  useEffect(() => {
    if (open) {
      setError(null);
    }
  }, [open]);

  const handleReactivate = async () => {
    if (!paciente?.id) {
      setError('No se encontró información válida del paciente');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result;
      if (especialidadId) {
        // Reactivar especialidad específica
        result = await PacienteService.reactivarEspecialidadPaciente(paciente.id, especialidadId);
      } else {
        // Reactivar paciente general
        result = await PacienteService.reactivarPacienteGeneral(paciente.id);
      }

      onResumeSuccess(result);
      onClose();
    } catch (error) {
      console.error('Error reactivando:', error);
      setError(error.message || 'Error al reactivar el tratamiento');
    } finally {
      setLoading(false);
    }
  };

  const isReactivatingSpecialty = !!especialidadId;

  // Obtener información de la pausa
  const getPauseInfo = () => {
    if (!paciente) return null;

    if (isReactivatingSpecialty && paciente.especialidades) {
      const especialidad = paciente.especialidades.find(esp => esp.id_especialidad === especialidadId);
      if (especialidad && especialidad.estado_pausa === 'pausado') {
        return {
          tipo: 'especialidad',
          nombre: especialidad.especialidad_nombre,
          fechaInicio: especialidad.fecha_inicio_pausa_esp,
          fechaFin: especialidad.fecha_fin_pausa_esp,
          motivo: especialidad.motivo_pausa_esp
        };
      }
    } else if (paciente.fecha_inicio_pausa) {
      // Verificar si tiene pausa activa por campo fecha_inicio_pausa
      return {
        tipo: 'general',
        fechaInicio: paciente.fecha_inicio_pausa,
        fechaFin: paciente.fecha_fin_pausa,
        motivo: paciente.motivo_pausa
      };
    }
    return null;
  };

  const pauseInfo = getPauseInfo();

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      return format(date, 'dd/MM/yyyy', { locale: es });
    } catch {
      return dateString;
    }
  };

  const calculatePauseDuration = () => {
    if (!pauseInfo?.fechaInicio) return 'Duración no calculable';

    try {
      const startDate = typeof pauseInfo.fechaInicio === 'string'
        ? parseISO(pauseInfo.fechaInicio)
        : pauseInfo.fechaInicio;
      const endDate = pauseInfo.fechaFin
        ? (typeof pauseInfo.fechaFin === 'string' ? parseISO(pauseInfo.fechaFin) : pauseInfo.fechaFin)
        : new Date();

      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 30) {
        return `${diffDays} día${diffDays !== 1 ? 's' : ''}`;
      } else {
        const months = Math.floor(diffDays / 30);
        const remainingDays = diffDays % 30;
        let duration = `${months} mes${months !== 1 ? 'es' : ''}`;
        if (remainingDays > 0) {
          duration += ` y ${remainingDays} día${remainingDays !== 1 ? 's' : ''}`;
        }
        return duration;
      }
    } catch {
      return 'Duración no calculable';
    }
  };

  // Early return if no patient data
  if (!paciente) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm">
        <DialogContent>
          <Alert severity="error">
            No se encontró información del paciente
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          {isReactivatingSpecialty ? 'Reactivar Especialidad' : 'Reactivar Paciente'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {paciente?.nombre_completo || 'Sin nombre'}
        </Typography>
        {isReactivatingSpecialty && pauseInfo && (
          <Box sx={{ mt: 1 }}>
            <Chip
              label={pauseInfo.nombre || 'Especialidad'}
              color="warning"
              variant="outlined"
              size="small"
            />
          </Box>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {pauseInfo ? (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Información de la Pausa Actual:
            </Typography>

            <List dense>
              <ListItem>
                <ListItemText
                  primary="Fecha de Inicio"
                  secondary={formatDate(pauseInfo.fechaInicio)}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Fecha de Fin Programada"
                  secondary={formatDate(pauseInfo.fechaFin)}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Duración de la Pausa"
                  secondary={calculatePauseDuration()}
                />
              </ListItem>
              {pauseInfo.motivo && (
                <ListItem>
                  <ListItemText
                    primary="Motivo"
                    secondary={pauseInfo.motivo}
                  />
                </ListItem>
              )}
            </List>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
              <Typography variant="body2" color="success.dark">
                <strong>Al reactivar:</strong> {isReactivatingSpecialty
                  ? 'La especialidad seleccionada volverá a estar activa y se podrán programar nuevas sesiones.'
                  : 'El paciente volverá a estar activo en todas sus especialidades y se podrán programar nuevas sesiones.'
                }
              </Typography>
            </Box>
          </Box>
        ) : (
          <Alert severity="warning">
            No se encontró información de pausa para este {isReactivatingSpecialty ? 'tratamiento' : 'paciente'}.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleReactivate}
          variant="contained"
          color="success"
          disabled={loading || !pauseInfo}
        >
          {loading ? 'Reactivando...' : 'Confirmar Reactivación'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResumeDialog;