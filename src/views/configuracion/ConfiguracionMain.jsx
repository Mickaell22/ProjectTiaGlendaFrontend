import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Tabs, Tab
} from '@mui/material';
import { 
  Settings, Security, Notifications, Business, DataUsage
} from '@mui/icons-material';

// Servicios y hooks
import useSnackbar from '../../hooks/useSnackbar.js';
import useAuth from '../../hooks/useAuth.js';

// Componentes compartidos
import CustomSnackbar from '../../components/shared/CustomSnackbar.jsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import ErrorBoundary from '../../components/shared/ErrorBoundary.jsx';

// Componentes modulares (los crearemos)
import ConfiguracionGeneral from './ConfiguracionGeneral.jsx';
import ConfiguracionSeguridad from './ConfiguracionSeguridad.jsx';
import ConfiguracionNotificaciones from './ConfiguracionNotificaciones.jsx';
import ConfiguracionDatos from './ConfiguracionDatos.jsx';

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

const ConfiguracionMain = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [configuraciones, setConfiguraciones] = useState({
    general: {},
    seguridad: {},
    notificaciones: {},
    datos: {}
  });

  // Hooks personalizados
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const { requireAuth } = useAuth();

  useEffect(() => {
    if (requireAuth()) {
      fetchConfiguraciones();
    }
  }, []);

  const fetchConfiguraciones = async () => {
    try {
      setLoading(true);
      // Aquí cargarías las configuraciones desde localStorage o API
      const savedConfig = localStorage.getItem('sistema_configuraciones');
      if (savedConfig) {
        setConfiguraciones(JSON.parse(savedConfig));
      }
    } catch (error) {
      showError('Error al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguracion = async (categoria, nuevaConfig) => {
    try {
      const configActualizada = {
        ...configuraciones,
        [categoria]: { ...configuraciones[categoria], ...nuevaConfig }
      };
      
      setConfiguraciones(configActualizada);
      localStorage.setItem('sistema_configuraciones', JSON.stringify(configActualizada));
      showSuccess('Configuración guardada correctamente');
    } catch (error) {
      showError('Error al guardar configuración');
    }
  };

  // Configuración de tabs
  const tabs = [
    {
      label: 'General',
      icon: <Settings />,
      component: (
        <ConfiguracionGeneral
          configuracion={configuraciones.general}
          onSave={(config) => saveConfiguracion('general', config)}
        />
      )
    },
    {
      label: 'Seguridad',
      icon: <Security />,
      component: (
        <ConfiguracionSeguridad
          configuracion={configuraciones.seguridad}
          onSave={(config) => saveConfiguracion('seguridad', config)}
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
    },
    {
      label: 'Datos',
      icon: <DataUsage />,
      component: (
        <ConfiguracionDatos
          configuracion={configuraciones.datos}
          onSave={(config) => saveConfiguracion('datos', config)}
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
              backgroundColor: '#fff', 
              mb: 4, 
              overflow: 'hidden', 
              border: '4px solid transparent', 
              backgroundImage: 'linear-gradient(white, white), linear-gradient(270deg, #607D8B, #455A64, #37474F, #263238)', 
              backgroundOrigin: 'border-box', 
              backgroundClip: 'padding-box, border-box', 
              animation: 'rainbow 5s linear infinite', 
              '@keyframes rainbow': { 
                '0%': { backgroundPosition: '0% 50%' }, 
                '100%': { backgroundPosition: '100% 50%' } 
              }, 
              backgroundSize: '300% 100%' 
            }}
          >
            <Box sx={{ p: 3, pb: 0 }}>
              <Typography variant="h4" fontWeight="bold" color="black" display="flex" alignItems="center" mb={2}>
                <Business sx={{ mr: 2, fontSize: 40 }} />
                Configuraciones del Sistema
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Administra las configuraciones generales, seguridad, notificaciones y datos del sistema
              </Typography>
            </Box>
          </Paper>
        </Container>

        {/* Navegación por pestañas */}
        <Container maxWidth="xl">
          <Paper elevation={2} sx={{ mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)} 
              sx={{ borderBottom: 1, borderColor: 'divider' }}
              variant="scrollable"
              scrollButtons="auto"
            >
              {tabs.map((tab, index) => (
                <Tab 
                  key={index}
                  label={tab.label} 
                  icon={tab.icon} 
                />
              ))}
            </Tabs>
          </Paper>

          {/* Contenido de pestañas */}
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

export default ConfiguracionMain;