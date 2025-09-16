// src/views/terapeutico/TerapeuticoMain.jsx
import React, { useState } from 'react';
import {
  Box, Container, Paper, Typography, Tabs, Tab, useTheme
} from '@mui/material';
import { 
  Psychology, CalendarMonth, Assignment, Today, BarChart, Add
} from '@mui/icons-material';

import CrearSesionTerapeutica from './CrearSesionTerapeutica';
import SesionesTerapeuticas from './SesionesTerapeuticas';
import TerapeuticoCronogramas from './TerapeuticoCronogramas';
import TerapeuticoAsistencia from './TerapeuticoAsistencia';
import TerapeuticoHoy from './TerapeuticoHoy';
import TerapeuticoEstadisticas from './TerapeuticoEstadisticas';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`terapeutico-tabpanel-${index}`}
      aria-labelledby={`terapeutico-tab-${index}`}
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
    id: `terapeutico-tab-${index}`,
    'aria-controls': `terapeutico-tabpanel-${index}`,
  };
}

const TerapeuticoMain = () => {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const [refreshSesiones, setRefreshSesiones] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleSessionCreated = () => {
    // Refrescar la lista de sesiones
    setRefreshSesiones(prev => prev + 1);
    // Cambiar al tab de sesiones para mostrar la nueva sesión
    setValue(0);
  };

  const tabs = [
    {
      label: 'Sesiones',
      icon: <Psychology />,
      component: <SesionesTerapeuticas
        onNavigateToCreate={() => setValue(1)}
        refreshTrigger={refreshSesiones}
      />
    },
    {
      label: 'Crear',
      icon: <Add />,
      component: <CrearSesionTerapeutica onSessionCreated={handleSessionCreated} />
    },
    {
      label: 'Cronogramas',
      icon: <CalendarMonth />,
      component: <TerapeuticoCronogramas />
    },
    {
      label: 'Asistencia',
      icon: <Assignment />,
      component: <TerapeuticoAsistencia />
    },
    {
      label: 'Hoy',
      icon: <Today />,
      component: <TerapeuticoHoy />
    },
    {
      label: 'Estadísticas',
      icon: <BarChart />,
      component: <TerapeuticoEstadisticas />
    }
  ];

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
            backgroundImage: theme.palette.mode === 'dark' ? 'none' : `linear-gradient(${theme.palette.background.paper}, ${theme.palette.background.paper}), linear-gradient(270deg, #E91E63, #9C27B0, #673AB7, #3F51B5)`,
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

      {tabs.map((tab, index) => (
        <TabPanel key={index} value={value} index={index}>
          {tab.component}
        </TabPanel>
      ))}
    </Box>
  );
};

export default TerapeuticoMain;