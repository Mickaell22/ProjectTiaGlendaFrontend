// src/views/perfil/MiPerfil.jsx
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Badge,
  LocationOn,
  Work,
  Business,
  CalendarToday,
  PhotoCamera,
  Edit,
  CloudUpload,
  Delete,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

import useSnackbar from '../../hooks/useSnackbar.js';
import { API_CONFIG, API_ENDPOINTS } from '../../config/api.js';
import FotoPerfilService from '../../services/fotoPerfilService.js';
import FotoPerfilConAutorizacion from '../../components/shared/FotoPerfilConAutorizacion.jsx';

const MiPerfil = () => {
  const [userData, setUserData] = useState(null);
  const [photoData, setPhotoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const { showSuccess, showError } = useSnackbar();

  // Obtener datos del usuario desde localStorage o JWT
  const getCurrentUser = () => {
    try {
      // Intentar obtener de user guardado por AuthContext
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedData = JSON.parse(userData);
        console.log('User data from AuthContext:', parsedData);
        return parsedData;
      }
      
      // Intentar obtener de login_data (estructura del backend actual)
      const loginData = localStorage.getItem('login_data');
      if (loginData) {
        const parsedLogin = JSON.parse(loginData);
        console.log('Login data found:', parsedLogin);
        if (parsedLogin.user) {
          return {
            id: parsedLogin.user.id,
            nombre_completo: parsedLogin.user.nombre_completo,
            usuario: parsedLogin.user.usuario,
            correo: parsedLogin.user.correo,
            rol: parsedLogin.user.rol,
            centro_nombre: parsedLogin.user.centro?.nombre || 'Centro Tía Glenda'
          };
        }
      }
      
      // Intentar obtener de full_login_data
      const fullLoginData = localStorage.getItem('full_login_data');
      if (fullLoginData) {
        const parsedFullLogin = JSON.parse(fullLoginData);
        console.log('Full login data found:', parsedFullLogin);
        if (parsedFullLogin.data?.user) {
          const user = parsedFullLogin.data.user;
          return {
            id: user.id,
            nombre_completo: user.nombre_completo,
            usuario: user.usuario,
            correo: user.correo,
            rol: user.rol,
            centro_nombre: user.centro?.nombre || 'Centro Tía Glenda'
          };
        }
      }
      
      // Si no hay datos, intentar extraer del JWT
      const token = localStorage.getItem('jwt_token');
      if (token && token.split('.').length === 3) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('User data from JWT:', payload);
          return {
            id: payload.user_id || payload.id || payload.sub,
            nombre_completo: payload.username || payload.nombre || 'Usuario',
            usuario: payload.username || payload.usuario,
            rol: payload.rol || 'Usuario'
          };
        } catch (jwtError) {
          console.error('Error parsing JWT:', jwtError);
        }
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
    return null;
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      console.log('🚀 Loading user data...');
      const currentUser = getCurrentUser();
      console.log('👤 Current user from storage:', currentUser);
      
      if (currentUser) {
        // Usar datos del localStorage/JWT como base
        const enhancedUser = {
          ...currentUser,
          nombre_completo: currentUser.nombre_completo || currentUser.name || 'Usuario',
          rol_nombre: currentUser.rol || 'Usuario',
          centro_nombre: currentUser.centro_nombre || 'Centro Tía Glenda'
        };
        
        console.log('✅ Enhanced user data:', enhancedUser);
        setUserData(enhancedUser);
        
        // Cargar información específica de foto de perfil
        await loadPhotoData();
      } else {
        console.log('❌ No user data found');
        showError('No se encontraron datos de usuario');
      }
    } catch (error) {
      console.error('💥 Error loading user data:', error);
      showError('Error cargando información del perfil');
    } finally {
      setLoading(false);
    }
  };

  const loadPhotoData = async () => {
    try {
      console.log('🔄 Loading photo data...');
      const resultado = await FotoPerfilService.obtenerMiFoto();
      console.log('📡 Photo API response:', resultado);
      
      if (resultado.success) {
        setPhotoData(resultado.data);
        console.log('✅ Photo data loaded:', resultado.data);
        
        if (resultado.data.foto_perfil) {
          const photoUrl = FotoPerfilService.generarUrlFoto(resultado.data.foto_perfil);
          console.log('🖼️ Generated photo URL:', photoUrl);
        } else {
          console.log('ℹ️ No photo file found for user');
        }
      } else {
        console.log('❌ No photo data:', resultado.message);
        // Set empty photo data structure
        setPhotoData({
          foto_perfil: null,
          archivo_existe: false,
          nombre_completo: userData?.nombre_completo || 'Usuario'
        });
      }
    } catch (error) {
      console.error('💥 Error loading photo data:', error);
      setPhotoData(null);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar archivo usando el servicio
      const validacion = FotoPerfilService.validarArchivo(file);
      if (!validacion.valido) {
        showError(validacion.mensaje);
        return;
      }

      setSelectedFile(file);
      
      // Crear preview usando el servicio
      try {
        const previewUrl = await FotoPerfilService.crearPreview(file);
        setPreviewUrl(previewUrl);
      } catch (error) {
        console.error('Error creando preview:', error);
        showError('Error creando preview de la imagen');
      }
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile || !userData) return;

    try {
      setUploadingPhoto(true);
      
      const resultado = await FotoPerfilService.subirMiFoto(selectedFile);
      
      if (resultado.success) {
        console.log('✅ Photo uploaded successfully:', resultado);
        showSuccess(resultado.message);
        setPhotoDialogOpen(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        // Recargar datos de foto
        console.log('🔄 Reloading photo data after upload...');
        await loadPhotoData();
      } else {
        console.log('❌ Photo upload failed:', resultado.message);
        showError(resultado.message);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      showError('Error subiendo foto de perfil');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!userData) return;

    try {
      setUploadingPhoto(true);

      const resultado = await FotoPerfilService.eliminarMiFoto();
      
      if (resultado.success) {
        showSuccess(resultado.message);
        setPhotoDialogOpen(false);
        // Recargar datos de foto
        await loadPhotoData();
      } else {
        showError(resultado.message);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      showError('Error eliminando foto de perfil');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const closePhotoDialog = () => {
    setPhotoDialogOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          Cargando perfil...
        </Typography>
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          No se pudo cargar la información del perfil
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Mi Perfil
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Información personal y configuración de la cuenta
        </Typography>
      </Box>

      {/* Tarjeta Principal de Perfil */}
      <Card
        elevation={8}
        sx={{
          mb: 4,
          borderRadius: 4,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          overflow: 'hidden'
        }}
      >
        {/* Header con gradiente */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box display="flex" alignItems="center">
            {/* Avatar con foto de perfil */}
            <Box sx={{ position: 'relative' }}>
              <FotoPerfilConAutorizacion
                rutaFoto={photoData?.foto_perfil}
                nombreCompleto={userData?.nombre_completo || 'Usuario'}
                size={120}
                showTooltip={false}
                sx={{
                  fontSize: '3rem',
                  mr: 3,
                  border: '4px solid rgba(255,255,255,0.3)'
                }}
              />
              
              <IconButton
                onClick={() => setPhotoDialogOpen(true)}
                sx={{
                  position: 'absolute',
                  bottom: -8,
                  right: 8,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                <PhotoCamera />
              </IconButton>
            </Box>

            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {userData.nombre_completo || `${userData.nombre || ''} ${userData.apellido || ''}`.trim()}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                @{userData.usuario || userData.nombre_usuario}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8 }}>
                {userData.rol_nombre || userData.rol || 'Usuario'}
              </Typography>
            </Box>
          </Box>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4}>
            {/* Información Personal */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
                <Person sx={{ mr: 1 }} />
                Información Personal
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                <ListItem>
                  <ListItemIcon><Badge color="primary" /></ListItemIcon>
                  <ListItemText
                    primary="Cédula de Identidad"
                    secondary={userData.cedula || 'No registrada'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon><Phone color="primary" /></ListItemIcon>
                  <ListItemText
                    primary="Teléfono"
                    secondary={userData.telefono || 'No registrado'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon><Email color="primary" /></ListItemIcon>
                  <ListItemText
                    primary="Correo Electrónico"
                    secondary={userData.correo || 'No registrado'}
                  />
                </ListItem>

                {userData.direccion && (
                  <ListItem>
                    <ListItemIcon><LocationOn color="primary" /></ListItemIcon>
                    <ListItemText
                      primary="Dirección"
                      secondary={userData.direccion}
                    />
                  </ListItem>
                )}

                {userData.fecha_nacimiento && (
                  <ListItem>
                    <ListItemIcon><CalendarToday color="primary" /></ListItemIcon>
                    <ListItemText
                      primary="Fecha de Nacimiento"
                      secondary={new Date(userData.fecha_nacimiento).toLocaleDateString()}
                    />
                  </ListItem>
                )}
              </List>
            </Grid>

            {/* Información del Sistema */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
                <Work sx={{ mr: 1 }} />
                Información del Sistema
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                <ListItem>
                  <ListItemIcon><Business color="primary" /></ListItemIcon>
                  <ListItemText
                    primary="Centro de Trabajo"
                    secondary={userData.centro_nombre || userData.centro_display || 'Centro Tía Glenda'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon><Work color="primary" /></ListItemIcon>
                  <ListItemText
                    primary="Rol del Sistema"
                    secondary={userData.rol_nombre || userData.rol || 'Usuario'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon><CalendarToday color="primary" /></ListItemIcon>
                  <ListItemText
                    primary="Miembro desde"
                    secondary={userData.fecha_creacion ? new Date(userData.fecha_creacion).toLocaleDateString() : 'Fecha no disponible'}
                  />
                </ListItem>

                {userData.fecha_ultimo_acceso && (
                  <ListItem>
                    <ListItemIcon><CalendarToday color="primary" /></ListItemIcon>
                    <ListItemText
                      primary="Último Acceso"
                      secondary={new Date(userData.fecha_ultimo_acceso).toLocaleDateString()}
                    />
                  </ListItem>
                )}
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Dialog para gestión de foto de perfil */}
      <Dialog
        open={photoDialogOpen}
        onClose={closePhotoDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <PhotoCamera sx={{ mr: 1 }} />
            Gestionar Foto de Perfil
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            {/* Preview de la foto actual o nueva */}
            {previewUrl ? (
              <Avatar
                src={previewUrl}
                sx={{
                  width: 160,
                  height: 160,
                  mx: 'auto',
                  mb: 2,
                  fontSize: '4rem'
                }}
              />
            ) : (
              <FotoPerfilConAutorizacion
                rutaFoto={photoData?.foto_perfil}
                nombreCompleto={userData?.nombre_completo || 'Usuario'}
                size={160}
                showTooltip={false}
                sx={{
                  mx: 'auto',
                  mb: 2,
                  fontSize: '4rem'
                }}
              />
            )}

            {/* Botones de acción */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {/* Upload nueva foto */}
              <input
                id="photo-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <label htmlFor="photo-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  disabled={uploadingPhoto}
                >
                  {selectedFile ? 'Cambiar Foto' : 'Seleccionar Foto'}
                </Button>
              </label>

              {/* Eliminar foto actual */}
              {photoData?.foto_perfil && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={handleDeletePhoto}
                  disabled={uploadingPhoto}
                >
                  Eliminar Foto
                </Button>
              )}
            </Box>

            {/* Información sobre formatos */}
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
              Formatos: JPG, PNG, GIF, WebP. Máximo 5MB
            </Typography>

            {/* Barra de progreso durante upload */}
            {uploadingPhoto && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {selectedFile ? 'Subiendo foto...' : 'Eliminando foto...'}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={closePhotoDialog} disabled={uploadingPhoto}>
            Cancelar
          </Button>
          {selectedFile && (
            <Button
              onClick={handleUploadPhoto}
              variant="contained"
              disabled={uploadingPhoto}
            >
              Guardar Foto
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MiPerfil;