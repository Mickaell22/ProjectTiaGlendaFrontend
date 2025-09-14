import React, { useEffect, useState } from 'react';
import {
  IconButton,
  Box,
  AppBar,
  useMediaQuery,
  Toolbar,
  styled,
  Stack,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Popover
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  setSidebarCollapse,
  toggleMobileSidebar
} from 'src/store/customizer/CustomizerSlice';

import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatIcon from '@mui/icons-material/Chat';

// Servicios
import ApiService, { extractData } from 'src/services/apiService.js';
import FotoPerfilService from 'src/services/fotoPerfilService.js';
import FotoPerfilConAutorizacion from 'src/components/shared/FotoPerfilConAutorizacion.jsx';

// Importar componentes de notificaciones
import SimpleNotificationPopover from 'src/components/notifications/SimpleNotificationPopover';

const Header = ({ onChatToggle = () => {} }) => {
  const customizer = useSelector((state) => state.customizer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [userData, setUserData] = useState(null);
  const [rutaFoto, setRutaFoto] = useState(null);

  const [horaActual, setHoraActual] = useState('');
  
  // Estados para notificaciones
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const notificationOpen = Boolean(notificationAnchor);

  useEffect(() => {
    const actualizarHora = () => {
      const hora = new Date().toLocaleTimeString('es-EC', {
        hour: '2-digit',
        minute: '2-digit'
      });
      setHoraActual(hora);
    };

    actualizarHora();
    const interval = setInterval(actualizarHora, 60000); // cada minuto

    // Cargar datos completos del usuario desde el backend
    const loadUserData = async () => {
      try {
        console.log('🔍 Header: Cargando datos del usuario desde /api/me...');
        // Primero intentar cargar desde el backend
        const response = await ApiService.get('/api/me');
        const backendUserData = extractData(response);
        
        console.log('📊 Header: Datos recibidos del backend:', backendUserData);
        
        if (backendUserData) {
          const userData = {
            id: backendUserData.id,
            name: backendUserData.nombre_completo || backendUserData.nombre || 'Usuario',
            rol: backendUserData.rol_nombre || backendUserData.rol || 'Usuario',
            email: backendUserData.email || backendUserData.correo,
            usuario: backendUserData.usuario,
            ruta_foto: backendUserData.ruta_foto
          };
          
          console.log('👤 Header: UserData procesado:', userData);
          setUserData(userData);
          
          // Cargar foto de perfil si existe
          if (backendUserData.ruta_foto) {
            console.log('🖼️ Header: ruta_foto encontrada:', backendUserData.ruta_foto);
            setRutaFoto(backendUserData.ruta_foto);
          } else {
            console.log('❌ Header: No hay ruta_foto en datos del backend, intentando servicio directo...');
            // Intentar cargar desde el servicio de fotos
            await loadFotoPerfil();
          }
        } else {
          console.log('⚠️ Header: No hay datos del backend, usando fallback local');
          // Fallback a datos locales si el backend no responde
          await loadLocalUserData();
        }
      } catch (error) {
        console.error('💥 Header: Error loading user data from backend:', error);
        // Fallback a datos locales en caso de error
        await loadLocalUserData();
      }
    };

    // Cargar datos del localStorage como fallback
    const loadLocalUserData = async () => {
      try {
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setUserData({
            id: parsedData.id,
            name: parsedData.nombre_completo || parsedData.name || parsedData.nombre || 'Usuario',
            rol: parsedData.rol_nombre || parsedData.rol || 'Usuario',
            email: parsedData.email || parsedData.correo,
            usuario: parsedData.usuario,
            ruta_foto: parsedData.ruta_foto
          });
          
          // Cargar foto de perfil
          await loadFotoPerfil();
        } else {
          // Última opción: JWT token
          const token = localStorage.getItem('jwt_token');
          if (token && token.split('.').length === 3) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              setUserData({
                name: payload.name || payload.nombre || payload.nombre_completo || 'Usuario',
                rol: payload.rol || payload.rol_nombre || 'Usuario',
                email: payload.email || payload.correo,
                usuario: payload.usuario
              });
              await loadFotoPerfil();
            } catch (jwtError) {
              console.error('Error parsing JWT:', jwtError);
            }
          }
        }
      } catch (error) {
        console.error('Error loading local user data:', error);
      }
    };

    // Cargar foto de perfil desde el servicio
    const loadFotoPerfil = async () => {
      try {
        console.log('📸 Header: Intentando cargar foto desde servicio directo...');
        const result = await FotoPerfilService.obtenerMiFoto();
        console.log('📸 Header: Resultado del servicio de fotos:', result);
        
        if (result.success && result.data?.ruta_foto) {
          console.log('✅ Header: Foto encontrada en servicio:', result.data.ruta_foto);
          setRutaFoto(result.data.ruta_foto);
        } else if (result.success && result.data?.foto_perfil) {
          console.log('✅ Header: Foto encontrada en servicio (foto_perfil):', result.data.foto_perfil);
          setRutaFoto(result.data.foto_perfil);
        } else {
          console.log('❌ Header: No se encontró foto en el servicio directo');
          setRutaFoto(null);
        }
      } catch (error) {
        console.error('💥 Header: Error loading profile photo:', error);
        setRutaFoto(null);
      }
    };

    loadUserData();

    return () => clearInterval(interval);
  }, []);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMiPerfil = () => {
    handleClose();
    navigate('/mi-perfil');
  };

  const handleConfiguracion = () => {
    handleClose();
    navigate('/configuracion/general');
  };

  const handleLogout = () => {
    handleClose();
    // Limpiar datos de localStorage
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('refreshToken');
    // Recargar la página para limpiar estado
    window.location.href = '/auth/login';
  };

  // Handlers para chat
  const handleChatToggle = () => {
    onChatToggle();
  };

  // Handlers para notificaciones
  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  // Obtener initials del usuario
  const getUserInitials = () => {
    if (userData?.name) {
      const names = userData.name.split(' ').filter(n => n.length > 0);
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      } else if (names.length === 1) {
        return names[0].substring(0, 2).toUpperCase();
      }
    }
    return 'U';
  };


  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: 'none',
    background: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    borderBottom: `1px solid ${theme.palette.divider}`,
    minHeight: '70px'
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    color: theme.palette.text.secondary,
    padding: '0 24px'
  }));

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        {/* ------------------------------------------- */}
        {/* Buscar con Label */}
        {/* ------------------------------------------- */}
        <Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    flexGrow: 1,
    maxWidth: 500,
    mr: 3
  }}
>
  <Typography variant="body1" color="text.primary" sx={{ whiteSpace: 'nowrap' }}>
    Buscar:
  </Typography>
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'grey.100',
      borderRadius: 1,
      px: 2,
      py: 1,
      flexGrow: 1,
      '&:hover': {
        backgroundColor: 'grey.200'
      },
      cursor: 'pointer'
    }}
  >
    <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
    <Typography variant="body2" color="text.secondary">
      Buscar...
    </Typography>
  </Box>
</Box>


        <Box flexGrow={1} />

        <Stack spacing={2} direction="row" alignItems="center">
          {/* Hora y Ciudad */}
          <Stack direction="row" spacing={1} alignItems="center">
  <Typography variant="body2" color="text.secondary">
    Guayaquil:
  </Typography>
  <Typography variant="body1">{horaActual}</Typography>
</Stack>


          {/* Notificaciones */}
          <IconButton
            color="inherit"
            onClick={handleNotificationClick}
            sx={{
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'primary.main'
              }
            }}
          >
            <NotificationsIcon />
          </IconButton>

          {/* Chat */}
          <IconButton
            color="inherit"
            onClick={handleChatToggle}
            sx={{
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'primary.main'
              }
            }}
          >
            <ChatIcon />
          </IconButton>

          {/* Usuario info + Avatar / Menú */}
          <Stack direction="row" spacing={1} alignItems="center">
            {userData && (
              <Stack direction="column" alignItems="flex-end" sx={{ display: { xs: 'none', sm: 'flex' } }}>
                <Typography variant="body2" fontWeight="bold" color="text.primary">
                  {userData.name || 'Usuario'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {userData.rol || 'Usuario'}
                </Typography>
              </Stack>
            )}
            
            <IconButton
              onClick={handleProfileClick}
              sx={{
                '&:hover': {
                  backgroundColor: 'primary.light'
                }
              }}
            >
              <FotoPerfilConAutorizacion
                rutaFoto={rutaFoto}
                nombreCompleto={userData?.name || 'Usuario'}
                size={35}
                showTooltip={false}
                sx={{
                  fontSize: '0.875rem',
                  border: rutaFoto ? '2px solid' : 'none',
                  borderColor: 'primary.main'
                }}
              />
            </IconButton>
          </Stack>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                minWidth: 280,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0
                }
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {/* Header del menú con info del usuario */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <FotoPerfilConAutorizacion
                  rutaFoto={rutaFoto}
                  nombreCompleto={userData?.name || 'Usuario'}
                  size={48}
                  showTooltip={false}
                  sx={{
                    border: rutaFoto ? '2px solid' : 'none',
                    borderColor: 'primary.main',
                    fontSize: '1.2rem'
                  }}
                />
                <Stack>
                  <Typography variant="subtitle1" fontWeight="bold" noWrap>
                    {userData?.name || 'Usuario'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {userData?.rol || 'Usuario'}
                  </Typography>
                  {userData?.email && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {userData.email}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Box>

            <MenuItem onClick={handleMiPerfil}>
              <AccountCircleIcon sx={{ mr: 2 }} />
              Mi Perfil
            </MenuItem>
            <MenuItem onClick={handleConfiguracion}>
              <SettingsIcon sx={{ mr: 2 }} />
              Configuración
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 2 }} />
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Stack>
      </ToolbarStyled>
      
      {/* Popover de Notificaciones */}
      <Popover
        open={notificationOpen}
        anchorEl={notificationAnchor}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          mt: 1,
        }}
      >
        <SimpleNotificationPopover />
      </Popover>
    </AppBarStyled>
  );
};

export default Header;
