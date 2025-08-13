// src/components/shared/LoadingSpinner.jsx
// Componente reutilizable para mostrar estado de carga

import React from 'react';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';

const LoadingSpinner = ({ 
  message = 'Cargando...', 
  size = 40,
  fullHeight = false,
  showMessage = true 
}) => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    p: 4,
    ...(fullHeight && { minHeight: '50vh' })
  };

  return (
    <Box sx={containerStyle}>
      <Paper elevation={2} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
        <CircularProgress size={size} color="primary" />
        {showMessage && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mt: 2 }}
          >
            {message}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default LoadingSpinner;