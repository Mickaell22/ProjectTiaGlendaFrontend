import React from 'react';
import {
  Box, Typography, Button, Alert, Container, Paper
} from '@mui/material';
import {
  Error as ErrorIcon, Refresh, Home, BugReport
} from '@mui/icons-material';

class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to console for debugging
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo);

    // Could send error to logging service here
    // errorReportingService.log(error, errorInfo);
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, retryCount } = this.state;
      const maxRetries = 3;

      return (
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ mb: 3 }}>
              <ErrorIcon
                sx={{
                  fontSize: 64,
                  color: 'error.main',
                  mb: 2
                }}
              />
              <Typography variant="h4" gutterBottom color="error.main">
                Error en el Dashboard
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Ha ocurrido un error inesperado al cargar el dashboard
              </Typography>
            </Box>

            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2" fontWeight="medium" gutterBottom>
                Detalles del error:
              </Typography>
              <Typography variant="body2" component="pre" sx={{
                fontSize: '0.875rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: 200,
                overflow: 'auto'
              }}>
                {error && error.toString()}
              </Typography>
            </Alert>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Puedes intentar las siguientes soluciones:
              </Typography>
              <Box component="ul" sx={{ textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
                <Typography component="li" variant="body2">
                  Actualizar la página (F5)
                </Typography>
                <Typography component="li" variant="body2">
                  Cerrar y volver a abrir el navegador
                </Typography>
                <Typography component="li" variant="body2">
                  Verificar tu conexión a internet
                </Typography>
                <Typography component="li" variant="body2">
                  Contactar al administrador del sistema
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {retryCount < maxRetries && (
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={this.handleRetry}
                  size="large"
                >
                  Reintentar ({maxRetries - retryCount} intentos restantes)
                </Button>
              )}

              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={this.handleGoHome}
                size="large"
              >
                Ir al Inicio
              </Button>

              <Button
                variant="text"
                startIcon={<BugReport />}
                onClick={() => window.location.reload()}
                size="large"
              >
                Recargar Página
              </Button>
            </Box>

            {process.env.NODE_ENV === 'development' && errorInfo && (
              <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="caption" component="details">
                  <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                    Información técnica (desarrollo)
                  </summary>
                  <Box component="pre" sx={{
                    mt: 1,
                    fontSize: '0.75rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxHeight: 300,
                    overflow: 'auto'
                  }}>
                    {errorInfo.componentStack}
                  </Box>
                </Typography>
              </Box>
            )}
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default DashboardErrorBoundary;