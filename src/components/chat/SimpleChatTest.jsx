// src/components/chat/SimpleChatTest.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';

const SimpleChatTest = ({ open, onClose }) => {
  const [testMessage, setTestMessage] = useState('');

  const testAPI = async () => {
    try {
      // Test simple de conectividad
      const response = await fetch('http://localhost:5000/api/test');
      const data = await response.json();
      setTestMessage(`✅ API funcionando: ${data.data?.message || 'OK'}`);
    } catch (error) {
      setTestMessage(`❌ Error de API: ${error.message}`);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        🧪 Prueba Simple de Chat
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography paragraph>
            Esta es una prueba básica para verificar que los componentes se están cargando correctamente.
          </Typography>
          
          {testMessage && (
            <Alert severity={testMessage.includes('✅') ? 'success' : 'error'} sx={{ mb: 2 }}>
              {testMessage}
            </Alert>
          )}
          
          <Typography variant="body2" color="text.secondary">
            Si puedes ver este diálogo, significa que:
            <br />• Los componentes de chat se están importando correctamente
            <br />• Material-UI está funcionando
            <br />• El sistema de estados funciona
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={testAPI} variant="outlined">
          Probar API Backend
        </Button>
        <Button onClick={onClose} variant="contained">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimpleChatTest;