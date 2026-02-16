import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import PacienteService from '../../services/pacienteService';
import { format } from 'date-fns';

const PauseDialog = ({
  open,
  onClose,
  paciente,
  especialidadId = null,
  onPauseSuccess
}) => {
  const [formData, setFormData] = useState({
    fecha_inicio_pausa: new Date(),
    fecha_fin_pausa: null,
    motivo_pausa: '',
    observaciones_pausa: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        fecha_inicio_pausa: new Date(),
        fecha_fin_pausa: null,
        motivo_pausa: '',
        observaciones_pausa: ''
      });
      setErrors({});
    }
  }, [open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when field is modified
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const validation = PacienteService.validatePauseData({
      ...formData,
      fecha_inicio_pausa: formData.fecha_inicio_pausa ? format(formData.fecha_inicio_pausa, 'yyyy-MM-dd') : null,
      fecha_fin_pausa: formData.fecha_fin_pausa ? format(formData.fecha_fin_pausa, 'yyyy-MM-dd') : null
    });

    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!paciente?.id) {
      setErrors({ general: 'No se encontró información válida del paciente' });
      return;
    }

    setLoading(true);
    try {
      const pauseData = {
        paciente_id: paciente.id,
        fecha_inicio_pausa: format(formData.fecha_inicio_pausa, 'yyyy-MM-dd'),
        fecha_fin_pausa: formData.fecha_fin_pausa ? format(formData.fecha_fin_pausa, 'yyyy-MM-dd') : null,
        motivo_pausa: formData.motivo_pausa.trim(),
        observaciones_pausa: formData.observaciones_pausa?.trim() || null
      };

      let result;
      if (especialidadId) {
        // Pausar especialidad específica
        pauseData.especialidad_id = especialidadId;
        result = await PacienteService.pausarEspecialidadPaciente(paciente.id, especialidadId, pauseData);
      } else {
        // Pausar paciente general
        result = await PacienteService.pausarPacienteGeneral(paciente.id, pauseData);
      }

      onPauseSuccess(result);
      onClose();
    } catch (error) {
      console.error('Error pausando:', error);
      setErrors({
        general: error.message || 'Error al pausar el tratamiento'
      });
    } finally {
      setLoading(false);
    }
  };

  const isPausingSpecialty = !!especialidadId;
  const especialidadInfo = isPausingSpecialty && paciente?.especialidades
    ? paciente.especialidades.find(esp => esp.id_especialidad === especialidadId)
    : null;

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
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
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
            {isPausingSpecialty ? 'Pausar Especialidad' : 'Pausar Paciente'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {paciente?.nombre_completo || 'Sin nombre'}
          </Typography>
          {isPausingSpecialty && especialidadInfo && (
            <Box sx={{ mt: 1 }}>
              <Chip
                label={especialidadInfo.especialidad_nombre || 'Especialidad'}
                color="primary"
                variant="outlined"
                size="small"
              />
            </Box>
          )}
        </DialogTitle>

        <DialogContent dividers>
          {errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.general}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Fecha de Inicio de Pausa *"
                value={formData.fecha_inicio_pausa}
                onChange={(newValue) => handleChange('fecha_inicio_pausa', newValue)}
                maxDate={new Date()}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!errors.fecha_inicio_pausa}
                    helperText={errors.fecha_inicio_pausa}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Fecha de Fin de Pausa (Opcional)"
                value={formData.fecha_fin_pausa}
                onChange={(newValue) => handleChange('fecha_fin_pausa', newValue)}
                minDate={formData.fecha_inicio_pausa}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!errors.fecha_fin_pausa}
                    helperText={errors.fecha_fin_pausa || 'Dejar vacío si no se conoce la fecha de fin'}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Motivo de la Pausa *"
                value={formData.motivo_pausa}
                onChange={(e) => handleChange('motivo_pausa', e.target.value)}
                error={!!errors.motivo_pausa}
                helperText={errors.motivo_pausa || 'Describe brevemente el motivo de la pausa'}
                multiline
                rows={2}
                placeholder="Ej: Viaje familiar, problemas de salud, situación económica..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observaciones Adicionales"
                value={formData.observaciones_pausa}
                onChange={(e) => handleChange('observaciones_pausa', e.target.value)}
                multiline
                rows={3}
                placeholder="Información adicional relevante sobre la pausa..."
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Nota:</strong> {isPausingSpecialty
                ? 'Se pausará únicamente la especialidad seleccionada. Las demás especialidades del paciente permanecerán activas.'
                : 'Se pausarán todas las especialidades y tratamientos del paciente.'
              }
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="warning"
            disabled={loading}
          >
            {loading ? 'Pausando...' : 'Confirmar Pausa'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default PauseDialog;