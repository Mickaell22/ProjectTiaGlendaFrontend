// src/components/shared/ComingSoon.jsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Stack,
  Chip,
  LinearProgress 
} from '@mui/material';
import { 
  Construction, 
  Schedule, 
  ArrowBack 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageContainer from 'src/components/container/PageContainer';

const ComingSoon = ({ 
  title = "Página en Desarrollo", 
  description = "Esta funcionalidad estará disponible próximamente",
  module = "General",
  progress = 25 
}) => {
  const navigate = useNavigate();

  return (
    <PageContainer title={title} description={description}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          px: 3,
        }}
      >
        <Card 
          sx={{ 
            maxWidth: 600, 
            width: '100%',
            boxShadow: (theme) => theme.shadows[10],
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3} alignItems="center">
              {/* Icono principal */}
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <Construction sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>

              {/* Título y descripción */}
              <Stack spacing={1} alignItems="center">
                <Chip 
                  label={`Módulo: ${module}`} 
                  color="primary" 
                  variant="outlined"
                  size="small"
                />
                <Typography variant="h4" fontWeight={600} color="text.primary">
                  {title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
                  {description}
                </Typography>
              </Stack>

              {/* Barra de progreso */}
              <Box sx={{ width: '100%', maxWidth: 300 }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    Progreso de desarrollo
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: 'grey.200',
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  {progress}% completado
                </Typography>
              </Box>

              {/* Funcionalidades planeadas */}
              <Box sx={{ width: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Funcionalidades Planeadas:
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    • Interfaz de usuario intuitiva
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Gestión completa de datos
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Reportes y estadísticas
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Integración con otros módulos
                  </Typography>
                </Stack>
              </Box>

              {/* Botones de acción */}
              <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<ArrowBack />}
                  onClick={() => navigate('/dashboard')}
                >
                  Volver al Dashboard
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                >
                  Página Anterior
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 3 }}>
          ¿Tienes sugerencias? Contacta al equipo de desarrollo
        </Typography>
      </Box>
    </PageContainer>
  );
};

export default ComingSoon;