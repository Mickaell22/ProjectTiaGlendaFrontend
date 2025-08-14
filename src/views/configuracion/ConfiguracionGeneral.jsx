import React, { useState, useEffect } from 'react';
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
  Switch,
  FormControlLabel,
  Avatar,
  IconButton
} from '@mui/material';
import {
  Save,
  Business,
  Language,
  Palette,
  Schedule,
  PhotoCamera
} from '@mui/icons-material';

const ConfiguracionGeneral = ({ configuracion = {}, onSave }) => {
  const [formData, setFormData] = useState({
    nombreCentro: '',
    direccion: '',
    telefono: '',
    email: '',
    sitioWeb: '',
    formatoFecha: 'DD/MM/YYYY',
    idioma: 'es',
    zonaHoraria: 'America/Lima',
    moneda: 'PEN',
    logoUrl: '',
    colorPrimario: '#1976d2',
    colorSecundario: '#dc004e',
    mostrarLogo: true,
    ...configuracion
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(formData.logoUrl);

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
    { value: 'America/Lima', label: 'Perú (UTC-5)' },
    { value: 'America/Mexico_City', label: 'México (UTC-6)' },
    { value: 'America/Bogota', label: 'Colombia (UTC-5)' },
    { value: 'America/Argentina/Buenos_Aires', label: 'Argentina (UTC-3)' },
    { value: 'America/Santiago', label: 'Chile (UTC-3)' }
  ];

  const monedas = [
    { value: 'PEN', label: 'Soles Peruanos (S/)' },
    { value: 'USD', label: 'Dólares (USD)' },
    { value: 'EUR', label: 'Euros (€)' },
    { value: 'MXN', label: 'Pesos Mexicanos ($)' },
    { value: 'COP', label: 'Pesos Colombianos ($)' }
  ];

  useEffect(() => {
    setFormData(prev => ({ ...prev, ...configuracion }));
    setLogoPreview(configuracion.logoUrl || '');
  }, [configuracion]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setFormData(prev => ({ ...prev, logoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" mb={3} display="flex" alignItems="center">
          <Business sx={{ mr: 1 }} />
          Configuraciones Generales
        </Typography>
        
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
                label="Sitio Web"
                name="sitioWeb"
                value={formData.sitioWeb}
                onChange={handleChange}
                placeholder="https://www.centro.com"
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

            {/* Logo */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                <PhotoCamera sx={{ mr: 1, verticalAlign: 'middle' }} />
                Logo del Centro
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={logoPreview}
                  sx={{ width: 80, height: 80 }}
                  variant="rounded"
                >
                  <Business />
                </Avatar>
                <Box>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="logo-upload"
                    type="file"
                    onChange={handleLogoChange}
                  />
                  <label htmlFor="logo-upload">
                    <IconButton color="primary" aria-label="upload picture" component="span">
                      <PhotoCamera />
                    </IconButton>
                  </label>
                  <Typography variant="body2" color="text.secondary">
                    Subir logo (recomendado: 200x200px)
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.mostrarLogo}
                    onChange={handleChange}
                    name="mostrarLogo"
                  />
                }
                label="Mostrar logo en el sistema"
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

            {/* Personalización Visual */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                <Palette sx={{ mr: 1, verticalAlign: 'middle' }} />
                Personalización Visual
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Color Primario"
                name="colorPrimario"
                type="color"
                value={formData.colorPrimario}
                onChange={handleChange}
                InputProps={{
                  sx: { height: 56 }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Color Secundario"
                name="colorSecundario"
                type="color"
                value={formData.colorSecundario}
                onChange={handleChange}
                InputProps={{
                  sx: { height: 56 }
                }}
              />
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