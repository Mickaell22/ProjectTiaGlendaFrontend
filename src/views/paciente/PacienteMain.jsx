// src/views/pacientes/PacienteMain.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Tabs, Tab, useTheme, Alert
} from '@mui/material';
import { LocalHospital, PersonAdd } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import PacienteLista from './PacienteLista';
import PacienteFormulario from './PacienteFormulario';
import PacienteDetalles from './PacienteDetalles';

// Servicios y hooks
import PacienteService from '../../services/pacienteService.js';
import EspecialidadService from '../../services/especialidadService.js';
import useSnackbar from '../../hooks/useSnackbar.js';
import useAuth from '../../hooks/useAuth.js';
import { useUserRole } from '../../hooks/useUserRole';

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
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAdmin, isTherapist, permissions, loading: roleLoading } = useUserRole();

  // Tabs/UI
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  // Datos
  const [pacientes, setPacientes] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);

  // Edición
  const [editingData, setEditingData] = useState(null);

  // Diálogos
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

  // Hooks
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const { requireAuth } = useAuth();

  useEffect(() => {
    if (requireAuth()) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      showError(error?.message || 'Error al cargar pacientes');
    } finally {
      setLoading(false);
    }
  };

  /* ===== Handlers de Tabs ===== */
  const handleChangeTab = (_, newValue) => {
    setActiveTab(newValue);
    if (newValue !== 1) setEditingData(null);
  };

  /* ===== Lista: acciones ===== */
  const handleNewPatient = () => {
    setEditingData(null);
    setActiveTab(1);
  };

  const handleEdit = (item) => {
    setEditingData(item);
    setActiveTab(1);
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
      showError(error?.message || 'Error al eliminar paciente');
    }
    setConfirmDialog({ open: false, id: null });
  };

  const handleViewDetail = (item) => {
    setDetailDialog({ open: true, data: item });
  };

  const handleViewDocuments = (paciente) => {
    navigate(`/pacientes/${paciente.id}/documentos`);
  };

  /* ===== Formulario ===== */
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
      setActiveTab(0);
    } catch (error) {
      showError(error?.message || 'Error al guardar paciente');
      throw error;
    }
  };

  const handleFormCancel = () => {
    setEditingData(null);
    setActiveTab(0);
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

  // Verificar permisos de acceso después de todos los hooks
  if (roleLoading) {
    return <LoadingSpinner message="Verificando permisos..." fullHeight />;
  }

  if (!permissions.pacientes.view) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Acceso no autorizado
          </Typography>
          <Typography>
            No tienes permisos para acceder a la gestión de pacientes. Solo administradores y terapeutas pueden acceder a esta sección.
          </Typography>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Cargando pacientes..." fullHeight />;
  }

  return (
    <ErrorBoundary>
      <Box>
        {/* Header principal con borde arcoíris y ancho consistente */}
        <Container maxWidth="xl" sx={{ py: 2 }}>
          <Paper
            elevation={4}
            sx={{
              borderRadius: 3,
              backgroundColor: 'background.paper',
              mb: 4,
              overflow: 'hidden',
              border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : '4px solid transparent',
              backgroundImage: theme.palette.mode === 'dark' ? 'none' : `linear-gradient(${theme.palette.background.paper}, ${theme.palette.background.paper}), linear-gradient(270deg, #673AB7, #E91E63, #FF9800, #4CAF50)`,
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              animation: theme.palette.mode === 'dark' ? 'none' : 'rainbow 5s linear infinite',
              '@keyframes rainbow': {
                '0%': { backgroundPosition: '0% 50%' },
                '100%': { backgroundPosition: '100% 50%' }
              },
              backgroundSize: '300% 100%',
              maxWidth: '90%',
              mx: 'auto'
            }}
          >
            <Box sx={{ p: 3, pb: 0 }}>
              <Typography
                variant="h4"
                fontWeight="bold"
                color="text.primary"
                display="flex"
                alignItems="center"
                mb={2}
              >
                <LocalHospital sx={{ mr: 2, fontSize: 40 }} />
                Gestión de Pacientes
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Administración de pacientes, tratamientos y seguimiento médico
              </Typography>

              <Tabs
                value={activeTab}
                onChange={handleChangeTab}
                aria-label="Pestañas de gestión de pacientes"
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
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={activeTab} index={index}>
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
          message="Esta acción no se puede deshacer. ¿Deseas eliminar este paciente?"
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
