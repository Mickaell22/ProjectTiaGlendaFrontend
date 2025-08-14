// src/components/shared/FormSection.jsx
// Componente para secciones de formulario con título

import React from 'react';
import { Grid, Typography, Divider, Box } from '@mui/material';

const FormSection = ({ 
  title, 
  icon: Icon, 
  children, 
  spacing = 3,
  marginTop = 2 
}) => {
  return (
    <>
      <Grid item xs={12}>
        <Typography 
          variant="h6" 
          color="primary" 
          gutterBottom 
          display="flex" 
          alignItems="center" 
          sx={{ mt: marginTop }}
        >
          {Icon && <Icon sx={{ mr: 1 }} />}
          {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid container spacing={spacing} item xs={12}>
        {children}
      </Grid>
    </>
  );
};

export default FormSection;