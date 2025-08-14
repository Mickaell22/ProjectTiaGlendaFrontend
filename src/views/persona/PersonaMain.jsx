import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Tabs, Tab
} from '@mui/material';
import { 
  Person, Add
} from '@mui/icons-material';

import PersonaLista from './PersonaLista';
import PersonaFormulario from './PersonaFormulario';
import PersonaDetalles from './PersonaDetalles';

// Servicios y hooks
import PersonaService from '../../services/personaService.js';
import useSnackbar from '../../hooks/useSnackbar.js';
import useAuth from '../../hooks/useAuth.js';

// Componentes compartidos
import CustomSnackbar from '../../components/shared/CustomSnackbar.jsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import ConfirmDialog from '../../components/shared/ConfirmDialog.jsx';
import ErrorBoundary from '../../components/shared/ErrorBoundary.jsx';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`persona-tabpanel-${index}`}
      aria-labelledby={`persona-tab-${index}`}
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
    id: `persona-tab-${index}`,
    'aria-controls': `persona-tabpanel-${index}`,
  };
}

const PersonaMain = () => {
  const [value, setValue] = useState(0);
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingData, setEditingData] = useState(null);
  
  // Estados para diálogos
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

  // Hooks personalizados
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const { requireAuth } = useAuth();

  useEffect(() => {
    if (requireAuth()) {
      fetchPersonas();
    }
  }, []);

  const fetchPersonas = async () => {
    try {
      setLoading(true);
      const data = await PersonaService.getAll();
      setPersonas(data);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
    // Limpiar datos de edición cuando cambie de tab
    if (newValue !== 1) {
      setEditingData(null);
    }
  };

  // Manejadores para PersonaLista
  const handleNewPersona = () => {
    setEditingData(null);
    setValue(1); // Ir a la pestaña de formulario
  };

  const handleEdit = (item) => {
    setEditingData(item);
    setValue(1); // Ir a la pestaña de formulario
  };

  const handleDelete = (id) => {
    setConfirmDialog({ open: true, id });
  };

  const confirmDelete = async () => {
    try {
      await PersonaService.delete(confirmDialog.id);
      showSuccess('Persona eliminada correctamente');
      fetchPersonas();
    } catch (error) {
      showError(error.message);
    }
    setConfirmDialog({ open: false, id: null });
  };

  const handleViewDetail = (item) => {
    setDetailDialog({ open: true, data: item });
  };

  // Manejadores para PersonaFormulario
  const handleFormSubmit = async (backendData, isEditing) => {
    try {
      if (isEditing && editingData) {
        await PersonaService.update(editingData.id, backendData);
        showSuccess('Persona actualizada correctamente');
      } else {
        await PersonaService.create(backendData);
        showSuccess('Persona creada correctamente');
      }
      
      setEditingData(null);
      await fetchPersonas();
      setValue(0); // Volver a la lista
    } catch (error) {
      showError(error.message);
      throw error;
    }
  };

  const handleFormCancel = () => {
    setEditingData(null);
    setValue(0); // Volver a la lista
  };

  const tabs = [
    {
      label: 'Lista de Personas',
      icon: <Person />,
      component: (
        <PersonaLista
          personas={personas}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetail={handleViewDetail}
          onNewPersona={handleNewPersona}
          loading={loading}
        />
      )
    },
    {
      label: editingData ? 'Editar Persona' : 'Nueva Persona',
      icon: <Add />,
      component: (
        <PersonaFormulario
          editingData={editingData}
          personas={personas}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={loading}
        />
      )
    }
  ];

  if (loading) {
    return <LoadingSpinner message="Cargando datos de personas..." fullHeight />;
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
              backgroundImage: 'linear-gradient(white, white), linear-gradient(270deg, #8BC34A, #4CAF50, #009688, #00BCD4)', 
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
                <Person sx={{ mr: 2, fontSize: 40 }} />
                Gestión de Personas
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Administración completa del registro de personas en el sistema
              </Typography>

              <Tabs 
                value={value} 
                onChange={handleChange} 
                aria-label="Pestañas de gestión de personas"
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

        {/* Diálogos */}
        <PersonaDetalles
          open={detailDialog.open}
          onClose={() => setDetailDialog({ open: false, data: null })}
          personaData={detailDialog.data}
          onEdit={handleEdit}
        />

        <ConfirmDialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ open: false, id: null })}
          onConfirm={confirmDelete}
          title="¿Eliminar persona?"
          message="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar esta persona del sistema?"
          confirmText="Eliminar"
          confirmColor="error"
          severity="error"
        />

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

export default PersonaMain;