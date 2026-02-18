// src/components/shared/CentroSwitcher.jsx
import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Business,
  SwapHoriz,
  CheckCircle,
  KeyboardArrowDown,
} from '@mui/icons-material';
import useAuth from '../../hooks/useAuth';

const CentroSwitcher = () => {
  const theme = useTheme();
  const { user, cambiarCentro } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const centros = user?.centros || [];
  const centroActualId = user?.id_centro || user?.centro_id || user?.centro?.id;
  const centroActualNombre = user?.centro?.nombre || 'Centro';

  // Si solo tiene un centro, no mostrar el switcher
  if (centros.length <= 1) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2 }}>
        <Business sx={{ color: 'text.secondary', fontSize: 20 }} />
        <Typography variant="body2" color="text.secondary">
          {centroActualNombre}
        </Typography>
      </Box>
    );
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setError('');
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCambiarCentro = async (idCentro) => {
    // Si ya está en ese centro, no hacer nada
    if (idCentro === centroActualId) {
      handleClose();
      return;
    }

    setLoading(true);
    setError('');

    const result = await cambiarCentro(idCentro);

    if (!result.success) {
      setError(result.message || 'Error al cambiar de centro');
      setLoading(false);
    }
    // Si es exitoso, la página se recargará automáticamente
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="Cambiar de centro">
        <Box
          onClick={handleClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            cursor: 'pointer',
            borderRadius: 2,
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <Business sx={{ color: 'primary.main', fontSize: 22 }} />
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Typography variant="body2" fontWeight={600} color="text.primary">
              {centroActualNombre}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Cambiar centro
            </Typography>
          </Box>
          <KeyboardArrowDown
            sx={{
              color: 'text.secondary',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s',
            }}
          />
        </Box>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 8,
          sx: {
            minWidth: 280,
            mt: 1.5,
            borderRadius: 2,
            '& .MuiMenuItem-root': {
              py: 1.5,
              px: 2,
              borderRadius: 1,
              mx: 1,
              my: 0.5,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            CAMBIAR CENTRO DE TRABAJO
          </Typography>
        </Box>
        <Divider />

        {error && (
          <Box sx={{ px: 2, py: 1 }}>
            <Alert severity="error" sx={{ py: 0 }}>
              {error}
            </Alert>
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          centros.map((centro) => {
            const isActual = centro.id === centroActualId;
            return (
              <MenuItem
                key={centro.id}
                onClick={() => handleCambiarCentro(centro.id)}
                disabled={loading}
                selected={isActual}
                sx={{
                  bgcolor: isActual ? 'action.selected' : 'transparent',
                }}
              >
                <ListItemIcon>
                  {isActual ? (
                    <CheckCircle color="primary" />
                  ) : (
                    <SwapHoriz color="action" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={centro.nombre}
                  secondary={centro.codigo}
                  primaryTypographyProps={{
                    fontWeight: isActual ? 600 : 400,
                    color: isActual ? 'primary.main' : 'text.primary',
                  }}
                />
                {isActual && (
                  <Chip
                    label="Actual"
                    size="small"
                    color="primary"
                    sx={{ ml: 1, height: 24 }}
                  />
                )}
              </MenuItem>
            );
          })
        )}

        <Divider sx={{ my: 1 }} />
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Al cambiar de centro, la página se recargará automáticamente
          </Typography>
        </Box>
      </Menu>
    </>
  );
};

export default CentroSwitcher;
