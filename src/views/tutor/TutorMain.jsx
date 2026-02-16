// src/views/tutores/TutorMain.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Tabs, Tab, useTheme, Alert
} from '@mui/material';
import { FamilyRestroom, PersonAdd } from '@mui/icons-material';

import TutorLista from './TutorLista';
import TutorFormulario from './TutorFormulario';
import TutorDetalles from './TutorDetalles';

// Servicios y hooks
import TutorService from '../../services/tutorService.js';
import useSnackbar from '../../hooks/useSnackbar.js';
import useAuth from '../../hooks/useAuth.js';
import { useUserRole } from '../../hooks/useUserRole';

// Componentes compartidos
import CustomSnackbar from '../../components/shared/CustomSnackbar.jsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import ConfirmDialog from '../../components/shared/ConfirmDialog.jsx';
import ErrorBoundary from '../../components/shared/ErrorBoundary.jsx';

// HOC de protección de roles
import withRole from '../../hoc/withRole.jsx';

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
  const theme = useTheme();
  const { isAdmin, isTherapist, permissions, loading: roleLoading } = useUserRole();

  // Estado principal
  const [activeTab, setActiveTab] = useState(0);
  const [tutores, setTutores] = useState([]);
  const [personasDisponibles, setPersonasDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingData, setEditingData] = useState(null);

  // Diálogos
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, action: null });

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
      const [tutoresData, personasData] = await Promise.all([
        TutorService.getAll().catch(() => []),
        TutorService.getPersonasDisponibles().catch(() => [])
      ]);
      setTutores(tutoresData);
      setPersonasDisponibles(personasData);
    } catch (error) {
      showError('Error al cargar datos: ' + (error?.message || 'Desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Tabs
  const handleChangeTab = (_, newValue) => {
    setActiveTab(newValue);
    if (newValue !== 1) setEditingData(null);
  };

  // Lista: acciones
  const handleNewTutor = () => {
    setEditingData(null);
    setActiveTab(1);
  };

  const handleEdit = (item) => {
    setEditingData(item);
    setActiveTab(1);
  };

  const handleDelete = (id) => {
    setConfirmDialog({ open: true, id, action: 'delete' });
  };

  const confirmDelete = async () => {
    try {
      await TutorService.delete(confirmDialog.id);
      showSuccess('Tutor desactivado correctamente');
      fetchData();
    } catch (error) {
      showError(error?.message || 'Error al desactivar tutor');
    }
    setConfirmDialog({ open: false, id: null, action: null });
  };

  const handleReactivar = (id) => {
    setConfirmDialog({ open: true, id, action: 'reactivar' });
  };

  const confirmReactivar = async () => {
    try {
      await TutorService.reactivar(confirmDialog.id);
      showSuccess('Tutor reactivado correctamente');
      fetchData();
    } catch (error) {
      showError(error?.message || 'Error al reactivar tutor');
    }
    setConfirmDialog({ open: false, id: null, action: null });
  };

  const handleViewDetail = async (item) => {
    try {
      // Usar el endpoint de detalle que incluye pacientes del backend
      const detalle = await TutorService.getById(item.id);
      setDetailDialog({ open: true, data: detalle });
    } catch {
      // Fallback: usar los datos de la lista si falla el detalle
      setDetailDialog({ open: true, data: item });
    }
  };

  // Formulario
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
      setActiveTab(0);
    } catch (error) {
      showError(error?.message || 'Error al guardar tutor');
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
      icon: <FamilyRestroom />,
      component: (
        <TutorLista
          tutores={tutores}
          onEdit={permissions.tutores.edit ? handleEdit : null}
          onDelete={isAdmin ? handleDelete : null}
          onReactivar={isAdmin ? handleReactivar : null}
          onViewDetail={handleViewDetail}
          onNewTutor={permissions.tutores.create ? handleNewTutor : null}
          loading={loading}
          isAdmin={isAdmin}
        />
      )
    },
    // Solo mostrar tab de Crear/Editar si tiene permisos
    ...(permissions.tutores.create || permissions.tutores.edit ? [{
      label: editingData ? 'Editar' : 'Crear',
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
    }] : [])
  ];

  // Verificar permisos de acceso
  if (roleLoading) {
    return <LoadingSpinner message="Verificando permisos..." fullHeight />;
  }

  if (!permissions.tutores.view) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Acceso no autorizado
          </Typography>
          <Typography>
            No tienes permisos para acceder a la gestión de tutores. Solo administradores, terapeutas y pedagogos pueden acceder a esta sección.
          </Typography>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Cargando tutores..." fullHeight />;
  }

  return (
    <ErrorBoundary>
      <Box>
        {/* Header principal con borde arcoíris (mismo tamaño/estilo) */}
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
                <FamilyRestroom sx={{ mr: 2, fontSize: 40 }} />
                Gestión de Tutores
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Administración de tutores y representantes legales
              </Typography>

              <Tabs
                value={activeTab}
                onChange={handleChangeTab}
                aria-label="Pestañas de gestión de tutores"
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

        {/* Diálogo de detalles */}
        <TutorDetalles
          open={detailDialog.open}
          onClose={() => setDetailDialog({ open: false, data: null })}
          tutorData={detailDialog.data}
          onEdit={handleEdit}
        />

        {/* Diálogo de confirmación - Desactivar */}
        <ConfirmDialog
          open={confirmDialog.open && confirmDialog.action === 'delete'}
          onClose={() => setConfirmDialog({ open: false, id: null, action: null })}
          onConfirm={confirmDelete}
          title="¿Desactivar tutor?"
          message="El tutor será marcado como inactivo. Puede ser reactivado posteriormente por un administrador."
          confirmText="Desactivar"
          confirmColor="warning"
          severity="warning"
        />

        {/* Diálogo de confirmación - Reactivar */}
        <ConfirmDialog
          open={confirmDialog.open && confirmDialog.action === 'reactivar'}
          onClose={() => setConfirmDialog({ open: false, id: null, action: null })}
          onConfirm={confirmReactivar}
          title="¿Reactivar tutor?"
          message="El tutor será reactivado y podrá ser asignado a pacientes nuevamente."
          confirmText="Reactivar"
          confirmColor="success"
          severity="info"
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

// Protección de acceso: Admin, Terapeuta y Pedagogo
export default withRole(TutorMain, {
  allowedRoles: ['administrador', 'terapeuta', 'pedagogo'],
  moduleName: 'Gestión de Tutores'
});
