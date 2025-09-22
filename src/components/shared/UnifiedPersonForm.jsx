import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Avatar,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Person,
  Save,
  Clear,
  PhotoCamera,
  ArrowBack,
  ArrowForward,
  Check,
  Warning,
  Info,
  Phone,
  Email,
  Badge,
  Home,
  Work,
  School,
  SupervisorAccount,
  LocalHospital
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { ApiService } from '../../services/apiService';
import { API_ENDPOINTS } from '../../config/api';

const UnifiedPersonForm = ({
  open,
  onClose,
  onPersonCreated,
  personType = 'persona', // 'persona', 'tutor', 'personal', 'paciente'
  initialData = null,
  title = null,
  enableMultiStep = true,
  requiredFields = [],
  optionalFields = [],
  customValidations = {},
  showPhotoUpload = true,
  autoCreatePersona = true, // Para crear persona automáticamente si es tutor/personal
}) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Datos básicos de persona
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    correo: '',
    fecha_nacimiento: '',
    genero: '',
    direccion: '',

    // Datos específicos según tipo
    // Para tutores
    relacion: '',
    es_contacto_emergencia: false,

    // Para personal
    especialidad_id: '',
    titulo_profesional: '',
    fecha_contratacion: '',
    estado: 'activo',

    // Para pacientes
    historia_clinica: '',
    alergias: '',
    medicamentos: '',
    observaciones: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [especialidades, setEspecialidades] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [photoPreview, setPhotoPreview] = useState(null);

  // Configuración de pasos según el tipo
  const getSteps = () => {
    const baseSteps = ['Datos Básicos'];

    switch (personType) {
      case 'tutor':
        return [...baseSteps, 'Información de Tutor', 'Confirmación'];
      case 'personal':
        return [...baseSteps, 'Información Profesional', 'Confirmación'];
      case 'paciente':
        return [...baseSteps, 'Información Médica', 'Confirmación'];
      default:
        return [...baseSteps, 'Confirmación'];
    }
  };

  const steps = enableMultiStep ? getSteps() : ['Formulario Completo'];

  // Cargar datos iniciales
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({ ...formData, ...initialData });
      }
      loadDependencies();
      setActiveStep(0);
      setErrors({});
    }
  }, [open, initialData]);

  const loadDependencies = async () => {
    try {
      if (personType === 'personal') {
        const response = await ApiService.get(API_ENDPOINTS.ESPECIALIDADES.BASE);
        if (response.data?.data) {
          setEspecialidades(response.data.data);
        }
      }
    } catch (error) {
      console.error('Error loading dependencies:', error);
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData({ ...formData, [field]: value });

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateStep = (stepIndex) => {
    const newErrors = {};

    switch (stepIndex) {
      case 0: // Datos básicos
        if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
        if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
        if (!formData.cedula.trim()) newErrors.cedula = 'La cédula es requerida';
        if (formData.cedula && !/^\d{10}$/.test(formData.cedula)) {
          newErrors.cedula = 'La cédula debe tener 10 dígitos';
        }
        if (formData.correo && !/\S+@\S+\.\S+/.test(formData.correo)) {
          newErrors.correo = 'El correo no tiene un formato válido';
        }
        if (formData.telefono && !/^\d{9,10}$/.test(formData.telefono)) {
          newErrors.telefono = 'El teléfono debe tener 9 o 10 dígitos';
        }
        break;

      case 1: // Datos específicos
        if (personType === 'tutor') {
          if (!formData.relacion.trim()) newErrors.relacion = 'La relación es requerida';
        } else if (personType === 'personal') {
          if (!formData.especialidad_id) newErrors.especialidad_id = 'La especialidad es requerida';
          if (!formData.titulo_profesional.trim()) newErrors.titulo_profesional = 'El título profesional es requerido';
        }
        break;
    }

    // Validaciones personalizadas
    Object.keys(customValidations).forEach(field => {
      const validationFn = customValidations[field];
      const error = validationFn(formData[field], formData);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    try {
      setLoading(true);
      let createdPerson = null;

      // Paso 1: Crear o actualizar persona base
      if (personType !== 'persona' && autoCreatePersona) {
        const personaData = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          cedula: formData.cedula,
          telefono: formData.telefono,
          correo: formData.correo,
          fecha_nacimiento: formData.fecha_nacimiento,
          genero: formData.genero,
          direccion: formData.direccion
        };

        const personaResponse = await ApiService.post(API_ENDPOINTS.PERSONAS.BASE, personaData);
        if (personaResponse.data?.data) {
          createdPerson = personaResponse.data.data;
        }
      } else {
        // Crear solo persona
        const response = await ApiService.post(API_ENDPOINTS.PERSONAS.BASE, formData);
        if (response.data?.data) {
          createdPerson = response.data.data;
        }
      }

      // Paso 2: Crear registro específico si es necesario
      if (createdPerson && personType !== 'persona') {
        let specificData = {};
        let endpoint = '';

        switch (personType) {
          case 'tutor':
            specificData = {
              persona_id: createdPerson.id,
              relacion: formData.relacion,
              es_contacto_emergencia: formData.es_contacto_emergencia
            };
            endpoint = API_ENDPOINTS.TUTORES.BASE;
            break;

          case 'personal':
            specificData = {
              persona_id: createdPerson.id,
              especialidad_id: formData.especialidad_id,
              titulo_profesional: formData.titulo_profesional,
              fecha_contratacion: formData.fecha_contratacion || new Date().toISOString().split('T')[0],
              estado: formData.estado
            };
            endpoint = API_ENDPOINTS.PERSONAL.BASE;
            break;

          case 'paciente':
            specificData = {
              persona_id: createdPerson.id,
              historia_clinica: formData.historia_clinica,
              alergias: formData.alergias,
              medicamentos: formData.medicamentos,
              observaciones: formData.observaciones
            };
            endpoint = API_ENDPOINTS.PACIENTES.BASE;
            break;
        }

        if (endpoint) {
          const specificResponse = await ApiService.post(endpoint, specificData);
          if (specificResponse.data?.data) {
            // Combinar datos para el callback
            createdPerson = {
              ...createdPerson,
              ...specificResponse.data.data,
              sourceType: personType,
              displayName: `${createdPerson.nombre} ${createdPerson.apellido}`
            };
          }
        }
      }

      // Llamar callback con la persona creada
      if (onPersonCreated && createdPerson) {
        onPersonCreated(createdPerson);
      }

      setSnackbar({
        open: true,
        message: `${getPersonTypeLabel()} creado exitosamente`,
        severity: 'success'
      });

      // Cerrar formulario después de un breve delay
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (error) {
      console.error('Error creating person:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al crear la persona',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nombre: '',
      apellido: '',
      cedula: '',
      telefono: '',
      correo: '',
      fecha_nacimiento: '',
      genero: '',
      direccion: '',
      relacion: '',
      es_contacto_emergencia: false,
      especialidad_id: '',
      titulo_profesional: '',
      fecha_contratacion: '',
      estado: 'activo',
      historia_clinica: '',
      alergias: '',
      medicamentos: '',
      observaciones: ''
    });
    setErrors({});
    setActiveStep(0);
    setPhotoPreview(null);
    onClose();
  };

  const getPersonTypeLabel = () => {
    const labels = {
      persona: 'Persona',
      tutor: 'Tutor',
      personal: 'Personal',
      paciente: 'Paciente'
    };
    return labels[personType] || 'Persona';
  };

  const getPersonTypeIcon = () => {
    const icons = {
      persona: <Person />,
      tutor: <SupervisorAccount />,
      personal: <LocalHospital />,
      paciente: <School />
    };
    return icons[personType] || <Person />;
  };

  const renderBasicDataStep = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} display="flex" justifyContent="center" mb={2}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'primary.main',
            fontSize: '2rem'
          }}
        >
          {formData.nombre ? formData.nombre[0].toUpperCase() : getPersonTypeIcon()}
        </Avatar>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label={<span>Nombre <span style={{ color: 'red', fontWeight: 'bold' }}>*</span></span>}
          value={formData.nombre}
          onChange={handleChange('nombre')}
          error={!!errors.nombre}
          helperText={errors.nombre}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person />
              </InputAdornment>
            )
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label={<span>Apellido <span style={{ color: 'red', fontWeight: 'bold' }}>*</span></span>}
          value={formData.apellido}
          onChange={handleChange('apellido')}
          error={!!errors.apellido}
          helperText={errors.apellido}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person />
              </InputAdornment>
            )
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label={<span>Cédula <span style={{ color: 'red', fontWeight: 'bold' }}>*</span></span>}
          value={formData.cedula}
          onChange={handleChange('cedula')}
          error={!!errors.cedula}
          helperText={errors.cedula}
          inputProps={{ maxLength: 10 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Badge />
              </InputAdornment>
            )
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Teléfono"
          value={formData.telefono}
          onChange={handleChange('telefono')}
          error={!!errors.telefono}
          helperText={errors.telefono}
          inputProps={{ maxLength: 10 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Phone />
              </InputAdornment>
            )
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Correo Electrónico"
          type="email"
          value={formData.correo}
          onChange={handleChange('correo')}
          error={!!errors.correo}
          helperText={errors.correo}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email />
              </InputAdornment>
            )
          }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Fecha de Nacimiento"
          type="date"
          value={formData.fecha_nacimiento}
          onChange={handleChange('fecha_nacimiento')}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Género</InputLabel>
          <Select
            value={formData.genero}
            onChange={handleChange('genero')}
            label="Género"
          >
            <MenuItem value="">Sin especificar</MenuItem>
            <MenuItem value="masculino">Masculino</MenuItem>
            <MenuItem value="femenino">Femenino</MenuItem>
            <MenuItem value="otro">Otro</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Dirección"
          value={formData.direccion}
          onChange={handleChange('direccion')}
          multiline
          rows={2}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Home />
              </InputAdornment>
            )
          }}
        />
      </Grid>
    </Grid>
  );

  const renderSpecificDataStep = () => {
    switch (personType) {
      case 'tutor':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Complete la información específica del tutor
              </Alert>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={<span>Relación con el paciente <span style={{ color: 'red', fontWeight: 'bold' }}>*</span></span>}
                value={formData.relacion}
                onChange={handleChange('relacion')}
                error={!!errors.relacion}
                helperText={errors.relacion}
                placeholder="Ej: Padre, Madre, Hermano, Tío..."
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.es_contacto_emergencia}
                    onChange={handleChange('es_contacto_emergencia')}
                  />
                }
                label="Es contacto de emergencia"
              />
            </Grid>
          </Grid>
        );

      case 'personal':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Complete la información profesional
              </Alert>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.especialidad_id}>
                <InputLabel><span>Especialidad <span style={{ color: 'red', fontWeight: 'bold' }}>*</span></span></InputLabel>
                <Select
                  value={formData.especialidad_id}
                  onChange={handleChange('especialidad_id')}
                  label="Especialidad"
                >
                  {especialidades.map((esp) => (
                    <MenuItem key={esp.id} value={esp.id}>
                      {esp.nombre}
                    </MenuItem>
                  ))}
                </Select>
                {errors.especialidad_id && (
                  <FormHelperText>{errors.especialidad_id}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={<span>Título Profesional <span style={{ color: 'red', fontWeight: 'bold' }}>*</span></span>}
                value={formData.titulo_profesional}
                onChange={handleChange('titulo_profesional')}
                error={!!errors.titulo_profesional}
                helperText={errors.titulo_profesional}
                placeholder="Ej: Licenciado en Psicología"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fecha de Contratación"
                type="date"
                value={formData.fecha_contratacion}
                onChange={handleChange('fecha_contratacion')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.estado}
                  onChange={handleChange('estado')}
                  label="Estado"
                >
                  <MenuItem value="activo">Activo</MenuItem>
                  <MenuItem value="inactivo">Inactivo</MenuItem>
                  <MenuItem value="licencia">En Licencia</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 'paciente':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Complete la información médica del paciente
              </Alert>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Historia Clínica"
                value={formData.historia_clinica}
                onChange={handleChange('historia_clinica')}
                multiline
                rows={3}
                placeholder="Resumen de la historia clínica del paciente..."
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Alergias"
                value={formData.alergias}
                onChange={handleChange('alergias')}
                multiline
                rows={2}
                placeholder="Alergias conocidas..."
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Medicamentos"
                value={formData.medicamentos}
                onChange={handleChange('medicamentos')}
                multiline
                rows={2}
                placeholder="Medicamentos actuales..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observaciones"
                value={formData.observaciones}
                onChange={handleChange('observaciones')}
                multiline
                rows={3}
                placeholder="Observaciones adicionales..."
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  const renderConfirmationStep = () => (
    <Box>
      <Alert severity="success" sx={{ mb: 3 }}>
        Revise la información antes de crear {getPersonTypeLabel().toLowerCase()}
      </Alert>

      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Datos Básicos
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Nombre:</Typography>
              <Typography variant="body1">{formData.nombre} {formData.apellido}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Cédula:</Typography>
              <Typography variant="body1">{formData.cedula}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Teléfono:</Typography>
              <Typography variant="body1">{formData.telefono || 'No especificado'}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Correo:</Typography>
              <Typography variant="body1">{formData.correo || 'No especificado'}</Typography>
            </Grid>
          </Grid>

          {personType !== 'persona' && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Información Específica de {getPersonTypeLabel()}
              </Typography>

              {personType === 'tutor' && (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Relación:</Typography>
                    <Typography variant="body1">{formData.relacion}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Contacto de emergencia:</Typography>
                    <Typography variant="body1">{formData.es_contacto_emergencia ? 'Sí' : 'No'}</Typography>
                  </Grid>
                </Grid>
              )}

              {personType === 'personal' && (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Título:</Typography>
                    <Typography variant="body1">{formData.titulo_profesional}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Estado:</Typography>
                    <Typography variant="body1">{formData.estado}</Typography>
                  </Grid>
                </Grid>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  const getStepContent = (stepIndex) => {
    if (!enableMultiStep) {
      return (
        <Box>
          {renderBasicDataStep()}
          {personType !== 'persona' && (
            <>
              <Divider sx={{ my: 3 }} />
              {renderSpecificDataStep()}
            </>
          )}
        </Box>
      );
    }

    switch (stepIndex) {
      case 0:
        return renderBasicDataStep();
      case 1:
        return renderSpecificDataStep();
      case 2:
        return renderConfirmationStep();
      default:
        return null;
    }
  };

  const isLastStep = activeStep === steps.length - 1;

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, maxHeight: '90vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            {getPersonTypeIcon()}
            <Typography variant="h6">
              {title || `Crear ${getPersonTypeLabel()}`}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          {enableMultiStep && (
            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          )}

          {getStepContent(activeStep)}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>

          {enableMultiStep && activeStep > 0 && (
            <Button
              onClick={handleBack}
              disabled={loading}
              startIcon={<ArrowBack />}
            >
              Anterior
            </Button>
          )}

          {enableMultiStep && !isLastStep ? (
            <Button
              onClick={handleNext}
              variant="contained"
              endIcon={<ArrowForward />}
              disabled={loading}
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              variant="contained"
              startIcon={<Save />}
              disabled={loading}
              color="success"
            >
              {loading ? 'Creando...' : `Crear ${getPersonTypeLabel()}`}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UnifiedPersonForm;