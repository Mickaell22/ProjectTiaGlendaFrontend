// src/layouts/full/vertical/header/Header.jsx
import React from 'react';
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
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setSidebarCollapse, 
  toggleMobileSidebar 
} from 'src/store/customizer/CustomizerSlice';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

const Header = () => {
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const customizer = useSelector((state) => state.customizer);
  const dispatch = useDispatch();
  
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: 'none',
    background: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    borderBottom: `1px solid ${theme.palette.divider}`,
    minHeight: '70px',
  }));
  
  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    color: theme.palette.text.secondary,
    padding: '0 24px',
  }));

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        {/* ------------------------------------------- */}
        {/* Toggle Button Sidebar */}
        {/* ------------------------------------------- */}
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={
            lgUp 
              ? () => dispatch(setSidebarCollapse(!customizer.sidebarCollapse))
              : () => dispatch(toggleMobileSidebar())
          }
          sx={{
            mr: 2,
            '&:hover': {
              backgroundColor: 'primary.light',
              color: 'primary.main',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
        
        {/* ------------------------------------------- */}
        {/* Search */}
        {/* ------------------------------------------- */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'grey.100',
            borderRadius: 1,
            px: 2,
            py: 1,
            minWidth: 200,
            mr: 2,
            '&:hover': {
              backgroundColor: 'grey.200',
            },
            cursor: 'pointer',
          }}
        >
          <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Buscar...
          </Typography>
        </Box>

        <Box flexGrow={1} />
        
        <Stack spacing={1} direction="row" alignItems="center">
          {/* ------------------------------------------- */}
          {/* Notifications */}
          {/* ------------------------------------------- */}
          <IconButton
            color="inherit"
            sx={{
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'primary.main',
              },
            }}
          >
            <NotificationsIcon />
          </IconButton>
          
          {/* ------------------------------------------- */}
          {/* Profile Dropdown */}
          {/* ------------------------------------------- */}
          <IconButton
            onClick={handleProfileClick}
            sx={{
              '&:hover': {
                backgroundColor: 'primary.light',
              },
            }}
          >
            <Avatar
              sx={{
                width: 35,
                height: 35,
                backgroundColor: 'primary.main',
                fontSize: '0.875rem',
              }}
            >
              U
            </Avatar>
          </IconButton>

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
                  mr: 1,
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
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleClose}>
              <AccountCircleIcon sx={{ mr: 2 }} />
              Mi Perfil
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <SettingsIcon sx={{ mr: 2 }} />
              Configuración
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleClose}>
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