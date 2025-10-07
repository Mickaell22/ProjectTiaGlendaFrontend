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
  Chip
} from '@mui/material';
import {
  Save,
  Business,
  Schedule
} from '@mui/icons-material';

const ConfiguracionGeneral = ({ configuracion = {}, onSave }) => {
  const { user } = useAuth();
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
    <Box sx={{ p: 3 }}>
      {/* Header mejorado */}
      <Card sx={{
        borderRadius: 3,
        mb: 4,
        backgroundColor: 'primary.main',
        color: 'white',
        boxShadow: 3
      }}>
        <CardContent sx={{ py: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="center" textAlign="center">
            <Business sx={{ mr: 3, fontSize: 48 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                Configuración del Centro
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300 }}>
                Administra información básica y configuraciones regionales
              </Typography>
              {user?.centro && (
                <Chip 
                  label={`${user.centro.nombre} (${user.centro.codigo})`}
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                    color: 'white',
                    fontWeight: 'bold',
                    mt: 1
                  }}
                />
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={4}>

        {/* Información del Centro */}
        <Grid item xs={12}>
          <Card sx={{
            height: 'fit-content',
            boxShadow: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-2px)'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
                  mr: 2
                }}>
                  <Business sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    Información del Centro
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Datos básicos y de contacto
                  </Typography>
                </Box>
              </Box>
              
              <Box component="form" onSubmit={handleSubmit}>
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
                    />
                  </Grid>

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
                    />
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Botón centrado y espacioso */}
        <Grid item xs={12}>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={<Save />}
              size="large"
              sx={{
                fontWeight: 'bold',
                px: 6,
                py: 1.5,
                borderRadius: 3,
                boxShadow: 3,
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Guardar Configuración General
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Los cambios se aplicarán inmediatamente en todo el sistema
            </Typography>
          </Box>
        </Grid>

        {/* Panel informativo mejorado */}
        <Grid item xs={12}>
          <Card sx={{
            backgroundColor: 'primary.light',
            borderColor: 'primary.main',
            borderWidth: 1,
            borderStyle: 'solid',
            mt: 2
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Schedule sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                  Información de Horarios
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      <strong>Horario Operativo:</strong>
                    </Typography>
                    <Typography variant="h5" color="primary" gutterBottom>
                      {formData.horarioInicio} - {formData.horarioFin}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="primary.main" gutterBottom>
                    <strong>Aplica para:</strong>
                  </Typography>
                  <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 0 }} color="text.primary">
                    <li>Sesiones terapéuticas</li>
                    <li>Clases pedagógicas</li>
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ConfiguracionGeneral;