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
  Language,
  Schedule,
  PhotoCamera
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


  const formatosFecha = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
    { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (31-12-2024)' }
  ];

  const idiomas = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Português' }
  ];

  const zonasHorarias = [
    { value: 'America/Guayaquil', label: 'Ecuador (UTC-5)' },
    { value: 'America/Lima', label: 'Perú (UTC-5)' },
    { value: 'America/Mexico_City', label: 'México (UTC-6)' },
    { value: 'America/Bogota', label: 'Colombia (UTC-5)' },
    { value: 'America/Argentina/Buenos_Aires', label: 'Argentina (UTC-3)' },
    { value: 'America/Santiago', label: 'Chile (UTC-3)' }
  ];

  const formatosHora = [
    { value: '24h', label: '24 horas (14:30)' },
    { value: '12h', label: '12 horas (2:30 PM)' }
  ];

  const monedas = [
    { value: 'USD', label: 'Dólares (USD)' },
    { value: 'EUR', label: 'Euros (€)' },
    { value: 'PEN', label: 'Soles Peruanos (S/)' },
    { value: 'MXN', label: 'Pesos Mexicanos ($)' },
    { value: 'COP', label: 'Pesos Colombianos ($)' }
  ];

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
        mb: 4, 
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', 
        color: 'white',
        boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)'
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
        <Grid item xs={12} lg={8}>
          <Card sx={{ 
            height: 'fit-content',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            '&:hover': { 
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
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

        {/* Configuraciones Regionales */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            height: 'fit-content',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            '&:hover': { 
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)'
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '12px', 
                  background: 'linear-gradient(45deg, #4caf50, #81c784)',
                  mr: 2
                }}>
                  <Language sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    Configuración Regional
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Formatos y localización
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Formato de Fecha"
                    name="formatoFecha"
                    value={formData.formatoFecha}
                    onChange={handleChange}
                    variant="outlined"
                  >
                    {formatosFecha.map((formato) => (
                      <MenuItem key={formato.value} value={formato.value}>
                        {formato.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Formato de Hora"
                    name="formatoHora"
                    value={formData.formatoHora}
                    onChange={handleChange}
                    variant="outlined"
                  >
                    {formatosHora.map((formato) => (
                      <MenuItem key={formato.value} value={formato.value}>
                        {formato.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Idioma del Sistema"
                    name="idioma"
                    value={formData.idioma}
                    onChange={handleChange}
                    variant="outlined"
                  >
                    {idiomas.map((idioma) => (
                      <MenuItem key={idioma.value} value={idioma.value}>
                        {idioma.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Zona Horaria"
                    name="zonaHoraria"
                    value={formData.zonaHoraria}
                    onChange={handleChange}
                    variant="outlined"
                  >
                    {zonasHorarias.map((zona) => (
                      <MenuItem key={zona.value} value={zona.value}>
                        {zona.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Moneda"
                    name="moneda"
                    value={formData.moneda}
                    onChange={handleChange}
                    variant="outlined"
                  >
                    {monedas.map((moneda) => (
                      <MenuItem key={moneda.value} value={moneda.value}>
                        {moneda.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Preview de configuración */}
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: 2, 
                    border: '1px solid #e9ecef' 
                  }}>
                    <Typography variant="body2" fontWeight="bold" color="text.secondary" gutterBottom>
                      Vista Previa:
                    </Typography>
                    <Typography variant="body2">
                      • Fecha: <strong>{formData.formatoFecha}</strong>
                    </Typography>
                    <Typography variant="body2">
                      • Hora: <strong>{formData.formatoHora}</strong>
                    </Typography>
                    <Typography variant="body2">
                      • Moneda: <strong>{formData.moneda}</strong>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
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
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                color: 'white',
                fontWeight: 'bold',
                px: 6,
                py: 1.5,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
                '&:hover': { 
                  background: 'linear-gradient(45deg, #1565c0, #1e88e5)',
                  boxShadow: '0 6px 25px rgba(25, 118, 210, 0.4)',
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
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', 
            border: '1px solid #90caf9',
            mt: 2
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Schedule sx={{ mr: 2, color: '#1976d2' }} />
                <Typography variant="h6" color="#1565c0" fontWeight="bold">
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
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>📋 Aplica para:</strong>
                  </Typography>
                  <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 0 }}>
                    <li>Sesiones terapéuticas</li>
                    <li>Clases pedagógicas</li>
                    <li>Disponibilidad del personal</li>
                    <li>Reportes y estadísticas</li>
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