import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Tabs, Tab, useTheme
} from '@mui/material';
import { 
  Settings, Notifications, Business
} from '@mui/icons-material';

// Servicios y hooks
import useSnackbar from '../../hooks/useSnackbar.js';
import useAuth from '../../hooks/useAuth.js';
import { useConfig } from '../../contexts/ConfigContext';
import ConfiguracionService from '../../services/configuracionService.js';

// Componentes compartidos
import CustomSnackbar from '../../components/shared/CustomSnackbar.jsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import ErrorBoundary from '../../components/shared/ErrorBoundary.jsx';

// HOC de protección de roles
import withRole from '../../hoc/withRole.jsx';

// Componentes modulares
import ConfiguracionGeneral from './ConfiguracionGeneral.jsx';
import ConfiguracionNotificaciones from './ConfiguracionNotificaciones.jsx';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`configuracion-tabpanel-${index}`}
      aria-labelledby={`configuracion-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `configuracion-tab-${index}`,
    'aria-controls': `configuracion-tabpanel-${index}`,
  };
}

const ConfiguracionMain = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [configuraciones, setConfiguraciones] = useState({
    general: {},
    notificaciones: {}
  });

  // Hooks personalizados
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const { requireAuth } = useAuth();
  const { refreshConfig } = useConfig();

  useEffect(() => {
    if (requireAuth()) {
      fetchConfiguraciones();
    }
  }, []);

  const fetchConfiguraciones = async () => {
    try {
      setLoading(true);
      // Obtener resumen de todas las configuraciones desde la API
      const result = await ConfiguracionService.getResumenConfiguracion();
      
      if (result.success) {
        const apiData = result.data;
        setConfiguraciones({
          general: ConfiguracionService.mapGeneralConfigToFrontend(apiData.general || {}),
          notificaciones: apiData.notificaciones_usuario || {}
        });
      } else {
        showError(result.message || 'Error al cargar configuraciones');
      }
    } catch (error) {
      console.error('Error al obtener configuraciones:', error);
      showError('Error al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguracion = async (categoria, nuevaConfig) => {
    try {
      let result;
      
      switch (categoria) {
        case 'general':
          // El servicio ya hace el mapeo internamente
          result = await ConfiguracionService.updateConfiguracionGeneral(nuevaConfig);
          break;
          
        case 'notificaciones':
          result = await ConfiguracionService.updateConfiguracionNotificacionesUsuario(nuevaConfig);
          break;
          
        default:
          throw new Error(`Categoría de configuración no reconocida: ${categoria}`);
      }
      
      if (result.success) {
        // Actualizar estado local después de guardar exitosamente
        const configActualizada = {
          ...configuraciones,
          [categoria]: { ...configuraciones[categoria], ...nuevaConfig }
        };
        setConfiguraciones(configActualizada);

        // Si es configuración general, refrescar el contexto global
        if (categoria === 'general') {
          await refreshConfig();
        }

        showSuccess(result.message || 'Configuración guardada correctamente');
      } else {
        showError(result.message || 'Error al guardar configuración');
      }
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      showError('Error al guardar configuración');
    }
  };

  // Configuración de tabs
  const tabs = [
    {
      label: 'General',
      icon: <Business />,
      component: (
        <ConfiguracionGeneral
          configuracion={configuraciones.general}
          onSave={(config) => saveConfiguracion('general', config)}
        />
      )
    },
    {
      label: 'Notificaciones',
      icon: <Notifications />,
      component: (
        <ConfiguracionNotificaciones
          configuracion={configuraciones.notificaciones}
          onSave={(config) => saveConfiguracion('notificaciones', config)}
        />
      )
    }
  ];

  if (loading) {
    return <LoadingSpinner message="Cargando configuraciones..." fullHeight />;
  }

  return (
    <ErrorBoundary>
      <Box>
        <Container maxWidth="xl" sx={{ py: 2 }}>
          <Paper
            elevation={4}
            sx={{
              borderRadius: 3,
              backgroundColor: theme.palette.background.paper,
              mb: 4,
              overflow: 'hidden',
              border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : '4px solid transparent',
              backgroundImage: theme.palette.mode === 'dark' ? 'none' : `linear-gradient(${theme.palette.background.paper}, ${theme.palette.background.paper}), linear-gradient(270deg, #607D8B, #455A64, #37474F, #263238)`,
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              animation: theme.palette.mode === 'dark' ? 'none' : 'rainbow 5s linear infinite',
              '@keyframes rainbow': {
                '0%': { backgroundPosition: '0% 50%' },
                '100%': { backgroundPosition: '100% 50%' }
              },
              backgroundSize: '300% 100%'
            }}
          >
            <Box sx={{ p: 3, pb: 0 }}>
              <Typography variant="h4" fontWeight="bold" color="text.primary" display="flex" alignItems="center" mb={2}>
                <Business sx={{ mr: 2, fontSize: 40 }} />
                Configuraciones del Sistema
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Administra la información del centro y las preferencias de notificaciones
              </Typography>

              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                aria-label="Pestañas de configuración del sistema"
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTabs-flexContainer': { gap: 2 },
                  '& .MuiTab-root': {
                    minHeight: 64,
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    color: 'text.secondary',
                    '&.Mui-selected': { color: 'primary.main', fontWeight: 600 }
                  },
                  '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' }
                }}
              >
                {tabs.map((tab, index) => (
                  <Tab
                    key={index}
                    label={tab.label}
                    icon={tab.icon}
                    iconPosition="start"
                    {...a11yProps(index)}
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 1
                    }}
                  />
                ))}
              </Tabs>
            </Box>
          </Paper>
        </Container>

        {/* Contenido de pestañas */}
        <Container maxWidth="xl">
          {tabs.map((tab, index) => (
            <TabPanel key={index} value={activeTab} index={index}>
              {tab.component}
            </TabPanel>
          ))}
        </Container>

        {/* Notificaciones */}
        <CustomSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={hideSnackbar}
        />
      </Box>
    </ErrorBoundary>
  );
};

// Protección de acceso: Solo administradores
export default withRole(ConfiguracionMain, {
  allowedRoles: ['administrador'],
  moduleName: 'Configuración del Sistema'
});