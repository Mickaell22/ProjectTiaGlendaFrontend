// src/components/shared/SelectorCentro.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Alert,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  Business,
  CheckCircle,
  LocationOn,
} from '@mui/icons-material';

const SelectorCentro = ({ open, centros = [], onSeleccionar, loading = false, error = null }) => {
  const theme = useTheme();
  const [centroSeleccionado, setCentroSeleccionado] = useState(null);

  const handleSeleccionarCentro = async (centro) => {
    setCentroSeleccionado(centro.id);
    await onSeleccionar(centro.id);
  };

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 25px 50px rgba(108, 74, 207, 0.15)',
        }
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: '#6C4ACF',
          color: 'white',
          py: 3,
          textAlign: 'center',
        }}
      >
        <Business sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="h5" fontWeight="bold">
          Selecciona tu Centro de Trabajo
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
          Tienes acceso a múltiples centros. Por favor, selecciona el centro con el que deseas trabajar.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ py: 4, px: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {centros.map((centro) => (
              <Grid item xs={12} sm={6} key={centro.id}>
                <Card
                  elevation={centroSeleccionado === centro.id ? 8 : 2}
                  sx={{
                    position: 'relative',
                    borderRadius: 3,
                    border: centroSeleccionado === centro.id
                      ? `3px solid ${theme.palette.primary.main}`
                      : '2px solid transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(108, 74, 207, 0.2)',
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => handleSeleccionarCentro(centro)}
                    disabled={loading}
                    sx={{ p: 3 }}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 0 }}>
                      {centroSeleccionado === centro.id && (
                        <CheckCircle
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            color: theme.palette.primary.main,
                            fontSize: 32,
                          }}
                        />
                      )}

                      <Business
                        sx={{
                          fontSize: 64,
                          color: centroSeleccionado === centro.id
                            ? theme.palette.primary.main
                            : theme.palette.grey[400],
                          mb: 2,
                        }}
                      />

                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color={centroSeleccionado === centro.id ? 'primary' : 'text.primary'}
                        gutterBottom
                      >
                        {centro.nombre}
                      </Typography>

                      {centro.codigo && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
                        >
                          <LocationOn fontSize="small" />
                          {centro.codigo}
                        </Typography>
                      )}

                      {centroSeleccionado === centro.id && (
                        <Box
                          sx={{
                            mt: 2,
                            py: 1,
                            px: 2,
                            bgcolor: theme.palette.primary.main,
                            color: 'white',
                            borderRadius: 2,
                            display: 'inline-block',
                          }}
                        >
                          <Typography variant="caption" fontWeight="bold">
                            Accediendo...
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {!loading && centros.length === 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            No tienes centros asignados. Por favor, contacta al administrador.
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SelectorCentro;
