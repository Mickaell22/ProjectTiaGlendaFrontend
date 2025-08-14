import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  InputAdornment,
  IconButton,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Key,
  Visibility as VisibilityIcon,
  VisibilityOff,
  Security,
  Check,
  Close,
  Info
} from '@mui/icons-material';

import UsuarioService from '../../services/usuarioService.js';
import useSnackbar from '../../hooks/useSnackbar.js';

const UsuarioPassword = ({ 
  open, 
  onClose, 
  userId, 
  userName, 
  onPasswordChanged 
}) => {
  const [passwordData, setPasswordData] = useState({
    nueva_contrasenia: '',
    confirmar_contrasenia: ''
  });
  const [errors, setErrors] = useState({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { showSuccess, showError } = useSnackbar();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleClose = () => {
    setPasswordData({ nueva_contrasenia: '', confirmar_contrasenia: '' });
    setErrors({});
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setLoading(false);
    onClose();
  };

  const handleSubmit = async () => {
    const validation = UsuarioService.validatePasswordChange(passwordData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setLoading(true);
      const backendData = UsuarioService.formatPasswordChangeForBackend(passwordData);
      await UsuarioService.changePassword(userId, backendData);
      showSuccess('Contraseña cambiada correctamente');
      onPasswordChanged && onPasswordChanged();
      handleClose();
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!passwordData.nueva_contrasenia) return null;
    return UsuarioService.validatePasswordStrength(passwordData.nueva_contrasenia);
  };

  const passwordStrength = getPasswordStrength();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <Key sx={{ mr: 2 }} />
          Cambiar Contraseña
          {userName && (
            <Chip 
              label={`Usuario: ${userName}`}
              variant="outlined"
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Información de seguridad */}
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Política de contraseñas:</strong> La nueva contraseña debe tener al menos 8 caracteres, 
                incluir letras mayúsculas, minúsculas, números y caracteres especiales.
              </Typography>
            </Alert>
          </Grid>

          {/* Campo de nueva contraseña */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type={showNewPassword ? 'text' : 'password'}
              label="Nueva Contraseña"
              name="nueva_contrasenia"
              value={passwordData.nueva_contrasenia}
              onChange={handleChange}
              error={!!errors.nueva_contrasenia}
              helperText={errors.nueva_contrasenia}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Security color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Campo de confirmar contraseña */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirmar Nueva Contraseña"
              name="confirmar_contrasenia"
              value={passwordData.confirmar_contrasenia}
              onChange={handleChange}
              error={!!errors.confirmar_contrasenia}
              helperText={errors.confirmar_contrasenia}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Security color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Indicador de fortaleza de contraseña */}
          {passwordStrength && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom display="flex" alignItems="center">
                    <Info sx={{ mr: 1 }} />
                    Análisis de Seguridad de la Contraseña
                  </Typography>
                  
                  <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Fortaleza:
                    </Typography>
                    <Chip 
                      label={passwordStrength.strength} 
                      color={passwordStrength.color}
                      size="small"
                    />
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={(passwordStrength.score / 5) * 100}
                    color={passwordStrength.color}
                    sx={{ mb: 2, height: 8, borderRadius: 4 }}
                  />

                  {passwordStrength.suggestions.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Recomendaciones para mejorar la seguridad:
                      </Typography>
                      <List dense>
                        {passwordStrength.suggestions.map((suggestion, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <Info color="info" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={suggestion}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {/* Validaciones visuales */}
                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Requisitos:
                    </Typography>
                    <Grid container spacing={1}>
                      {[
                        { check: passwordData.nueva_contrasenia.length >= 8, text: "Mínimo 8 caracteres" },
                        { check: /[a-z]/.test(passwordData.nueva_contrasenia), text: "Letra minúscula" },
                        { check: /[A-Z]/.test(passwordData.nueva_contrasenia), text: "Letra mayúscula" },
                        { check: /\d/.test(passwordData.nueva_contrasenia), text: "Número" },
                        { check: /[^A-Za-z0-9]/.test(passwordData.nueva_contrasenia), text: "Carácter especial" },
                        { check: passwordData.nueva_contrasenia === passwordData.confirmar_contrasenia && passwordData.nueva_contrasenia !== '', text: "Contraseñas coinciden" }
                      ].map((item, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <Box display="flex" alignItems="center">
                            {item.check ? (
                              <Check color="success" fontSize="small" sx={{ mr: 1 }} />
                            ) : (
                              <Close color="error" fontSize="small" sx={{ mr: 1 }} />
                            )}
                            <Typography 
                              variant="caption" 
                              color={item.check ? "success.main" : "error.main"}
                            >
                              {item.text}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
        >
          Cancelar
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={
            loading || 
            !passwordData.nueva_contrasenia || 
            !passwordData.confirmar_contrasenia ||
            passwordData.nueva_contrasenia !== passwordData.confirmar_contrasenia
          }
          startIcon={<Key />}
        >
          {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UsuarioPassword;