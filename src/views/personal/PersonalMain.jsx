// src/views/personal/PersonalMainComponent.jsx
import React, { useState, useEffect } from 'react';
import { getModuleTheme } from 'src/config/moduleThemes';
import {
  Box, Container, Paper, Typography, Tabs, Tab, Dialog, DialogTitle, DialogContent, IconButton, useTheme
} from '@mui/material';
import {
  SupervisorAccount, Add, Folder, Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Servicios y hooks
import PersonalService from '../../services/personalService.js';
import PersonaService from '../../services/personaService.js';
import EspecialidadService from '../../services/especialidadService.js';
import CentroService from '../../services/centroService.js';
import useSnackbar from '../../hooks/useSnackbar.js';
import useAuth from '../../hooks/useAuth.js';
import { formatDateForInput } from '../../utils/dateUtils.js';

// Componentes compartidos
import CustomSnackbar from '../../components/shared/CustomSnackbar.jsx';
import LoadingSpinner from '../../components/shared/LoadingSpinner.jsx';
import ConfirmDialog from '../../components/shared/ConfirmDialog.jsx';
import ErrorBoundary from '../../components/shared/ErrorBoundary.jsx';

// HOC de protección de roles
import withRole from '../../hoc/withRole.jsx';

// Componentes modulares
import PersonalLista from './PersonalLista.jsx';
import PersonalFormulario from './PersonalFormulario.jsx';
import PersonalDetalles from './PersonalDetalles.jsx';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`personal-tabpanel-${index}`}
      aria-labelledby={`personal-tab-${index}`}
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
    id: `personal-tab-${index}`,
    'aria-controls': `personal-tabpanel-${index}`,
  };
}

const PersonalMainComponent = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Estados principales
  const [personal, setPersonal] = useState([]);
  const [personasDisponibles, setPersonasDisponibles] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [centros, setCentros] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  // Estados del formulario
  const [formData, setFormData] = useState({
    persona_id: '',
    id_especialidad: '',
    fecha_ingreso: '',
    fecha_salida: '',
    titulo_profesional: '',
    cargo: '',
    tipo_contrato: '',
    observaciones: '',
    id_centro: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [personaEncontrada, setPersonaEncontrada] = useState(null);

  // Estados de UI
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [showPersonForm, setShowPersonForm] = useState(false);

  // Hooks personalizados
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const { requireAuth } = useAuth();

  // Efectos
  useEffect(() => {
    if (requireAuth()) {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- carga intencional solo al montar/cambiar la clave
  }, []);

  // Funciones de API
  const fetchData = async () => {
    try {
      setLoading(true);
      const [personalData, personasData, especialidadesData, centrosData] = await Promise.all([
        PersonalService.getAll(),
        PersonaService.getAll(),
        EspecialidadService.getAll(),
        CentroService.getAll()
      ]);

      setPersonal(personalData);
      setPersonasDisponibles(personasData);
      setEspecialidades(especialidadesData);
      setCentros(centrosData);
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

  const handlePersonChange = (newValue) => {
    setPersonaEncontrada(newValue);
    setFormData(prev => {
      const newFormData = { ...prev, persona_id: newValue ? newValue.id : '' };
      return newFormData;
    });
    if (errors.persona_id) {
      setErrors(prev => ({ ...prev, persona_id: '' }));
    }
  };

  const validateForm = () => {
    // Validar con datos del frontend primero
    const validation = PersonalService.validatePersonalData(formData);

    // Verificar persona duplicada
    if (PersonalService.checkPersonaExists(personal, formData.persona_id, editingId)) {
      validation.errors.persona_id = 'Esta persona ya está registrada como personal';
      validation.isValid = false;
    }

    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async () => {
    
    if (!validateForm()) return;

    try {
      const backendData = PersonalService.formatForBackend(formData);

      if (editingId) {
        await PersonalService.update(editingId, backendData);
        showSuccess('Personal actualizado correctamente');
      } else {
        await PersonalService.create(backendData);
        showSuccess('Personal creado correctamente');
      }

      resetForm();
      fetchData();
      setActiveTab(0);
    } catch (error) {
      console.error('Error en submit:', error);
      showError(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      persona_id: '',
      id_especialidad: '',
      fecha_ingreso: '',
      fecha_salida: '',
      titulo_profesional: '',
      cargo: '',
      tipo_contrato: '',
      observaciones: '',
      id_centro: ''
    });
    setEditingId(null);
    setErrors({});
    setPersonaEncontrada(null);
  };

  // Manejadores de acciones
  const handleEdit = (item) => {
    
    setFormData({
      persona_id: item.id_persona || item.persona_id,
      id_especialidad: item.id_especialidad || '',
      fecha_ingreso: formatDateForInput(item.fecha_ingreso) || '',
      fecha_salida: formatDateForInput(item.fecha_salida) || '',
      titulo_profesional: item.titulo_profesional || '',
      cargo: item.cargo || '',
      tipo_contrato: item.tipo_contrato || '',
      observaciones: item.observaciones || '',
      id_centro: item.id_centro || ''
    });

    const persona = personasDisponibles.find(p => p.id === (item.id_persona || item.persona_id));
    if (persona) setPersonaEncontrada(persona);

    setEditingId(item.id);
    setActiveTab(1);
  };

  const handleDelete = (id) => {
    setConfirmDialog({ open: true, id });
  };

  const confirmDelete = async () => {
    try {
      await PersonalService.delete(confirmDialog.id);
      showSuccess('Personal eliminado correctamente');
      fetchData();
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

  const handleViewDocuments = (item) => {
    navigate(`/personal/${item.id}/documentos`);
  };

  // Configuración de tabs
  const tabs = [
    {
      label: 'Lista',
      icon: <SupervisorAccount />,
      component: (
        <PersonalLista
          personal={personal}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetail={handleViewDetail}
          onViewDocuments={handleViewDocuments}
          onAddNew={handleAddNew}
        />
      )
    },
    {
      label: editingId ? 'Editar' : 'Crear',
      icon: <Add />,
      component: (
        <PersonalFormulario
          formData={formData}
          errors={errors}
          editingId={editingId}
          personasDisponibles={personasDisponibles}
          especialidades={especialidades}
          centros={centros}
          personaEncontrada={personaEncontrada}
          onChange={handleChange}
          onPersonChange={handlePersonChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          showPersonForm={showPersonForm}
          setShowPersonForm={setShowPersonForm}
        />
      )
    }
  ];

  if (loading) {
    return <LoadingSpinner message="Cargando personal..." fullHeight />;
  }

  return (
    <ErrorBoundary>
      <Box>
        {/* Header principal con borde arcoíris (mismo tamaño/estilo que UsuarioMain) */}
        <Container maxWidth="xl" sx={{ py: 2 }}>
          <Paper
            elevation={4}
            sx={{
              borderRadius: 3,
              backgroundColor: 'background.paper',
              mb: 4,
              overflow: 'hidden',
              border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : '4px solid transparent',
              backgroundImage: theme.palette.mode === 'dark' ? 'none' : `linear-gradient(${theme.palette.background.paper}, ${theme.palette.background.paper}), linear-gradient(270deg, ${getModuleTheme('personal').colors.join(', ')})`,
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
                <SupervisorAccount sx={{ mr: 2, fontSize: 40 }} />
                Gestión de Personal
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Administración del personal médico y de apoyo del centro
              </Typography>

              {/* Tabs dentro del mismo Paper (igual a UsuarioMain) */}
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                aria-label="Pestañas de gestión de personal"
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

        {/* Contenido de pestañas */}
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={activeTab} index={index}>
            {tab.component}
          </TabPanel>
        ))}

        {/* Dialog de detalles */}
        <PersonalDetalles
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
          title="¿Eliminar personal?"
          message="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este miembro del personal?"
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

// Protección de acceso: Solo administradores
export default withRole(PersonalMainComponent, {
  allowedRoles: ['administrador'],
  moduleName: 'Gestión de Personal'
});
