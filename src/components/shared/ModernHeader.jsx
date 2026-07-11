// src/components/shared/ModernHeader.jsx
// Header reutilizable con animación arcoíris

import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';

const ModernHeader = ({
  title,
  icon: Icon,
  colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0']
}) => {
  const theme = useTheme();
  const gradientColors = colors.join(', ');
  
  return (
    <Paper 
      elevation={4} 
      sx={{ 
        borderRadius: 3, 
        backgroundColor: 'background.paper', 
        mb: 4, 
        p: 0, 
        overflow: 'hidden', 
        border: '4px solid transparent', 
        backgroundImage: theme.palette.mode === 'dark'
          ? 'none'
          : `linear-gradient(${theme.palette.background.paper}, ${theme.palette.background.paper}), linear-gradient(270deg, ${gradientColors})`,
        backgroundOrigin: 'border-box', 
        backgroundClip: 'padding-box, border-box', 
        animation: 'rainbow 5s linear infinite', 
        '@keyframes rainbow': { 
          '0%': { backgroundPosition: '0% 50%' }, 
          '100%': { backgroundPosition: '100% 50%' } 
        }, 
        backgroundSize: '300% 100%' 
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="black" display="flex" alignItems="center">
          {Icon && <Icon sx={{ mr: 2 }} />}
          {title}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ModernHeader;