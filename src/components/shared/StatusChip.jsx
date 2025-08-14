// src/components/shared/StatusChip.jsx
// Componente para mostrar estados con chips de colores

import React from 'react';
import { Chip } from '@mui/material';

const StatusChip = ({ 
  status, 
  statusInfo, 
  icon,
  size = "small",
  variant = "filled"
}) => {
  if (!statusInfo) {
    return (
      <Chip 
        label={status} 
        color="default"
        size={size}
        variant={variant}
        icon={icon}
      />
    );
  }

  return (
    <Chip 
      label={statusInfo.label} 
      color={statusInfo.color}
      size={size}
      variant={variant}
      icon={icon}
    />
  );
};

export default StatusChip;