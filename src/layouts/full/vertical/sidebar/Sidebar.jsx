// src/layouts/full/vertical/sidebar/Sidebar.jsx
import { useMediaQuery, Box, Drawer, useTheme, Typography } from '@mui/material';
import SidebarItems from './SidebarItems';
import { useSelector, useDispatch } from 'react-redux';
import { toggleMobileSidebar } from 'src/store/customizer/CustomizerSlice';
import Logo from '../../shared/logo/logo';
import { useAuth } from 'src/contexts/AuthContext';

const Sidebar = () => {
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const customizer = useSelector((state) => state.customizer);
  const dispatch = useDispatch();
  const theme = useTheme();
  const { user } = useAuth();

  const sidebarWidth = '270px';

  if (lgUp) {
    return (
      <Box
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
        }}
      >
        {/* ------------------------------------------- */}
        {/* Sidebar for desktop */}
        {/* ------------------------------------------- */}
        <Drawer
          anchor="left"
          open
          variant="permanent"
          PaperProps={{
            sx: {
              width: sidebarWidth,
              boxSizing: 'border-box',
              border: '0 !important',
              boxShadow: theme.shadows[8],
              backgroundColor: theme.palette.background.paper,
            },
          }}
        >
          {/* ------------------------------------------- */}
          {/* Sidebar Box */}
          {/* ------------------------------------------- */}
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* ------------------------------------------- */}
            {/* Logo */}
            {/* ------------------------------------------- */}
            <Box px={3} py={1}>
              <Logo />
            </Box>
            
            {/* ------------------------------------------- */}
            {/* User Info */}
            {/* ------------------------------------------- */}
            {user && (
              <Box 
                px={3} 
                py={2}
                sx={{
                  textAlign: 'center',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography 
                  variant="body2" 
                  color="textPrimary"
                  sx={{ fontWeight: 500, mb: 0.5 }}
                >
                  {user.nombre_completo || user.nombre}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="textSecondary"
                >
                  {user.centro?.nombre || 'Centro Tía Glenda'}
                </Typography>
              </Box>
            )}

            {/* ------------------------------------------- */}
            {/* Sidebar Items */}
            {/* ------------------------------------------- */}
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <SidebarItems />
            </Box>
          </Box>
        </Drawer>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={customizer.isMobileSidebar}
      onClose={() => dispatch(toggleMobileSidebar())}
      variant="temporary"
      PaperProps={{
        sx: {
          width: sidebarWidth,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          border: '0 !important',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      {/* ------------------------------------------- */}
      {/* Logo */}
      {/* ------------------------------------------- */}
      <Box px={3} py={3}>
        <Logo />
      </Box>
      
      {/* ------------------------------------------- */}
      {/* User Info Mobile */}
      {/* ------------------------------------------- */}
      {user && (
        <Box 
          px={3} 
          py={2}
          sx={{
            textAlign: 'center',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography 
            variant="body2" 
            color="textPrimary"
            sx={{ fontWeight: 500, mb: 0.5 }}
          >
            {user.nombre_completo || user.nombre}
          </Typography>
          <Typography 
            variant="caption" 
            color="textSecondary"
          >
            {user.centro?.nombre || 'Centro Tía Glenda'}
          </Typography>
        </Box>
      )}
      
      {/* ------------------------------------------- */}
      {/* Sidebar For Mobile */}
      {/* ------------------------------------------- */}
      <SidebarItems />
    </Drawer>
  );
};

export default Sidebar;