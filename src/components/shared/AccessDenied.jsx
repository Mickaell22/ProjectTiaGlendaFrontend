// src/components/shared/AccessDenied.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
  useTheme
} from '@mui/material';
import {
  Block as BlockIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';

/**
 * Componente que muestra un mensaje de acceso denegado
 * cuando el usuario no tiene permisos suficientes para acceder a un recurso
 */
const AccessDenied = ({
  title = "Acceso Denegado",
  message = "No tienes permisos suficientes para acceder a esta sección.",
  requiredRole = "Administrador",
  showHomeButton = true,
  showBackButton = true
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={12}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              background: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
            }
          }}
        >
          {/* Icono principal */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                animation: 'pulse 2s infinite'
              }}
            >
              <BlockIcon sx={{ fontSize: 60, color: 'white' }} />
            </Box>
          </Box>

          {/* Código de error */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '4rem', md: '5rem' },
              fontWeight: 900,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              lineHeight: 1
            }}
          >
            403
          </Typography>

          {/* Título */}
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            sx={{ color: 'text.primary' }}
          >
            {title}
          </Typography>

          {/* Mensaje */}
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, maxWidth: '90%', mx: 'auto' }}
          >
            {message}
          </Typography>

          {/* Información del rol requerido */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              mb: 4,
              p: 2,
              bgcolor: 'action.hover',
              borderRadius: 2
            }}
          >
            <ShieldIcon color="primary" />
            <Typography variant="body2" color="text.secondary">
              Esta sección requiere rol de <strong>{requiredRole}</strong>
            </Typography>
          </Box>

          {/* Botones de acción */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            {showBackButton && (
              <Button
                variant="outlined"
                size="large"
                startIcon={<ArrowBackIcon />}
                onClick={handleGoBack}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3
                }}
              >
                Volver atrás
              </Button>
            )}
            {showHomeButton && (
              <Button
                variant="contained"
                size="large"
                startIcon={<HomeIcon />}
                onClick={handleGoHome}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  px: 3,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                  }
                }}
              >
                Ir al Dashboard
              </Button>
            )}
          </Stack>

          {/* Mensaje de ayuda */}
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              Si crees que deberías tener acceso a esta sección, contacta al administrador del sistema.
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Animación CSS */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default AccessDenied;
