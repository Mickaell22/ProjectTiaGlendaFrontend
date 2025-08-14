import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Tabs, Tab
} from '@mui/material';
import { 
  FamilyRestroom, PersonAdd, Visibility
} from '@mui/icons-material';

import TutorLista from './TutorLista';
import TutorFormulario from './TutorFormulario';
import TutorDetalles from './TutorDetalles';

// Servicios y hooks
import TutorService from '../../services/tutorService.js';
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
      id={`tutor-tabpanel-${index}`}
      aria-labelledby={`tutor-tab-${index}`}
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
    id: `tutor-tab-${index}`,
    'aria-controls': `tutor-tabpanel-${index}`,
  };
}

const TutorMain = () => {
  const [value, setValue] = useState(0);
  const [tutores, setTutores] = useState([]);
  const [personasDisponibles, setPersonasDisponibles] = useState([]);
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
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tutoresData, personasData] = await Promise.all([
        TutorService.getAll().catch(() => []),
        PersonaService.getAll().catch(() => [])
      ]);
      
      setTutores(tutoresData);
      setPersonasDisponibles(personasData);
    } catch (error) {
      showError('Error al cargar datos: ' + error.message);
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

  // Manejadores para TutorLista
  const handleNewTutor = () => {
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
      await TutorService.delete(confirmDialog.id);
      showSuccess('Tutor eliminado correctamente');
      fetchData();
    } catch (error) {
      showError('Error al eliminar tutor: ' + error.message);
    }
    setConfirmDialog({ open: false, id: null });
  };

  const handleViewDetail = (item) => {
    setDetailDialog({ open: true, data: item });
  };

  // Manejadores para TutorFormulario
  const handleFormSubmit = async (backendData, isEditing) => {
    try {
      if (isEditing && editingData) {
        await TutorService.update(editingData.id, backendData);
        showSuccess('Tutor actualizado correctamente');
      } else {
        await TutorService.create(backendData);
        showSuccess('Tutor creado correctamente');
      }
      
      setEditingData(null);
      await fetchData();
      setValue(0); // Volver a la lista
    } catch (error) {
      showError('Error al guardar tutor: ' + error.message);
      throw error;
    }
  };

  const handleFormCancel = () => {
    setEditingData(null);
    setValue(0); // Volver a la lista
  };

  const tabs = [
    {
      label: 'Lista de Tutores',
      icon: <FamilyRestroom />,
      component: (
        <TutorLista
          tutores={tutores}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetail={handleViewDetail}
          onNewTutor={handleNewTutor}
          loading={loading}
        />
      )
    },
    {
      label: editingData ? 'Editar Tutor' : 'Nuevo Tutor',
      icon: <PersonAdd />,
      component: (
        <TutorFormulario
          editingData={editingData}
          personasDisponibles={personasDisponibles}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={loading}
        />
      )
    }
  ];

  if (loading) {
    return <LoadingSpinner message="Cargando datos de tutores..." fullHeight />;
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
              backgroundImage: 'linear-gradient(white, white), linear-gradient(270deg, #FF5722, #795548, #607D8B, #9E9E9E)', 
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
                <FamilyRestroom sx={{ mr: 2, fontSize: 40 }} />
                Gestión de Tutores
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Administración completa de tutores y representantes legales de los pacientes
              </Typography>

              <Tabs 
                value={value} 
                onChange={handleChange} 
                aria-label="Pestañas de gestión de tutores"
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
        <TutorDetalles
          open={detailDialog.open}
          onClose={() => setDetailDialog({ open: false, data: null })}
          tutorData={detailDialog.data}
          onEdit={handleEdit}
        />

        <ConfirmDialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ open: false, id: null })}
          onConfirm={confirmDelete}
          title="¿Eliminar tutor?"
          message="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este tutor del sistema?"
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

export default TutorMain;