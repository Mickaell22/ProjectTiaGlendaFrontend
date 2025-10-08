import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Stack,
  Divider,
  Box,
  Avatar,
  IconButton,
  Chip,
  Paper,
  Container,
  useTheme,
  InputAdornment
} from '@mui/material';
import {
  Save,
  Business,
  Schedule,
  Phone,
  Email,
  LocationOn,
  AccessTime,
  CheckCircle,
  Info
} from '@mui/icons-material';

// Estilos compartidos para inputs
const purpleOutlineSX = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'primary.main' },
    '&:hover fieldset': { borderColor: 'primary.main' },
    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
  }
};

const ConfiguracionGeneral = ({ configuracion = {}, onSave }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    nombreCentro: '',
    direccion: '',
    telefono: '',
    email: '',
    horarioInicio: '08:00',
    horarioFin: '17:00',
    zonaHoraria: 'America/Guayaquil',
    formatoFecha: 'DD/MM/YYYY',
    formatoHora: '24h',
    moneda: 'USD',
    idioma: 'es',
    descripcion: '',
    ...configuracion
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, ...configuracion }));
  }, [configuracion]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 0 }}>
      <Card
        elevation={8}
        sx={{
          borderRadius: 4,
          mb: 4,
          backgroundColor: 'background.paper',
          border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
          overflow: 'hidden',
          width: '100%',
          maxWidth: { xs: '100%', sm: 1000, md: 1200 },
          mx: 'auto'
        }}
      >
        {/* Header con gradiente */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center">
              <Business sx={{ mr: 1, fontSize: 28 }} />
              Configuración del Centro
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Administra información básica y configuraciones regionales
            </Typography>
          </Box>
          {user?.centro && (
            <Chip
              label={`${user.centro.nombre} (${user.centro.codigo})`}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}
            />
          )}
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Box component="form" onSubmit={handleSubmit}>
            {/* Información del Centro */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 3,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                border: `1px solid ${theme.palette.divider}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 48,
                    height: 48,
                    mr: 2
                  }}
                >
                  <Business sx={{ fontSize: 24 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    Información del Centro
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Datos básicos y de contacto
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre del Centro"
                    name="nombreCentro"
                    value={formData.nombreCentro}
                    onChange={handleChange}
                    placeholder="Centro de Rehabilitación Integral"
                    required
                    variant="outlined"
                    sx={purpleOutlineSX}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Business color="primary" />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="+593 98 765 4321"
                    variant="outlined"
                    sx={purpleOutlineSX}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone color="primary" />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contacto@centro.com"
                    variant="outlined"
                    sx={purpleOutlineSX}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="primary" />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Dirección"
                    name="direccion"
                    multiline
                    rows={2}
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Dirección completa del centro"
                    variant="outlined"
                    sx={purpleOutlineSX}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                          <LocationOn color="primary" />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descripción"
                    name="descripcion"
                    multiline
                    rows={3}
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Descripción del centro de rehabilitación"
                    variant="outlined"
                    sx={purpleOutlineSX}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Horarios de Operación */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 3,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                border: `1px solid ${theme.palette.divider}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar
                  sx={{
                    bgcolor: 'success.main',
                    width: 48,
                    height: 48,
                    mr: 2
                  }}
                >
                  <Schedule sx={{ fontSize: 24 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    Horarios de Operación
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Define el horario de atención del centro
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Horario de Inicio"
                    name="horarioInicio"
                    type="time"
                    value={formData.horarioInicio}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    sx={purpleOutlineSX}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTime color="success" />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Horario de Fin"
                    name="horarioFin"
                    type="time"
                    value={formData.horarioFin}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    sx={purpleOutlineSX}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTime color="success" />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.1)',
                      border: `1px solid ${theme.palette.success.main}`
                    }}
                  >
                    <Box display="flex" alignItems="flex-start" gap={2}>
                      <Info sx={{ color: 'success.main', mt: 0.5 }} />
                      <Box>
                        <Typography variant="body2" fontWeight="medium" color="success.main" gutterBottom>
                          Información de Horarios
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.mode === 'dark' ? 'grey.300' : 'text.secondary' }}>
                          <strong>Horario Operativo:</strong> {formData.horarioInicio} - {formData.horarioFin}
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.mode === 'dark' ? 'grey.300' : 'text.secondary', mt: 1 }}>
                          Este horario se aplicará para:
                        </Typography>
                        <Box component="ul" sx={{ m: 0, pl: 2, mt: 0.5 }}>
                          <Typography variant="body2" sx={{ color: theme.palette.mode === 'dark' ? 'grey.300' : 'text.secondary' }} component="li">
                            Sesiones terapéuticas
                          </Typography>
                          <Typography variant="body2" sx={{ color: theme.palette.mode === 'dark' ? 'grey.300' : 'text.secondary' }} component="li">
                            Clases pedagógicas
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>

            {/* Botón de guardar */}
            <Box sx={{ textAlign: 'center', mt: 3, mb: 2 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                size="large"
                sx={{
                  fontWeight: 'bold',
                  px: 6,
                  py: 1.5,
                  borderRadius: 3,
                  boxShadow: 4,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Guardar Configuración General
              </Button>
              <Box display="flex" alignItems="center" justifyContent="center" gap={1} sx={{ mt: 2 }}>
                <CheckCircle sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Los cambios se aplicarán inmediatamente en todo el sistema
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ConfiguracionGeneral;