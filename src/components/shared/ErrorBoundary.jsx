// src/components/shared/ErrorBoundary.jsx
// Componente para capturar errores de React

import React from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            p: 4
          }}
        >
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 600 }}>
            <ErrorOutline 
              sx={{ 
                fontSize: 64, 
                color: 'error.main', 
                mb: 2 
              }} 
            />
            
            <Typography variant="h5" gutterBottom color="error">
              ¡Ups! Algo salió mal
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Ha ocurrido un error inesperado en la aplicación.
            </Typography>

            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2">
                <strong>Error:</strong> {this.state.error?.message || 'Error desconocido'}
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleReload}
                color="primary"
              >
                Recargar Página
              </Button>
              
              {import.meta.env.DEV && (
                <Button
                  variant="outlined"
                  onClick={() => this.setState({ hasError: false })}
                  color="secondary"
                >
                  Intentar Nuevamente
                </Button>
              )}
            </Box>

            {import.meta.env.DEV && this.state.errorInfo && (
              <Box sx={{ mt: 3, textAlign: 'left' }}>
                <Typography variant="caption" color="text.secondary">
                  Stack trace (solo en desarrollo):
                </Typography>
                <Paper 
                  sx={{ 
                    p: 2, 
                    mt: 1, 
                    backgroundColor: 'action.hover',
                    maxHeight: 200,
                    overflow: 'auto'
                  }}
                >
                  <Typography 
                    variant="caption" 
                    component="pre" 
                    sx={{ fontSize: '0.7rem' }}
                  >
                    {this.state.errorInfo.componentStack}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;