function a11yProps(index) {
  return {
    id: `terapeutico-tab-${index}`,
    'aria-controls': `terapeutico-tabpanel-${index}`,
  };
}
// src/views/terapeutico/TerapeuticoMain.jsx
import React, { useState } from 'react';
import { getModuleTheme } from 'src/config/moduleThemes';
import {
  Box, Container, Paper, Typography, Tabs, Tab, useTheme, Alert
} from '@mui/material';
import {
  Psychology, CalendarMonth, Assignment, Today, Add
} from '@mui/icons-material';

import CrearSesionTerapeutica from './CrearSesionTerapeutica';
import SesionesTerapeuticas from './SesionesTerapeuticas';
import TerapeuticoCronogramas from './TerapeuticoCronogramas';
import TerapeuticoAsistencia from './TerapeuticoAsistencia';
import TerapeuticoHoy from './TerapeuticoHoy';
import { useUserRole } from '../../hooks/useUserRole';

// HOC de protección de roles
import withRole from '../../hoc/withRole.jsx';

function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`terapeutico-tabpanel-${index}`}
      aria-labelledby={`terapeutico-tab-${index}`}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function getAllTabs({ permissions, isAdmin, isTherapist, refreshSesiones, handleSessionCreated, setValue }) {
  const tabs = [];
  // Tab Sesiones
  tabs.push({ label: 'Sesiones', icon: <Psychology />, component: null });
  // Tab Crear
  if (permissions.sesionesTerapeuticas.create) {
    tabs.push({ label: 'Crear', icon: <Add />, component: <CrearSesionTerapeutica onSessionCreated={handleSessionCreated} /> });
  }
  if (permissions.sesionesTerapeuticas.viewCronograma) {
    tabs.push({ label: 'Cronogramas', icon: <CalendarMonth />, component: <TerapeuticoCronogramas readOnly={!permissions.sesionesTerapeuticas.editCronograma} userViewMode={isTherapist} /> });
  }
  if (permissions.sesionesTerapeuticas.viewAsistencia) {
    tabs.push({ label: 'Asistencia', icon: <Assignment />, component: <TerapeuticoAsistencia canRegister={permissions.sesionesTerapeuticas.registerAsistencia} canEdit={isAdmin} userViewMode={isTherapist} /> });
  }
  // Asignar el callback correcto al tab 'Sesiones'
  const crearTabIndex = tabs.findIndex(tab => tab.label === 'Crear');
  tabs[0].component = <SesionesTerapeuticas
    onNavigateToCreate={isAdmin && crearTabIndex !== -1 ? () => setValue(crearTabIndex) : undefined}
    refreshTrigger={refreshSesiones}
    readOnly={!isAdmin}
    userViewMode={isTherapist}
  />;
  return tabs;
}

      const TerapeuticoMain = () => {
        const theme = useTheme();
        const { isAdmin, isTherapist, permissions, loading } = useUserRole();
        const [value, setValue] = useState(0);
        const [refreshSesiones, setRefreshSesiones] = useState(0);

        const handleChange = (event, newValue) => {
          setValue(newValue);
        };

        const handleSessionCreated = () => {
          setRefreshSesiones(prev => prev + 1);
          setValue(0);
        };

        const tabs = getAllTabs({ permissions, isAdmin, isTherapist, refreshSesiones, handleSessionCreated, setValue });

  // Mostrar loading mientras se determina el rol
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Cargando...</Typography>
      </Box>
    );
  }

  // Verificar si el usuario tiene permisos para el área terapéutica
  if (!permissions.sesionesTerapeuticas.view) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Acceso no autorizado
          </Typography>
          <Typography>
            No tienes permisos para acceder al área terapéutica. Solo administradores y terapeutas pueden acceder a esta sección.
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Box>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Paper
          elevation={4}
          sx={{
            borderRadius: 3,
            backgroundColor: 'background.paper',
            mb: 4,
            overflow: 'hidden',
            border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : '4px solid transparent',
            backgroundImage: theme.palette.mode === 'dark' ? 'none' : `linear-gradient(${theme.palette.background.paper}, ${theme.palette.background.paper}), linear-gradient(270deg, ${getModuleTheme('terapeutico').colors.join(', ')})`,
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
              <Psychology sx={{ mr: 2, fontSize: 40 }} />
              Área Terapéutica
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Gestión integral de sesiones terapéuticas, cronogramas, asistencias y seguimiento de pacientes
            </Typography>

            <Tabs 
              value={value} 
              onChange={handleChange} 
              aria-label="Pestañas del área terapéutica"
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTabs-flexContainer': {
                  gap: 2
                },
                '& .MuiTab-root': {
                  minHeight: 64,
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 600
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={tab.label}
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

      {tabs.map((tab, index) => (
        <TabPanel key={index} value={value} index={index}>
          {tab.component}
        </TabPanel>
      ))}
    </Box>
  );
};

// Protección de acceso: Administradores y Terapeutas
export default withRole(TerapeuticoMain, {
  allowedRoles: ['administrador', 'terapeuta'],
  moduleName: 'Módulo Terapéutico'
});