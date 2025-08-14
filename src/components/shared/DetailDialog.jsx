// src/components/shared/DetailDialog.jsx
// Dialog reutilizable para mostrar detalles

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Box
} from '@mui/material';
import { Edit } from '@mui/icons-material';

const DetailDialog = ({
  open,
  onClose,
  title,
  icon: Icon,
  data,
  onEdit,
  children,
  maxWidth = "lg",
  fullWidth = true
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          {Icon && <Icon sx={{ mr: 2 }} />}
          {title}
        </Box>
      </DialogTitle>
      <DialogContent>
        {data && (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {children}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cerrar
        </Button>
        {onEdit && data && (
          <Button 
            variant="contained" 
            onClick={() => {
              onEdit(data);
              onClose();
            }}
            startIcon={<Edit />}
          >
            Editar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DetailDialog;