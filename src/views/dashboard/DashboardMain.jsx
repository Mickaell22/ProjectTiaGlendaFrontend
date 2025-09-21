import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useAuth } from 'src/contexts/AuthContext';
import PageContainer from 'src/components/container/PageContainer';
import DashboardErrorBoundary from 'src/components/shared/DashboardErrorBoundary';

// Import role-specific dashboard views
import AdminDashboardView from './AdminDashboardView';
import TherapistDashboardView from './TherapistDashboardView';
import PedagogueDashboardView from './PedagogueDashboardView';

const DashboardMain = () => {
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      const role = determineUserRole(user);
      setUserRole(role);
      setIsLoading(false);
    } else if (!authLoading && !user) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const determineUserRole = (user) => {
    if (!user) return null;

    // Check if user is administrator
    if (user.rol === 'Administrador' || user.rol?.toLowerCase() === 'administrador') {
      return 'admin';
    }

    // Check specialties for therapist or pedagogue role
    if (user.especialidades && user.especialidades.length > 0) {
      const hasTherapeuticSpecialty = user.especialidades.some(esp =>
        esp.area === 'Especialidad terapéutica' ||
        esp.area?.toLowerCase().includes('terap')
      );
      const hasPedagogicalSpecialty = user.especialidades.some(esp =>
        esp.area === 'Especialidad pedagógica' ||
        esp.area?.toLowerCase().includes('pedag')
      );

      if (hasTherapeuticSpecialty) return 'therapist';
      if (hasPedagogicalSpecialty) return 'pedagogue';
    }

    // Fallback: check role name directly
    const roleLowerCase = user.rol?.toLowerCase() || '';
    if (roleLowerCase.includes('terap')) return 'therapist';
    if (roleLowerCase.includes('pedag') || roleLowerCase.includes('pedagog')) return 'pedagogue';

    // Default to general user if no specific role found
    return 'general';
  };

  const renderDashboardByRole = () => {
    return (
      <DashboardErrorBoundary>
        {(() => {
          switch (userRole) {
            case 'admin':
              return <AdminDashboardView />;
            case 'therapist':
              return <TherapistDashboardView />;
            case 'pedagogue':
              return <PedagogueDashboardView />;
            case 'general':
              return (
                <PageContainer title="Dashboard" description="Bienvenido al Centro">
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Alert severity="info" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                      <Typography variant="h6" gutterBottom>
                        Bienvenido al Centro Tía Glenda
                      </Typography>
                      <Typography variant="body2">
                        Tu rol no tiene un dashboard específico asignado.
                        Contacta al administrador para obtener los permisos apropiados.
                      </Typography>
                    </Alert>
                  </Box>
                </PageContainer>
              );
            default:
              return (
                <PageContainer title="Dashboard" description="Error de acceso">
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Alert severity="warning" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                      <Typography variant="h6" gutterBottom>
                        No se pudo determinar tu rol
                      </Typography>
                      <Typography variant="body2">
                        Por favor, contacta al administrador del sistema.
                      </Typography>
                    </Alert>
                  </Box>
                </PageContainer>
              );
          }
        })()}
      </DashboardErrorBoundary>
    );
  };

  if (isLoading || authLoading) {
    return (
      <PageContainer title="Dashboard" description="Cargando panel de control">
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
          gap={2}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" color="text.secondary">
            Cargando tu panel de control...
          </Typography>
        </Box>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer title="Dashboard" description="Acceso no autorizado">
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Alert severity="error" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Acceso no autorizado
            </Typography>
            <Typography variant="body2">
              Por favor, inicia sesión para acceder al panel de control.
            </Typography>
          </Alert>
        </Box>
      </PageContainer>
    );
  }

  return renderDashboardByRole();
};

export default DashboardMain;