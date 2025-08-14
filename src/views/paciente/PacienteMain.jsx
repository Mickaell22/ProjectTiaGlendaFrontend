import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Tabs, Tab
} from '@mui/material';
import { 
  LocalHospital, PersonAdd, Visibility, Description
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import PacienteLista from './PacienteLista';
import PacienteFormulario from './PacienteFormulario';
import PacienteDetalles from './PacienteDetalles';

// Servicios y hooks
import PacienteService from '../../services/pacienteService.js';
import EspecialidadService from '../../services/especialidadService.js';
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
      id={`paciente-tabpanel-${index}`}
      aria-labelledby={`paciente-tab-${index}`}
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
    id: `paciente-tab-${index}`,
    'aria-controls': `paciente-tabpanel-${index}`,
  };
}

const PacienteMain = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState(0);
  const [pacientes, setPacientes] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
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
      const [pacientesData, especialidadesData] = await Promise.all([
        PacienteService.getAll(),
        EspecialidadService.getAll()
      ]);
      
      setPacientes(pacientesData);
      setEspecialidades(especialidadesData);
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

  // Manejadores para PacienteLista
  const handleNewPatient = () => {
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
      await PacienteService.delete(confirmDialog.id);
      showSuccess('Paciente eliminado correctamente');
      fetchData();
    } catch (error) {
      showError(error.message);
    }
    setConfirmDialog({ open: false, id: null });
  };

  const handleViewDetail = (item) => {
    setDetailDialog({ open: true, data: item });
  };

  const handleViewDocuments = (paciente) => {
    navigate(`/pacientes/${paciente.id}/documentos`);
  };

  // Manejadores para PacienteFormulario
  const handleFormSubmit = async (payload, isEditing) => {
    try {
      if (isEditing && editingData) {
        await PacienteService.update(editingData.id, payload);
        showSuccess('Paciente actualizado correctamente');
      } else {
        await PacienteService.create(payload);
        showSuccess('Paciente registrado exitosamente');
      }
      
      setEditingData(null);
      await fetchData();
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
      label: 'Lista',
      icon: <LocalHospital />,
      component: (
        <PacienteLista
          pacientes={pacientes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetail={handleViewDetail}
          onNewPatient={handleNewPatient}
          loading={loading}
        />
      )
    },
    {
      label: editingData ? 'Editar' : 'Crear',
      icon: <PersonAdd />,
      component: (
        <PacienteFormulario
          editingData={editingData}
          especialidades={especialidades}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={loading}
        />
      )
    }
  ];

  if (loading) {
    return <LoadingSpinner message="Cargando datos de pacientes..." fullHeight />;
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
              backgroundImage: 'linear-gradient(white, white), linear-gradient(270deg, #4CAF50, #2196F3, #9C27B0, #FF9800)', 
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
                <LocalHospital sx={{ mr: 2, fontSize: 40 }} />
                Gestión de Pacientes
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Administración completa de pacientes, tratamientos, especialidades y seguimiento médico
              </Typography>

              <Tabs 
                value={value} 
                onChange={handleChange} 
                aria-label="Pestañas de gestión de pacientes"
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
        <PacienteDetalles
          open={detailDialog.open}
          onClose={() => setDetailDialog({ open: false, data: null })}
          pacienteData={detailDialog.data}
          onEdit={handleEdit}
          onViewDocuments={handleViewDocuments}
        />

        <ConfirmDialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ open: false, id: null })}
          onConfirm={confirmDelete}
          title="¿Eliminar paciente?"
          message="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este paciente del sistema?"
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

export default PacienteMain;