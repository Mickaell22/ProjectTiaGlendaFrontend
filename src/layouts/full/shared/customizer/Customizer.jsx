// src/layouts/full/shared/customizer/Customizer.js
import React from 'react';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Divider,
  Fab,
  Stack,
  Button,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  setTheme,
  setDarkMode,
  toggleCustomizer,
  resetCustomizer,
} from 'src/store/customizer/CustomizerSlice';
import { ColorOptions } from 'src/theme';

const Customizer = () => {
  const dispatch = useDispatch();
  const customizer = useSelector((state) => state.customizer);

  const handleThemeChange = (themeName) => {
    dispatch(setTheme(themeName));
  };

  const handleModeChange = (mode) => {
    dispatch(setDarkMode(mode));
  };


  const handleReset = () => {
    dispatch(resetCustomizer());
  };

  return (
    <div>
      {/* Botón flotante para abrir customizer */}
      <Fab
        color="primary"
        aria-label="settings"
        sx={{ 
          position: 'fixed', 
          right: '25px', 
          bottom: '15px',
          '&:hover': {
            transform: 'scale(1.1)',
          },
          transition: 'transform 0.2s ease',
        }}
        onClick={() => dispatch(toggleCustomizer())}
        title="Configuración del Tema"
      >
        <SettingsIcon />
      </Fab>

      {/* Panel del customizer */}
      <Drawer
        anchor="right"
        open={customizer.customizer}
        onClose={() => dispatch(toggleCustomizer())}
        PaperProps={{
          sx: {
            width: 400,
            padding: '30px',
          },
        }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Personalizar Tema</Typography>
          <IconButton onClick={() => dispatch(toggleCustomizer())}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Opciones de tema */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Modo de Tema
          </Typography>
          <Stack direction="row" spacing={2}>
            <Box
              onClick={() => handleModeChange('light')}
              sx={{
                width: 60,
                height: 40,
                borderRadius: 1,
                border: customizer.activeMode === 'light' ? 2 : 1,
                borderColor: customizer.activeMode === 'light' ? 'primary.main' : 'grey.300',
                cursor: 'pointer',
                background: 'linear-gradient(to bottom, #ffffff 50%, #f5f5f5 50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" color="text.primary">
                Claro
              </Typography>
            </Box>
            <Box
              onClick={() => handleModeChange('dark')}
              sx={{
                width: 60,
                height: 40,
                borderRadius: 1,
                border: customizer.activeMode === 'dark' ? 2 : 1,
                borderColor: customizer.activeMode === 'dark' ? 'primary.main' : 'grey.300',
                cursor: 'pointer',
                background: 'linear-gradient(to bottom, #2A3547 50%, #1C2632 50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" color="white">
                Oscuro
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Selección de colores */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Colores del Tema
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Selecciona tu esquema de colores favorito
          </Typography>
          <Stack spacing={2}>
            {ColorOptions.map((option) => {
              const themeName = option.name.replace('_THEME', '').toLowerCase();
              const displayName = themeName.charAt(0).toUpperCase() + themeName.slice(1);
              
              return (
                <Box
                  key={option.name}
                  onClick={() => handleThemeChange(option.name)}
                  sx={{
                    width: '100%',
                    height: 70,
                    borderRadius: 3,
                    border: customizer.activeTheme === option.name ? 3 : 2,
                    borderColor: customizer.activeTheme === option.name ? 'primary.main' : 'grey.300',
                    cursor: 'pointer',
                    background: `linear-gradient(135deg, ${option.palette.primary.main} 0%, ${option.palette.secondary.main} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 20px',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
                      '& .theme-name': {
                        transform: 'scale(1.05)',
                      },
                    },
                    '&:active': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: customizer.activeTheme === option.name 
                      ? '0 8px 16px rgba(0,0,0,0.15)' 
                      : '0 4px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  {/* Contenido izquierdo - Nombre y colores */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, zIndex: 2 }}>
                    {/* Muestra de colores */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: option.palette.primary.main,
                          border: '2px solid white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                      />
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: option.palette.secondary.main,
                          border: '2px solid white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                      />
                    </Box>

                    {/* Nombre del tema */}
                    <Typography
                      className="theme-name"
                      variant="h6"
                      sx={{
                        color: 'white',
                        fontWeight: 600,
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                        transition: 'transform 0.3s ease',
                        userSelect: 'none',
                      }}
                    >
                      {displayName}
                    </Typography>
                  </Box>

                  {/* Indicador de selección */}
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: customizer.activeTheme === option.name ? 'white' : 'rgba(255,255,255,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      transition: 'all 0.3s ease',
                      zIndex: 2,
                    }}
                  >
                    {customizer.activeTheme === option.name ? (
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          backgroundColor: option.palette.primary.main,
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          border: '2px solid white',
                        }}
                      />
                    )}
                  </Box>

                  {/* Overlay para mejor interacción */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: customizer.activeTheme === option.name 
                        ? 'rgba(255,255,255,0.1)' 
                        : 'rgba(0,0,0,0.05)',
                      transition: 'background 0.3s ease',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Efecto de brillo para hover */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                      transition: 'left 0.6s ease',
                      pointerEvents: 'none',
                      '.theme-option:hover &': {
                        left: '100%',
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Stack>
        </Box>

        <Divider sx={{ mb: 3 }} />


        {/* Botón reset */}
        <Box textAlign="center">
          <Typography variant="h6" gutterBottom>
            Resetear Configuración
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Restaurar todas las configuraciones a los valores por defecto
          </Typography>
          <Button
            onClick={handleReset}
            variant="outlined"
            color="error"
            fullWidth
            sx={{
              height: 40,
              borderRadius: 1,
              '&:hover': {
                backgroundColor: 'error.main',
                color: 'white',
              },
            }}
          >
            Resetear Todo
          </Button>
        </Box>
      </Drawer>
    </div>
  );
};

export default Customizer;