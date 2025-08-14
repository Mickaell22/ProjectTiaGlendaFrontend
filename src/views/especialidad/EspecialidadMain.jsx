import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Tabs, Tab
} from '@mui/material';
import { 
  MedicalServices, Add
} from '@mui/icons-material';

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
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const EspecialidadMain = () => {
  // Estados principales
  const [especialidades, setEspecialidades] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    area: '',
    estado: 'activo'
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  // Estados de UI
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });

  // Hooks personalizados
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const { requireAuth } = useAuth();

  // Efectos
  useEffect(() => {
    if (requireAuth()) {
      fetchEspecialidades();
    }
  }, []);

  // Funciones de API
  const fetchEspecialidades = async () => {
    try {
      setLoading(true);
      const data = await EspecialidadService.getAll();
      setEspecialidades(data);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Manejadores del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const backendData = EspecialidadService.formatForBackend(formData);
    const validation = EspecialidadService.validateEspecialidadData(backendData);
    
    // Verificar nombre duplicado
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
      showError(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      area: '',
      estado: 'activo'
    });
    setEditingId(null);
    setErrors({});
  };

  // Manejadores de acciones
  const handleEdit = (item) => {
    setFormData({
      nombre: item.nombre,
      descripcion: item.descripcion || '',
      area: item.area,
      estado: item.estado
    });
    setEditingId(item.id);
    setActiveTab(1);
  };

  const handleDelete = (id) => {
    setConfirmDialog({ open: true, id });
  };

  const confirmDelete = async () => {
    try {
      await EspecialidadService.delete(confirmDialog.id);
      showSuccess('Especialidad eliminada correctamente');
      fetchEspecialidades();
    } catch (error) {
      showError(error.message);
    }
    setConfirmDialog({ open: false, id: null });
  };

  const handleViewDetail = (item) => {
    setDetailDialog({ open: true, data: item });
  };

  const handleAddNew = () => {
    resetForm();
    setActiveTab(1);
  };

  const handleCancel = () => {
    resetForm();
    setActiveTab(0);
  };

  // Configuración de tabs
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
      )
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
      )
    }
  ];

  if (loading) {
    return <LoadingSpinner message="Cargando especialidades..." fullHeight />;
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
              backgroundImage: 'linear-gradient(white, white), linear-gradient(270deg, #FF5722, #E91E63, #9C27B0, #673AB7)', 
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
                <MedicalServices sx={{ mr: 2, fontSize: 40 }} />
                Gestión de Especialidades
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Administración de especialidades médicas y áreas de tratamiento
              </Typography>
            </Box>
          </Paper>
        </Container>

        {/* Navegación por pestañas */}
        <Container maxWidth="xl">
          <Paper elevation={2} sx={{ mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)} 
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              {tabs.map((tab, index) => (
                <Tab 
                  key={index}
                  label={tab.label} 
                  icon={tab.icon} 
                />
              ))}
            </Tabs>
          </Paper>

          {/* Contenido de pestañas */}
          {tabs.map((tab, index) => (
            <TabPanel key={index} value={activeTab} index={index}>
              {tab.component}
            </TabPanel>
          ))}
        </Container>

        {/* Dialog de detalles */}
        <EspecialidadDetalles
          open={detailDialog.open}
          data={detailDialog.data}
          onClose={() => setDetailDialog({ open: false, data: null })}
          onEdit={handleEdit}
        />

        {/* Dialog de confirmación */}
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

export default EspecialidadMain;