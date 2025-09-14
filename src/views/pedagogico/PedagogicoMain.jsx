// src/views/pedagogico/PedagogicoMain.jsx
import React, { useState } from 'react';
import {
  Box, Container, Paper, Typography, Tabs, Tab
} from '@mui/material';
import {
  School, CalendarMonth, Assignment, Today, BarChart, Add
} from '@mui/icons-material';

import SesionesPedagogicas from './SesionesPedagogicas';
import CrearSesionPedagogica from './CrearSesionPedagogica';
import PedagogicoCronogramas from './PedagogicoCronogramas';
import PedagogicoAsistencia from './PedagogicoAsistencia';
import PedagogicoHoy from './PedagogicoHoy';
import PedagogicoEstadisticas from './PedagogicoEstadisticas';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`pedagogico-tabpanel-${index}`}
      aria-labelledby={`pedagogico-tab-${index}`}
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
    id: `pedagogico-tab-${index}`,
    'aria-controls': `pedagogico-tabpanel-${index}`,
  };
}

const PedagogicoMain = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const tabs = [
    {
      label: 'Sesiones',
      icon: <School />,
      component: <SesionesPedagogicas onNavigateToCreate={() => setValue(1)} />
    },
    {
      label: 'Crear',
      icon: <Add />,
      component: <CrearSesionPedagogica />
    },
    {
      label: 'Cronogramas',
      icon: <CalendarMonth />,
      component: <PedagogicoCronogramas />
    },
    {
      label: 'Asistencia',
      icon: <Assignment />,
      component: <PedagogicoAsistencia />
    },
    {
      label: 'Hoy',
      icon: <Today />,
      component: <PedagogicoHoy />
    },
    {
      label: 'Estadísticas',
      icon: <BarChart />,
      component: <PedagogicoEstadisticas />
    }
  ];

  return (
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
            backgroundImage: 'linear-gradient(white, white), linear-gradient(270deg, #4CAF50, #2E7D32, #388E3C, #1B5E20)', 
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
              <School sx={{ mr: 2, fontSize: 40 }} />
              Área Pedagógica
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Gestión integral de sesiones pedagógicas, cronogramas, asistencias y seguimiento de estudiantes
            </Typography>

            <Tabs 
              value={value} 
              onChange={handleChange} 
              aria-label="Pestañas del área pedagógica"
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
                    color: '#4CAF50',
                    fontWeight: 600
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                  backgroundColor: '#4CAF50'
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

export default PedagogicoMain;