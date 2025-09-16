// src/views/especialidades/EspecialidadMain.jsx
import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, Tabs, Tab, useTheme } from '@mui/material';
import { MedicalServices, Add } from '@mui/icons-material';

// Servicios y hooks
import EspecialidadService from '../../services/especialidadService.js';
import useSnackbar from '../../hooks/useSnackbar.js';
import useAuth from '../../hooks/useAuth.js';

// Componentes compartidos
import CustomSnackbar from '../../components/shared/CustomSnackbar.jsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import ConfirmDialog from '../../components/shared/ConfirmDialog.jsx';
import ErrorBoundary from '../../components/shared/ErrorBoundary.jsx';

// Componentes modulares
import EspecialidadLista from './EspecialidadLista.jsx';
import EspecialidadFormulario from './EspecialidadFormulario.jsx';
import EspecialidadDetalles from './EspecialidadDetalles.jsx';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`especialidad-tabpanel-${index}`}
      aria-labelledby={`especialidad-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `especialidad-tab-${index}`,
    'aria-controls': `especialidad-tabpanel-${index}`,
  };
}

const EspecialidadMain = () => {
  const theme = useTheme();
  // Estados principales
  const [especialidades, setEspecialidades] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  // Form (⚠️ mantenemos el campo `estado`)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    area: '',
    estado: 'activo',
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  // UI
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

  // Hooks
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const { requireAuth } = useAuth();

  useEffect(() => {
    if (requireAuth()) fetchEspecialidades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carga
  const fetchEspecialidades = async () => {
    try {
      setLoading(true);
      const data = await EspecialidadService.getAll();
      setEspecialidades(data);
    } catch (error) {
      showError(error?.message || 'Error al cargar especialidades');
    } finally {
      setLoading(false);
    }
  };

  // Form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const backendData = EspecialidadService.formatForBackend(formData);
    const validation = EspecialidadService.validateEspecialidadData(backendData);

    if (EspecialidadService.checkNombreExists(especialidades, formData.nombre, editingId)) {
      validation.errors.nombre = 'Esta especialidad ya está registrada';
      validation.isValid = false;
    }

    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const backendData = EspecialidadService.formatForBackend(formData);
      if (editingId) {
        await EspecialidadService.update(editingId, backendData);
        showSuccess('Especialidad actualizada correctamente');
      } else {
        await EspecialidadService.create(backendData);
        showSuccess('Especialidad creada correctamente');
      }
      resetForm();
      fetchEspecialidades();
      setActiveTab(0);
    } catch (error) {
      showError(error?.message || 'Error al guardar especialidad');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      area: '',
      estado: 'activo',
    });
    setEditingId(null);
    setErrors({});
  };

  // Acciones lista
  const handleEdit = (item) => {
    setFormData({
      nombre: item.nombre,
      descripcion: item.descripcion || '',
      area: item.area,
      estado: item.estado, // ✅ se mantiene
    });
    setEditingId(item.id);
    setActiveTab(1);
  };

  const handleDelete = (id) => setConfirmDialog({ open: true, id });

  const confirmDelete = async () => {
    try {
      await EspecialidadService.delete(confirmDialog.id);
      showSuccess('Especialidad eliminada correctamente');
      fetchEspecialidades();
    } catch (error) {
      showError(error?.message || 'Error al eliminar especialidad');
    }
    setConfirmDialog({ open: false, id: null });
  };

  const handleViewDetail = (item) => setDetailDialog({ open: true, data: item });

  const handleAddNew = () => {
    resetForm();
    setActiveTab(1);
  };

  const handleCancel = () => {
    resetForm();
    setActiveTab(0);
  };

  // Tabs (estilo unificado como en los otros módulos/listas)
  const tabs = [
    {
      label: 'Lista',
      icon: <MedicalServices />,
      component: (
        <EspecialidadLista
          especialidades={especialidades}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetail={handleViewDetail}
          onAddNew={handleAddNew}
        />
      ),
    },
    {
      label: editingId ? 'Editar' : 'Crear',
      icon: <Add />,
      component: (
        <EspecialidadFormulario
          formData={formData}
          errors={errors}
          editingId={editingId}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      ),
    },
  ];

  if (loading) return <LoadingSpinner message="Cargando especialidades..." fullHeight />;

  return (
    <ErrorBoundary>
      <Box>
        {/* Header con tabs integrados y estilo del resto de *listas* */}
        <Container maxWidth="xl" sx={{ py: 2 }}>
          <Paper
            elevation={4}
            sx={{
              borderRadius: 3,
              backgroundColor: 'background.paper',
              mb: 4,
              overflow: 'hidden',
              border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : '4px solid transparent',
              backgroundImage: theme.palette.mode === 'dark' ? 'none' : `linear-gradient(${theme.palette.background.paper}, ${theme.palette.background.paper}), linear-gradient(270deg, #FF5722, #E91E63, #9C27B0, #673AB7)`,
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              animation: theme.palette.mode === 'dark' ? 'none' : 'rainbow 5s linear infinite',
              '@keyframes rainbow': {
                '0%': { backgroundPosition: '0% 50%' },
                '100%': { backgroundPosition: '100% 50%' },
              },
              backgroundSize: '300% 100%',
              maxWidth: '90%',
              mx: 'auto',
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
                <MedicalServices sx={{ mr: 2, fontSize: 40 }} />
                Gestión de Especialidades
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Administración de especialidades médicas y áreas de tratamiento
              </Typography>

              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                aria-label="Pestañas de gestión de especialidades"
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
                    '&.Mui-selected': { color: 'primary.main', fontWeight: 600 },
                  },
                  '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
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
                      gap: 1,
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

        {/* Detalles */}
        <EspecialidadDetalles
          open={detailDialog.open}
          data={detailDialog.data}
          onClose={() => setDetailDialog({ open: false, data: null })}
          onEdit={handleEdit}
        />

        {/* Confirmación */}
        <ConfirmDialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ open: false, id: null })}
          onConfirm={confirmDelete}
          title="¿Eliminar especialidad?"
          message="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar esta especialidad?"
          confirmText="Eliminar"
          confirmColor="error"
          severity="error"
        />

        {/* Snackbar */}
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

export default EspecialidadMain;
