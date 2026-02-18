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
  Alert,
  Tabs,
  Tab,
  Chip,
  Switch,
  FormControlLabel,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  useTheme,
  Menu,
  MenuItem,
  Tooltip,
  Checkbox,
  Autocomplete,
  FormControl,
  InputLabel,
  Select
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
  VisibilityOff,
  Settings,
  Notifications,
  Description,
  Upload,
  EditNote,
  CloudDownload,
  Add,
  ExitToApp
} from '@mui/icons-material';

import useSnackbar from '../../hooks/useSnackbar.js';
import { API_CONFIG, API_ENDPOINTS } from '../../config/api.js';
import FotoPerfilService from '../../services/fotoPerfilService.js';
import FotoPerfilConAutorizacion from '../../components/shared/FotoPerfilConAutorizacion.jsx';
import ApiService, { extractData } from '../../services/apiService.js';

const MiPerfil = () => {
  const theme = useTheme();
  const [userData, setUserData] = useState(null);
  const [photoData, setPhotoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Estados para las pestañas
  const [activeTab, setActiveTab] = useState(0);

  // Estados para configuración rápida
  const [notificationSettings, setNotificationSettings] = useState({
    push: true,
    reminders: true
  });

  // Estados para edición de información personal
  const [editInfoDialogOpen, setEditInfoDialogOpen] = useState(false);
  const [editedUserData, setEditedUserData] = useState({});
  const [savingInfo, setSavingInfo] = useState(false);

  // Estados para cambio de contraseña
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Estados para documentos personales
  const [documentos, setDocumentos] = useState([]);
  const [loadingDocumentos, setLoadingDocumentos] = useState(false);

  // Estados para gestión de documentos
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showReuploadDialog, setShowReuploadDialog] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Estados para formularios de documentos
  const [uploadForm, setUploadForm] = useState({
    archivo: null,
    tipo_documento: 'otros',
    descripcion: '',
  });

  const [editForm, setEditForm] = useState({
    descripcion: '',
  });

  const [reuploadForm, setReuploadForm] = useState({
    archivo: null,
    descripcion: '',
  });

  // Tipos de documento disponibles
  const tiposDocumento = [
    { value: 'cedula', label: '🆔 Cédula de Identidad' },
    { value: 'curriculum', label: '📄 Currículum Vitae' },
    { value: 'titulo_profesional', label: '🎓 Título Profesional' },
    { value: 'licencia_profesional', label: '🏥 Licencia Profesional' },
    { value: 'colegiatura', label: '🎖️ Colegiatura' },
    { value: 'certificacion', label: '🏆 Certificación' },
    { value: 'capacitacion', label: '📚 Capacitación' },
    { value: 'contrato', label: '🤝 Contrato' },
    { value: 'referencias', label: '📋 Referencias Laborales' },
    { value: 'foto_personal', label: '📸 Foto Personal' },
    { value: 'otros', label: '📎 Otros Documentos' }
  ];

  const { showSuccess, showError } = useSnackbar();

  // Función para verificar si el usuario puede gestionar documentos
  const canManageDocuments = () => {
    const { isTerapeuta, isEducador, roleType } = getUserRole();
    return isTerapeuta || isEducador || roleType === 'terapeuta' || roleType === 'educador';
  };

  // Utility function para verificar roles de usuario
  const getUserRole = () => {
    if (!userData) return { isAdmin: false, isTerapeuta: false, roleType: 'unknown' };

    const rol = userData.rol_nombre || userData.rol || '';
    const roleLower = rol.toLowerCase();

    const isAdmin = rol === 'Administrador' || roleLower.includes('admin');
    const isTerapeuta = roleLower.includes('terapeuta') || roleLower.includes('terapia');
    const isEducador = roleLower.includes('educador') || roleLower.includes('pedagog');

    let roleType = 'usuario';
    if (isAdmin) roleType = 'admin';
    else if (isTerapeuta) roleType = 'terapeuta';
    else if (isEducador) roleType = 'educador';

    return { isAdmin, isTerapeuta, isEducador, roleType, roleName: rol };
  };

  // Obtener datos del usuario desde localStorage o JWT
  const getCurrentUser = () => {
    try {
      // Intentar obtener de user guardado por AuthContext
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedData = JSON.parse(userData);
        return parsedData;
      }
      
      // Intentar obtener de login_data (estructura del backend actual)
      const loginData = localStorage.getItem('login_data');
      if (loginData) {
        const parsedLogin = JSON.parse(loginData);
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
      const currentUser = getCurrentUser();

      if (currentUser) {
        // Intentar cargar datos completos desde el backend primero
        try {
          const response = await ApiService.get('/api/me');
          const backendUserData = extractData(response);

          if (backendUserData) {
            // Usar datos del backend como fuente principal
            const enhancedUser = {
              ...currentUser, // Mantener datos base
              ...backendUserData, // Sobrescribir con datos del backend
              nombre_completo: backendUserData.nombre_completo || currentUser.nombre_completo || currentUser.name || 'Usuario',
              rol_nombre: backendUserData.rol_nombre || backendUserData.rol || currentUser.rol || 'Usuario',
              centro_nombre: backendUserData.centro_nombre || currentUser.centro_nombre || 'Centro Tía Glenda',
              // Asegurar que cédula y otros datos personales estén incluidos
              cedula: backendUserData.cedula || backendUserData.numero_identificacion || currentUser.cedula,
              telefono: backendUserData.telefono || currentUser.telefono,
              direccion: backendUserData.direccion || currentUser.direccion,
              fecha_nacimiento: backendUserData.fecha_nacimiento || currentUser.fecha_nacimiento,
              fecha_creacion: backendUserData.fecha_creacion || currentUser.fecha_creacion,
              fecha_ultimo_acceso: backendUserData.fecha_ultimo_acceso || currentUser.fecha_ultimo_acceso
            };

            setUserData(enhancedUser);
          } else {
            // Fallback a datos locales si el backend no responde
            const enhancedUser = {
              ...currentUser,
              nombre_completo: currentUser.nombre_completo || currentUser.name || 'Usuario',
              rol_nombre: currentUser.rol || 'Usuario',
              centro_nombre: currentUser.centro_nombre || 'Centro Tía Glenda'
            };
            setUserData(enhancedUser);
          }
        } catch (backendError) {
          console.warn('No se pudo cargar datos desde el backend, usando datos locales:', backendError);
          // Fallback a datos locales
          const enhancedUser = {
            ...currentUser,
            nombre_completo: currentUser.nombre_completo || currentUser.name || 'Usuario',
            rol_nombre: currentUser.rol || 'Usuario',
            centro_nombre: currentUser.centro_nombre || 'Centro Tía Glenda'
          };
          setUserData(enhancedUser);
        }

        // Cargar información específica de foto de perfil
        await loadPhotoData();
      } else {
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
      const resultado = await FotoPerfilService.obtenerMiFoto();

      if (resultado.success) {
        setPhotoData(resultado.data);
      } else {
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

  const loadDocumentos = async () => {
    if (!userData?.id) return;

    try {
      setLoadingDocumentos(true);
      // Si el usuario tiene personal_id, usar esa ruta; si no, usar su ID
      const apiUrl = userData.personal_id
        ? `/api/personal/${userData.personal_id}/documentos`
        : `/api/usuarios/${userData.id}/documentos`;

      const response = await ApiService.get(apiUrl);
      const data = extractData(response);
      setDocumentos(data || []);
    } catch (error) {
      console.error('Error loading documentos:', error);
      // No mostrar error si simplemente no hay endpoint - es normal
      setDocumentos([]);
    } finally {
      setLoadingDocumentos(false);
    }
  };

  // Funciones para gestión de documentos
  const handleMenuOpen = (event, documento) => {
    setMenuAnchor(event.currentTarget);
    setSelectedDoc(documento);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedDoc(null);
  };

  const handleUploadDocument = () => {
    setUploadForm({
      archivo: null,
      tipo_documento: 'otros',
      descripcion: '',
    });
    setShowUploadDialog(true);
  };

  const handleEditDocument = () => {
    setEditingDoc(selectedDoc);
    setEditForm({
      descripcion: selectedDoc.descripcion || '',
    });
    setShowEditDialog(true);
    handleMenuClose();
  };

  const handleReuploadDocument = () => {
    setEditingDoc(selectedDoc);
    setReuploadForm({
      archivo: null,
      descripcion: selectedDoc.descripcion || '',
    });
    setShowReuploadDialog(true);
    handleMenuClose();
  };

  const handleDeleteDocument = async () => {
    if (!selectedDoc || !userData?.personal_id) return;

    if (window.confirm('¿Está seguro de que desea eliminar este documento?')) {
      try {
        await ApiService.delete(`/api/documentos-personal/${selectedDoc.id}`);
        showSuccess('Documento eliminado exitosamente');
        loadDocumentos();
      } catch (error) {
        showError('Error al eliminar documento');
      }
    }
    handleMenuClose();
  };

  const handleDownloadDocument = async (documento) => {
    if (!userData?.personal_id) return;

    try {
      const response = await ApiService.get(`/api/documentos-personal/${documento.id}/descargar`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', documento.nombre_original || documento.nombre_archivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showError('Error al descargar documento');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.archivo || !userData?.personal_id) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('archivo', uploadForm.archivo);
      formData.append('tipo_documento', uploadForm.tipo_documento);
      formData.append('descripcion', uploadForm.descripcion);

      await ApiService.post(`/api/personal/${userData.personal_id}/documentos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showSuccess('Documento subido exitosamente');
      setShowUploadDialog(false);
      setUploadForm({ archivo: null, tipo_documento: 'otros', descripcion: '' });
      loadDocumentos();
    } catch (error) {
      showError('Error al subir documento');
    } finally {
      setUploading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingDoc || !userData?.personal_id) return;

    try {
      await ApiService.put(`/api/documentos-personal/${editingDoc.id}`, editForm);
      showSuccess('Documento actualizado exitosamente');
      setShowEditDialog(false);
      setEditingDoc(null);
      loadDocumentos();
    } catch (error) {
      showError('Error al actualizar documento');
    }
  };

  const handleReuploadSubmit = async (e) => {
    e.preventDefault();
    if (!editingDoc || !reuploadForm.archivo || !userData?.personal_id) return;

    try {
      const formData = new FormData();
      formData.append('archivo', reuploadForm.archivo);
      formData.append('descripcion', reuploadForm.descripcion);

      await ApiService.put(`/api/documentos-personal/${editingDoc.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showSuccess('Documento resubido exitosamente');
      setShowReuploadDialog(false);
      setEditingDoc(null);
      setReuploadForm({ archivo: null, descripcion: '' });
      loadDocumentos();
    } catch (error) {
      showError('Error al resubir documento');
    }
  };




  // Manejar edición de información personal
  const handleEditInfo = () => {
    setEditedUserData({
      nombre_completo: userData.nombre_completo || '',
      correo: userData.correo || '',
      telefono: userData.telefono || '',
      direccion: userData.direccion || ''
    });
    setEditInfoDialogOpen(true);
  };

  const handleSaveInfo = async () => {
    setSavingInfo(true);
    try {
      // Actualizar información del usuario en el backend
      const response = await ApiService.put(`/api/usuarios/${userData.id}`, editedUserData);
      if (response.success || response.data) {
        // Actualizar datos locales
        setUserData(prev => ({
          ...prev,
          ...editedUserData
        }));

        // Actualizar localStorage también
        const currentUserData = localStorage.getItem('user_data');
        if (currentUserData) {
          const parsed = JSON.parse(currentUserData);
          localStorage.setItem('user_data', JSON.stringify({
            ...parsed,
            ...editedUserData
          }));
        }

        showSuccess('Información personal actualizada correctamente');
        setEditInfoDialogOpen(false);
      } else {
        showError('Error al actualizar la información');
      }
    } catch (error) {
      console.error('Error updating user info:', error);
      showError('Error al actualizar la información personal');
    } finally {
      setSavingInfo(false);
    }
  };

  // Manejar cambio de contraseña
  const handleChangePassword = () => {
    console.log('handleChangePassword clicked');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setChangePasswordDialogOpen(true);
    console.log('Dialog should open, state set to true');
  };

  // Manejar cerrar sesión
  const handleLogout = () => {
    // Limpiar datos de localStorage
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('login_data');
    localStorage.removeItem('full_login_data');

    // Recargar la página para limpiar estado
    window.location.href = '/auth/login';
  };

  const handleSavePassword = async () => {
    // Validaciones
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showError('Todos los campos son obligatorios');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setChangingPassword(true);
    try {
      const response = await ApiService.put(`/api/usuarios/${userData.id}/cambiar-contrasenia`, {
        contrasenia_actual: passwordData.currentPassword,
        nueva_contrasenia: passwordData.newPassword,
        confirmar_contrasenia: passwordData.confirmPassword
      });

      console.log('Password change response:', response);

      // Extraer datos de la respuesta usando extractData
      const data = extractData(response);

      // Si llegamos aquí sin error, la contraseña se cambió exitosamente
      showSuccess('Contraseña cambiada correctamente');
      setChangePasswordDialogOpen(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error al cambiar la contraseña. Verifica tu contraseña actual.';
      showError(errorMessage);
    } finally {
      setChangingPassword(false);
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
      
      if (resultado.success) {        await loadPhotoData();
      } else {
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
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        p: 3
      }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          Cargando perfil...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Obteniendo información de usuario y configuraciones
        </Typography>
        <LinearProgress sx={{ width: '100%', maxWidth: 400, mt: 2 }} />
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        p: 3
      }}>
        <Alert
          severity="error"
          sx={{ mb: 3, width: '100%', maxWidth: 600 }}
          action={
            <Button color="error" size="small" onClick={loadUserData}>
              Reintentar
            </Button>
          }
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            Error al cargar el perfil
          </Typography>
          <Typography variant="body2">
            No se pudo cargar la información del perfil. Verifica tu conexión e intenta nuevamente.
          </Typography>
        </Alert>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          Si el problema persiste, contacta al administrador del sistema.
        </Typography>
      </Box>
    );
  }

  // Handlers para configuración
  const handleNotificationChange = (setting) => (event) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: event.target.checked
    }));
    showSuccess(`Configuración de ${setting} actualizada`);
  };

  // Handler para cambio de pestañas
  const handleTabChange = (e, newValue) => {
    setActiveTab(newValue);
    // Si es la pestaña de documentos (índice 2), cargar documentos
    if (newValue === 2) {
      loadDocumentos();
    }
  };

  // Componentes para cada pestaña
  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
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
          backgroundColor: 'background.paper',
          border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
          overflow: 'hidden'
        }}
      >
        {/* Header con gradiente */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            p: { xs: 2, sm: 4 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 }
          }}
        >
          <Box display="flex" alignItems="center">
            {/* Avatar con foto de perfil */}
            <Box sx={{ position: 'relative' }}>
              <FotoPerfilConAutorizacion
                rutaFoto={photoData?.foto_perfil}
                nombreCompleto={userData?.nombre_completo || 'Usuario'}
                size={{ xs: 80, sm: 120 }}
                showTooltip={false}
                sx={{
                  fontSize: { xs: '2rem', sm: '3rem' },
                  mr: { xs: 0, sm: 3 },
                  mb: { xs: 2, sm: 0 },
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

          {/* Estado online y acciones rápidas */}
          <Box sx={{ textAlign: 'right' }}>
            <Chip
              label="Online"
              color="success"
              variant="filled"
              sx={{ mb: 2, color: 'white', backgroundColor: 'success.main' }}
            />
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Último acceso: Hoy
            </Typography>
          </Box>
        </Box>

        {/* Sistema de pestañas */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="Pestañas de perfil"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minWidth: 120,
                textTransform: 'none',
                fontWeight: 500
              }
            }}
          >
            <Tab icon={<Person />} label="Información" />
            <Tab icon={<Settings />} label="Configuración" />
            <Tab icon={<Description />} label="Mis Documentos" />
          </Tabs>
        </Box>

        {/* Contenido de las pestañas */}
        <TabPanel value={activeTab} index={0}>
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
                    secondary={userData.cedula || userData.numero_identificacion || 'No registrada'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon><Person color="primary" /></ListItemIcon>
                  <ListItemText
                    primary="Nombre de Usuario"
                    secondary={userData.usuario || userData.nombre_usuario || 'No registrado'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon><Email color="primary" /></ListItemIcon>
                  <ListItemText
                    primary="Correo Electrónico"
                    secondary={userData.correo || userData.email || 'No registrado'}
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
                  <ListItemIcon><LocationOn color="primary" /></ListItemIcon>
                  <ListItemText
                    primary="Dirección"
                    secondary={userData.direccion || 'No registrada'}
                  />
                </ListItem>

                {userData.fecha_nacimiento && (
                  <ListItem>
                    <ListItemIcon><CalendarToday color="primary" /></ListItemIcon>
                    <ListItemText
                      primary="Fecha de Nacimiento"
                      secondary={new Date(userData.fecha_nacimiento).toLocaleDateString()}
                    />
                  </ListItem>
                )}

                {userData.genero && (
                  <ListItem>
                    <ListItemIcon><Person color="primary" /></ListItemIcon>
                    <ListItemText
                      primary="Género"
                      secondary={userData.genero}
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
        </TabPanel>


        {/* Pestaña de Configuración Rápida */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            {/* Configuración de Notificaciones */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
                <Notifications sx={{ mr: 1 }} />
                Notificaciones
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Card elevation={2} sx={{ p: 3 }}>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Notificaciones Push"
                      secondary="Notificaciones en tiempo real en el navegador"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.push}
                          onChange={handleNotificationChange('push')}
                          color="primary"
                        />
                      }
                      label=""
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="Recordatorios"
                      secondary="Recordatorios de sesiones y citas"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.reminders}
                          onChange={handleNotificationChange('reminders')}
                          color="primary"
                        />
                      }
                      label=""
                    />
                  </ListItem>
                </List>
              </Card>
            </Grid>

            {/* Acciones Rápidas */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
                <Settings sx={{ mr: 1 }} />
                Acciones Rápidas
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Card elevation={2} sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Edit />}
                    onClick={handleEditInfo}
                  >
                    Editar Información Personal
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<PhotoCamera />}
                    onClick={() => setPhotoDialogOpen(true)}
                  >
                    Cambiar Foto de Perfil
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Visibility />}
                    onClick={() => {
                      console.log('Button clicked directly');
                      handleChangePassword();
                    }}
                  >
                    Cambiar Contraseña
                  </Button>

                  <Divider />

                  <Button
                    variant="contained"
                    fullWidth
                    color="error"
                    startIcon={<ExitToApp />}
                    onClick={handleLogout}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 'bold',
                      py: 1.5
                    }}
                  >
                    Cerrar Sesión
                  </Button>

                  <Divider />

                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Para configuraciones avanzadas del sistema,{' '}
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => showSuccess('Redirección a configuración en desarrollo')}
                    >
                      visita Configuración
                    </Button>
                  </Typography>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Pestaña de Mis Documentos */}
        <TabPanel value={activeTab} index={2}>
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" color="primary" display="flex" alignItems="center">
                <Description sx={{ mr: 1 }} />
                Mis Documentos Personales
              </Typography>

              {canManageDocuments() && userData?.personal_id && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleUploadDocument}
                  sx={{ borderRadius: 3 }}
                >
                  Subir Documento
                </Button>
              )}
            </Box>
            <Divider sx={{ mb: 3 }} />

            {loadingDocumentos ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Cargando documentos...</Typography>
              </Box>
            ) : documentos.length === 0 ? (
              <Paper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: 'background.default',
                  border: '2px dashed',
                  borderColor: 'divider'
                }}
              >
                <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Sin documentos personales
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {canManageDocuments()
                    ? 'Aún no has subido documentos personales al sistema.'
                    : 'Aún no tienes documentos personales cargados en el sistema.'
                  }
                </Typography>
                {canManageDocuments() && userData?.personal_id ? (
                  <Button
                    variant="contained"
                    startIcon={<Upload />}
                    onClick={handleUploadDocument}
                    sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 'bold' }}
                  >
                    Subir Primer Documento
                  </Button>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Los documentos personales son gestionados por el administrador del sistema.
                  </Typography>
                )}
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {documentos.map((documento) => (
                  <Grid item xs={12} sm={6} md={4} key={documento.id}>
                    <Card
                      variant="outlined"
                      sx={{
                        height: '100%',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: 4,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Chip
                            label={documento.tipo_documento?.replace('_', ' ').toUpperCase() || 'DOCUMENTO'}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          {documento.estado_validacion && (
                            <Chip
                              label={documento.estado_validacion.replace('_', ' ')}
                              size="small"
                              color={
                                documento.estado_validacion === 'aprobado' ? 'success' :
                                documento.estado_validacion === 'rechazado' ? 'error' :
                                documento.estado_validacion === 'vencido' ? 'error' :
                                documento.estado_validacion === 'en_revision' ? 'info' :
                                'warning'
                              }
                              variant="filled"
                            />
                          )}
                        </Box>

                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          {documento.nombre_original || documento.nombre_archivo}
                        </Typography>

                        {documento.descripcion && (
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {documento.descripcion}
                          </Typography>
                        )}

                        <Box mb={2}>
                          <Typography variant="caption" display="block">
                            <strong>Tamaño:</strong> {documento.tamaño_archivo ? `${(documento.tamaño_archivo / 1024).toFixed(1)} KB` : 'N/A'}
                          </Typography>
                          <Typography variant="caption" display="block">
                            <strong>Subido:</strong> {documento.fecha_subida ? new Date(documento.fecha_subida).toLocaleDateString() : 'N/A'}
                          </Typography>
                          {documento.fecha_vencimiento && (
                            <Typography variant="caption" display="block">
                              <strong>Vence:</strong> {new Date(documento.fecha_vencimiento).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Tooltip title="Descargar">
                            <IconButton
                              color="primary"
                              onClick={() => handleDownloadDocument(documento)}
                              size="small"
                            >
                              <CloudDownload />
                            </IconButton>
                          </Tooltip>

                          {canManageDocuments() && userData?.personal_id && (
                            <Tooltip title="Opciones">
                              <IconButton
                                onClick={(e) => handleMenuOpen(e, documento)}
                                size="small"
                              >
                                <EditNote />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {canManageDocuments() ? (
              <Box sx={{ mt: 3, p: 2, backgroundColor: 'success.50', borderRadius: 2, border: '1px solid', borderColor: 'success.200' }}>
                <Typography variant="body2" color="success.dark" textAlign="center">
                  ✅ <strong>Gestión Habilitada:</strong> Como {getUserRole().roleName}, puedes gestionar tus propios documentos:
                  subir, editar, resubir y eliminar archivos según tus necesidades.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ mt: 3, p: 2, backgroundColor: 'background.default', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  💡 <strong>Información:</strong> Los documentos personales son administrados por el personal autorizado.
                  Si necesitas actualizar o agregar documentos, contacta con tu supervisor o administrador del sistema.
                </Typography>
              </Box>
            )}
          </Box>
        </TabPanel>
      </Card>

      {/* Dialog para editar información personal */}
      <Dialog
        open={editInfoDialogOpen}
        onClose={() => setEditInfoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Edit sx={{ mr: 1 }} />
            Editar Información Personal
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Nombre Completo"
              fullWidth
              value={editedUserData.nombre_completo || ''}
              onChange={(e) => setEditedUserData(prev => ({
                ...prev,
                nombre_completo: e.target.value
              }))}
              disabled={savingInfo}
            />

            <TextField
              label="Correo Electrónico"
              type="email"
              fullWidth
              value={editedUserData.correo || ''}
              onChange={(e) => setEditedUserData(prev => ({
                ...prev,
                correo: e.target.value
              }))}
              disabled={savingInfo}
            />

            <TextField
              label="Teléfono"
              fullWidth
              value={editedUserData.telefono || ''}
              onChange={(e) => setEditedUserData(prev => ({
                ...prev,
                telefono: e.target.value
              }))}
              disabled={savingInfo}
            />

            <TextField
              label="Dirección"
              fullWidth
              multiline
              rows={2}
              value={editedUserData.direccion || ''}
              onChange={(e) => setEditedUserData(prev => ({
                ...prev,
                direccion: e.target.value
              }))}
              disabled={savingInfo}
            />

            {savingInfo && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Guardando cambios...</Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setEditInfoDialogOpen(false)}
            disabled={savingInfo}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveInfo}
            variant="contained"
            disabled={savingInfo}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para cambiar contraseña */}
      {console.log('Rendering password dialog, open state:', changePasswordDialogOpen)}
      <Dialog
        open={changePasswordDialogOpen}
        onClose={() => {
          console.log('Closing password dialog');
          setChangePasswordDialogOpen(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Visibility sx={{ mr: 1 }} />
            Cambiar Contraseña
          </Box>
        </DialogTitle>

        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Por seguridad, debes ingresar tu contraseña actual para poder cambiarla.
          </Alert>

          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Contraseña Actual"
              type="password"
              fullWidth
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({
                ...prev,
                currentPassword: e.target.value
              }))}
              disabled={changingPassword}
              required
              helperText="Ingresa tu contraseña actual para verificar tu identidad"
            />

            <TextField
              label="Nueva Contraseña"
              type="password"
              fullWidth
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({
                ...prev,
                newPassword: e.target.value
              }))}
              disabled={changingPassword}
              required
              helperText="Mínimo 6 caracteres"
            />

            <TextField
              label="Confirmar Nueva Contraseña"
              type="password"
              fullWidth
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({
                ...prev,
                confirmPassword: e.target.value
              }))}
              disabled={changingPassword}
              required
              error={passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword}
              helperText={
                passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword
                  ? "Las contraseñas no coinciden"
                  : ""
              }
            />

            {changingPassword && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Cambiando contraseña...</Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setChangePasswordDialogOpen(false)}
            disabled={changingPassword}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSavePassword}
            variant="contained"
            disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
          >
            Cambiar Contraseña
          </Button>
        </DialogActions>
      </Dialog>


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
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
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

      {/* Diálogo para subir documento */}
      <Dialog open={showUploadDialog} onClose={() => setShowUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Subir Nuevo Documento</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Tipo de Documento</InputLabel>
                <Select
                  value={uploadForm.tipo_documento}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, tipo_documento: e.target.value }))}
                  label="Tipo de Documento"
                >
                  {tiposDocumento.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción (opcional)"
                value={uploadForm.descripcion}
                onChange={(e) => setUploadForm(prev => ({ ...prev, descripcion: e.target.value }))}
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <input
                id="document-upload"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                onChange={(e) => setUploadForm(prev => ({ ...prev, archivo: e.target.files[0] }))}
                style={{ display: 'none' }}
              />
              <label htmlFor="document-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  fullWidth
                >
                  {uploadForm.archivo ? `Archivo: ${uploadForm.archivo.name}` : 'Seleccionar Archivo'}
                </Button>
              </label>
              {uploadForm.archivo && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {(uploadForm.archivo.size / (1024 * 1024)).toFixed(2)} MB
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadDialog(false)}>Cancelar</Button>
          <Button
            onClick={() => {
              // Handle upload logic here - will be implemented
              console.log('Upload document:', uploadForm);
              setShowUploadDialog(false);
            }}
            variant="contained"
            disabled={!uploadForm.archivo || !uploadForm.tipo_documento || uploading}
          >
            {uploading ? 'Subiendo...' : 'Subir Documento'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para editar documento */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Documento</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Tipo de Documento</InputLabel>
                <Select
                  value={selectedDoc?.tipo_documento || ''}
                  onChange={(e) => setSelectedDoc(prev => ({ ...prev, tipo_documento: e.target.value }))}
                  label="Tipo de Documento"
                >
                  {tiposDocumento.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción (opcional)"
                value={editForm.descripcion}
                onChange={(e) => setEditForm(prev => ({ ...prev, descripcion: e.target.value }))}
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancelar</Button>
          <Button
            onClick={() => {
              // Handle edit logic here - will be implemented
              console.log('Edit document:', selectedDoc, editForm);
              setShowEditDialog(false);
            }}
            variant="contained"
            disabled={uploading}
          >
            {uploading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para resubir documento */}
      <Dialog open={showReuploadDialog} onClose={() => setShowReuploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reemplazar Documento</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Selecciona un nuevo archivo para reemplazar: <strong>{selectedDoc?.nombre_archivo}</strong>
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <input
                id="document-reupload"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                onChange={(e) => setReuploadForm(prev => ({ ...prev, archivo: e.target.files[0] }))}
                style={{ display: 'none' }}
              />
              <label htmlFor="document-reupload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  fullWidth
                >
                  {reuploadForm.archivo ? `Nuevo archivo: ${reuploadForm.archivo.name}` : 'Seleccionar Nuevo Archivo'}
                </Button>
              </label>
              {reuploadForm.archivo && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {(reuploadForm.archivo.size / (1024 * 1024)).toFixed(2)} MB
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReuploadDialog(false)}>Cancelar</Button>
          <Button
            onClick={() => {
              // Handle reupload logic here - will be implemented
              console.log('Reupload document:', selectedDoc, reuploadForm);
              setShowReuploadDialog(false);
            }}
            variant="contained"
            disabled={!reuploadForm.archivo || uploading}
          >
            {uploading ? 'Subiendo...' : 'Reemplazar Archivo'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menú contextual para documentos */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => {
          // Handle download document
          if (selectedDoc?.ruta_archivo) {
            const link = document.createElement('a');
            link.href = `${API_CONFIG.BASE_URL}/${selectedDoc.ruta_archivo}`;
            link.download = selectedDoc.nombre_archivo || 'documento';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
          setMenuAnchor(null);
        }}>
          <ListItemIcon><CloudDownload fontSize="small" /></ListItemIcon>
          <ListItemText primary="Descargar" />
        </MenuItem>
        {canManageDocuments() && (
          [
            <MenuItem key="edit" onClick={() => {
              setEditForm({ descripcion: selectedDoc?.descripcion || '' });
              setShowEditDialog(true);
              setMenuAnchor(null);
            }}>
              <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
              <ListItemText primary="Editar" />
            </MenuItem>,
            <MenuItem key="reupload" onClick={() => {
              setReuploadForm({ archivo: null, descripcion: selectedDoc?.descripcion || '' });
              setShowReuploadDialog(true);
              setMenuAnchor(null);
            }}>
              <ListItemIcon><CloudUpload fontSize="small" /></ListItemIcon>
              <ListItemText primary="Resubir" />
            </MenuItem>,
            <MenuItem key="delete" onClick={() => {
              if (window.confirm('¿Estás seguro de que deseas eliminar este documento?')) {
                // Handle delete logic here - will be implemented
                console.log('Delete document:', selectedDoc);
              }
              setMenuAnchor(null);
            }}>
              <ListItemIcon><Delete fontSize="small" /></ListItemIcon>
              <ListItemText primary="Eliminar" />
            </MenuItem>
          ]
        )}
      </Menu>
    </Box>
  );
};

export default MiPerfil;