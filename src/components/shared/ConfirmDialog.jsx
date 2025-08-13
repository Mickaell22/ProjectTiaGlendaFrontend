// src/components/shared/ConfirmDialog.jsx
// Componente reutilizable para diálogos de confirmación

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { Warning, Help, Info, Error } from '@mui/icons-material';

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = '¿Confirmar acción?',
  message = '¿Estás seguro de que deseas continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  severity = 'warning', // warning, error, info, question
  confirmColor = 'primary',
  maxWidth = 'xs'
}) => {
  const getIcon = () => {
    switch (severity) {
      case 'error':
        return <Error color="error" sx={{ fontSize: 40 }} />;
      case 'warning':
        return <Warning color="warning" sx={{ fontSize: 40 }} />;
      case 'info':
        return <Info color="info" sx={{ fontSize: 40 }} />;
      case 'question':
        return <Help color="primary" sx={{ fontSize: 40 }} />;
      default:
        return <Warning color="warning" sx={{ fontSize: 40 }} />;
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {getIcon()}
          <Typography variant="h6" sx={{ mt: 2 }}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center', pt: 1 }}>
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="secondary"
          size="large"
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={confirmColor}
          size="large"
          autoFocus
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;