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
  Divider
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

const Header = () => {
  const customizer = useSelector((state) => state.customizer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [userData, setUserData] = useState(null);

  const [horaActual, setHoraActual] = useState('');

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

    // Cargar datos del usuario
    const loadUserData = () => {
      try {
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setUserData(parsedData);
        } else {
          // Fallback al JWT si no hay user_data
          const token = localStorage.getItem('jwt_token');
          if (token && token.split('.').length === 3) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              setUserData({
                name: payload.name || payload.nombre || 'Usuario',
                rol: payload.rol || 'Usuario'
              });
            } catch (jwtError) {
              console.error('Error parsing JWT:', jwtError);
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
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

  // Obtener initials del usuario
  const getUserInitials = () => {
    if (userData?.name) {
      const names = userData.name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return names[0][0].toUpperCase();
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
            sx={{
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'primary.main'
              }
            }}
          >
            <NotificationsIcon />
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
              <Avatar
                sx={{
                  width: 35,
                  height: 35,
                  backgroundColor: 'primary.main',
                  fontSize: '0.875rem'
                }}
              >
                {getUserInitials()}
              </Avatar>
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
                minWidth: 200,
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
    </AppBarStyled>
  );
};

export default Header;
