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
  Badge,
  useTheme
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  setSidebarCollapse,
  toggleMobileSidebar
} from 'src/store/customizer/CustomizerSlice';

import ChatIcon from '@mui/icons-material/Chat';
import MenuIcon from '@mui/icons-material/Menu';

// Servicios
import ApiService, { extractData } from 'src/services/apiService.js';
import FotoPerfilService from 'src/services/fotoPerfilService.js';
import FotoPerfilConAutorizacion from 'src/components/shared/FotoPerfilConAutorizacion.jsx';
import CentroSwitcher from 'src/components/shared/CentroSwitcher.jsx';

// Chat service para contador de mensajes
import chatService from 'src/services/chatService';


const Header = ({ onChatToggle = () => {} }) => {
  const theme = useTheme();
  const customizer = useSelector((state) => state.customizer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));


  const [userData, setUserData] = useState(null);
  const [rutaFoto, setRutaFoto] = useState(null);

  const [horaActual, setHoraActual] = useState('');
  
  // Estado para mensajes no leídos
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Configurar sistema de conteo de mensajes
  const setupMessageCounter = async () => {
    try {
      // Cargar conteo inicial de mensajes no leídos
      const result = await chatService.getUnreadMessagesCount();
      if (result.success) {
        setUnreadMessagesCount(result.count || 0);
      } else {
        // Si el endpoint no está disponible, inicializar con 0
        setUnreadMessagesCount(0);
      }
    } catch (error) {
      // Si no hay backend o hay errores CORS, inicializar con 0 sin logging excesivo
      setUnreadMessagesCount(0);
    }

    // Configurar polling para actualizar contador cada 30 segundos
    const pollInterval = setInterval(async () => {
      try {
        const result = await chatService.getUnreadMessagesCount();
        if (result.success) {
          setUnreadMessagesCount(result.count || 0);
        }
        // Si falla, no hacer nada - mantener el estado actual
      } catch (error) {
        // En caso de error, mantener el estado actual sin logging
      }
    }, 60000); // Cada 60 segundos (reducido para menos requests)

    return pollInterval;
  };

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
      try {        // Primero intentar cargar desde el backend
        const response = await ApiService.get('/api/me');
        const backendUserData = extractData(response);
        
        
        if (backendUserData) {
          const userData = {
            id: backendUserData.id,
            name: backendUserData.nombre_completo || 'Usuario',
            rol: backendUserData.rol || 'Usuario',
            email: backendUserData.correo,
            usuario: backendUserData.usuario,
            ruta_foto: backendUserData.ruta_foto
          };
          
          setUserData(userData);
          
          // Cargar foto de perfil si existe
          if (backendUserData.ruta_foto) {
            setRutaFoto(backendUserData.ruta_foto);
          } else {            // Intentar cargar desde el servicio de fotos
            await loadFotoPerfil();
          }
        } else {          // Fallback a datos locales si el backend no responde
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
      try {        const result = await FotoPerfilService.obtenerMiFoto();
        
        if (result.success && result.data?.ruta_foto) {
          setRutaFoto(result.data.ruta_foto);
        } else if (result.success && result.data?.foto_perfil) {
          setRutaFoto(result.data.foto_perfil);
        } else {          setRutaFoto(null);
        }
      } catch (error) {
        console.error('💥 Header: Error loading profile photo:', error);
        setRutaFoto(null);
      }
    };

    loadUserData();

    // Configurar contador de mensajes
    const setupMessages = async () => {
      const pollInterval = await setupMessageCounter();
      return pollInterval;
    };

    setupMessages().then(pollInterval => {
      // Guardar referencia del interval para cleanup
      window.messagePollInterval = pollInterval;
    });

    return () => {
      clearInterval(interval);
      if (window.messagePollInterval) {
        clearInterval(window.messagePollInterval);
      }
    };
  }, []);

  const handleProfileClick = (event) => {
    navigate('/mi-perfil');
  };


  // Handlers para chat
  const handleChatToggle = () => {
    onChatToggle();
    // Al abrir el chat, actualizar contador (simulando que se leen los mensajes)
    if (unreadMessagesCount > 0) {
      setTimeout(() => {
        setUnreadMessagesCount(0);
      }, 1000); // Simular delay para que se vea el efecto
    }
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
    padding: '0 16px',
    [theme.breakpoints.up('sm')]: {
      padding: '0 24px'
    }
  }));

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        {/* Botón de menú hamburguesa para móviles */}
        {!lgUp && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => dispatch(toggleMobileSidebar())}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Box flexGrow={1} />

        <Stack spacing={{ xs: 1, sm: 2 }} direction="row" alignItems="center">

          {/* Hora y Ciudad - Se oculta en móviles muy pequeños */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            <Typography variant="body2" color="text.secondary">
              Guayaquil:
            </Typography>
            <Typography variant="body1">{horaActual}</Typography>
          </Stack>

          {/* Selector de Centro */}
          <CentroSwitcher />

          {/* Chat con contador de mensajes */}
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
            <Badge
              badgeContent={unreadMessagesCount}
              color="error"
              max={99}
              sx={{
                '& .MuiBadge-badge': {
                  right: 3,
                  top: 3,
                  fontSize: '0.75rem',
                  minWidth: 18,
                  height: 18,
                }
              }}
            >
              <ChatIcon />
            </Badge>
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

        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

export default Header;
