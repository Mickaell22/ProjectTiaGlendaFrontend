// src/views/centro/CentroMain.jsx
import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, Tabs, Tab, useTheme } from '@mui/material';
import { Business, Add } from '@mui/icons-material';

// Servicios y hooks
import CentroService from '../../services/centroService.js';
import useSnackbar from '../../hooks/useSnackbar.js';
import useAuth from '../../hooks/useAuth.js';

// Componentes compartidos
import CustomSnackbar from '../../components/shared/CustomSnackbar.jsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import ConfirmDialog from '../../components/shared/ConfirmDialog.jsx';
import ErrorBoundary from '../../components/shared/ErrorBoundary.jsx';

// HOC de proteccion de roles
import withRole from '../../hoc/withRole.jsx';

// Componentes modulares
import CentroLista from './CentroLista.jsx';
import CentroFormulario from './CentroFormulario.jsx';
import CentroDetalles from './CentroDetalles.jsx';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`centro-tabpanel-${index}`}
      aria-labelledby={`centro-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `centro-tab-${index}`,
    'aria-controls': `centro-tabpanel-${index}`,
  };
}

const CentroMain = () => {
  const theme = useTheme();
  // Estados principales
  const [centros, setCentros] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  // Form
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    direccion: '',
    telefono: '',
    email: '',
    turno_principal: 'mixto',
    horario_apertura: '07:00',
    horario_cierre: '18:00',
    observaciones: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  // UI
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, action: 'delete' });

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
      const centrosData = await CentroService.getAll();
      setCentros(centrosData);
    } catch (error) {
      showError(error?.message || 'Error al cargar centros');
    } finally {
      setLoading(false);
    }
  };

  const fetchCentros = async () => {
    try {
      const data = await CentroService.getAll();
      setCentros(data);
    } catch (error) {
      showError(error?.message || 'Error al cargar centros');
    }
  };

  // Form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const backendData = CentroService.formatForBackend(formData);
    const validation = CentroService.validateCentroData(backendData);

    // Verificar duplicados de nombre
    const nombreDuplicado = centros.some(
      (c) => c.nombre?.toLowerCase() === formData.nombre?.trim()?.toLowerCase() && c.id !== editingId
    );
    if (nombreDuplicado) {
      validation.errors.nombre = 'Ya existe un centro con este nombre';
      validation.isValid = false;
    }

    // Verificar duplicados de codigo
    const codigoDuplicado = centros.some(
      (c) => c.codigo?.toLowerCase() === formData.codigo?.trim()?.toLowerCase() && c.id !== editingId
    );
    if (codigoDuplicado) {
      validation.errors.codigo = 'Ya existe un centro con este codigo';
      validation.isValid = false;
    }

    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const backendData = CentroService.formatForBackend(formData);
      if (editingId) {
        await CentroService.update(editingId, backendData);
        showSuccess('Centro actualizado correctamente');
      } else {
        await CentroService.create(backendData);
        showSuccess('Centro creado correctamente');
      }
      resetForm();
      fetchCentros();
      setActiveTab(0);
    } catch (error) {
      showError(error?.message || 'Error al guardar centro');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      codigo: '',
      direccion: '',
      telefono: '',
      email: '',
      turno_principal: 'mixto',
      horario_apertura: '07:00',
      horario_cierre: '18:00',
      observaciones: '',
    });
    setEditingId(null);
    setErrors({});
  };

  // Acciones lista
  const handleEdit = (item) => {
    setFormData({
      nombre: item.nombre || '',
      codigo: item.codigo || '',
      direccion: item.direccion || '',
      telefono: item.telefono || '',
      email: item.email || '',
      turno_principal: item.turno_principal || 'mixto',
      horario_apertura: item.horario_apertura || '07:00',
      horario_cierre: item.horario_cierre || '18:00',
      observaciones: item.observaciones || '',
    });
    setEditingId(item.id);
    setActiveTab(1);
  };

  const handleDelete = (id) => setConfirmDialog({ open: true, id, action: 'delete' });

  const handleReactivar = (id) => setConfirmDialog({ open: true, id, action: 'reactivar' });

  const confirmAction = async () => {
    try {
      if (confirmDialog.action === 'delete') {
        await CentroService.delete(confirmDialog.id);
        showSuccess('Centro desactivado correctamente');
      } else if (confirmDialog.action === 'reactivar') {
        await CentroService.reactivar(confirmDialog.id);
        showSuccess('Centro reactivado correctamente');
      }
      fetchCentros();
    } catch (error) {
      showError(error?.message || `Error al ${confirmDialog.action === 'delete' ? 'desactivar' : 'reactivar'} centro`);
    }
    setConfirmDialog({ open: false, id: null, action: 'delete' });
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

  // Tabs
  const tabs = [
    {
      label: 'Lista',
      icon: <Business />,
      component: (
        <CentroLista
          centros={centros}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReactivar={handleReactivar}
          onViewDetail={handleViewDetail}
          onAddNew={handleAddNew}
        />
      ),
    },
    {
      label: editingId ? 'Editar' : 'Crear',
      icon: <Add />,
      component: (
        <CentroFormulario
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

  if (loading) return <LoadingSpinner message="Cargando centros..." fullHeight />;

  return (
    <ErrorBoundary>
      <Box>
        {/* Header con tabs integrados */}
        <Container maxWidth="xl" sx={{ py: 2 }}>
          <Paper
            elevation={4}
            sx={{
              borderRadius: 3,
              backgroundColor: 'background.paper',
              mb: 4,
              overflow: 'hidden',
              border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : '4px solid transparent',
              backgroundImage: theme.palette.mode === 'dark' ? 'none' : `linear-gradient(${theme.palette.background.paper}, ${theme.palette.background.paper}), linear-gradient(270deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.warning.main}, ${theme.palette.success.main})`,
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
                <Business sx={{ mr: 2, fontSize: 40 }} />
                Gestion de Centros
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Administracion de centros de trabajo del sistema
              </Typography>

              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                aria-label="Pestanas de gestion de centros"
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

        {/* Contenido de pestanas */}
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={activeTab} index={index}>
            {tab.component}
          </TabPanel>
        ))}

        {/* Detalles */}
        <CentroDetalles
          open={detailDialog.open}
          data={detailDialog.data}
          onClose={() => setDetailDialog({ open: false, data: null })}
          onEdit={handleEdit}
        />

        {/* Confirmacion */}
        <ConfirmDialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ open: false, id: null, action: 'delete' })}
          onConfirm={confirmAction}
          title={confirmDialog.action === 'delete' ? 'Desactivar centro?' : 'Reactivar centro?'}
          message={
            confirmDialog.action === 'delete'
              ? 'El centro sera marcado como inactivo. No se podra desactivar si tiene usuarios, personal o pacientes activos asociados.'
              : 'El centro sera marcado como activo nuevamente.'
          }
          confirmText={confirmDialog.action === 'delete' ? 'Desactivar' : 'Reactivar'}
          confirmColor={confirmDialog.action === 'delete' ? 'error' : 'success'}
          severity={confirmDialog.action === 'delete' ? 'error' : 'info'}
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

// Proteccion de acceso: Solo administradores
export default withRole(CentroMain, {
  allowedRoles: ['administrador'],
  moduleName: 'Gestion de Centros'
});
