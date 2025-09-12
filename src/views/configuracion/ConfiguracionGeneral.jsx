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
    <Card>
      <CardContent>
        <Box mb={3}>
          <Typography variant="h6" display="flex" alignItems="center" gutterBottom>
            <Business sx={{ mr: 1 }} />
            Configuración del Centro
          </Typography>
          {user?.centro && (
            <Chip 
              label={`${user.centro.nombre} (${user.centro.codigo})`}
              color="primary"
              variant="outlined"
              size="small"
            />
          )}
        </Box>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Información del Centro */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
                Información del Centro
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre del Centro"
                name="nombreCentro"
                value={formData.nombreCentro}
                onChange={handleChange}
                placeholder="Centro de Rehabilitación Integral"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+51 123 456 789"
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
                InputLabelProps={{
                  shrink: true,
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
                InputLabelProps={{
                  shrink: true,
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
              />
            </Grid>



            {/* Configuraciones Regionales */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                <Language sx={{ mr: 1, verticalAlign: 'middle' }} />
                Configuraciones Regionales
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Formato de Fecha"
                name="formatoFecha"
                value={formData.formatoFecha}
                onChange={handleChange}
              >
                {formatosFecha.map((formato) => (
                  <MenuItem key={formato.value} value={formato.value}>
                    {formato.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Idioma del Sistema"
                name="idioma"
                value={formData.idioma}
                onChange={handleChange}
              >
                {idiomas.map((idioma) => (
                  <MenuItem key={idioma.value} value={idioma.value}>
                    {idioma.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Zona Horaria"
                name="zonaHoraria"
                value={formData.zonaHoraria}
                onChange={handleChange}
              >
                {zonasHorarias.map((zona) => (
                  <MenuItem key={zona.value} value={zona.value}>
                    {zona.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Formato de Hora"
                name="formatoHora"
                value={formData.formatoHora}
                onChange={handleChange}
              >
                {formatosHora.map((formato) => (
                  <MenuItem key={formato.value} value={formato.value}>
                    {formato.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Moneda"
                name="moneda"
                value={formData.moneda}
                onChange={handleChange}
              >
                {monedas.map((moneda) => (
                  <MenuItem key={moneda.value} value={moneda.value}>
                    {moneda.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button 
                  variant="contained" 
                  type="submit" 
                  color="primary"
                  startIcon={<Save />}
                  size="large"
                >
                  Guardar Configuraciones
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ConfiguracionGeneral;