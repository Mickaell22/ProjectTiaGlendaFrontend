import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Tabs, Tab, useTheme
} from '@mui/material';
import { 
  AdminPanelSettings, PersonAdd, Group, VpnKey, Visibility, BarChart
} from '@mui/icons-material';

import UsuarioLista from './UsuarioLista';
import UsuarioFormulario from './UsuarioFormulario';
import UsuarioDetalles from './UsuarioDetalles';
import UsuarioPassword from './UsuarioPassword';
import UsuarioRoles from './UsuarioRoles';

// Servicios y hooks
import UsuarioService from '../../services/usuarioService.js';
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
      id={`usuario-tabpanel-${index}`}
      aria-labelledby={`usuario-tab-${index}`}
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
    id: `usuario-tab-${index}`,
    'aria-controls': `usuario-tabpanel-${index}`,
  };
}

const UsuarioMain = () => {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const [usuarios, setUsuarios] = useState([]);
  const [personasDisponibles, setPersonasDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingData, setEditingData] = useState(null);
  
  // Estados para diálogos
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });
  const [passwordDialog, setPasswordDialog] = useState({ open: false, userId: null, userName: null });
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
      const [usuariosData, personasData] = await Promise.all([
        UsuarioService.getAll(),
        PersonaService.getAvailableForUsers()
      ]);
      
      setUsuarios(usuariosData);
      setPersonasDisponibles(personasData);
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

  // Manejadores para UsuarioLista
  const handleNewUser = () => {
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
      await UsuarioService.delete(confirmDialog.id);
      showSuccess('Usuario eliminado correctamente');
      fetchData();
    } catch (error) {
      showError(error.message);
    }
    setConfirmDialog({ open: false, id: null });
  };

  const handleViewDetail = (item) => {
    setDetailDialog({ open: true, data: item });
  };

  const handleChangePassword = (userId, userName = null) => {
    const user = usuarios.find(u => u.id === userId);
    setPasswordDialog({ 
      open: true, 
      userId, 
      userName: userName || (user ? user.nombre_usuario : '') 
    });
  };

  // Manejadores para UsuarioFormulario
  const handleFormSubmit = async (backendData, isEditing) => {
    try {
      if (isEditing && editingData) {
        // En edición, no enviamos la contraseña a menos que sea nueva
        const { contrasenia, ...updateData } = backendData;
        await UsuarioService.update(editingData.id, updateData);
        showSuccess('Usuario actualizado correctamente');
      } else {
        await UsuarioService.create(backendData);
        showSuccess('Usuario creado correctamente');
      }
      
      setEditingData(null);
      fetchData();
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

  // Manejador para cuando se cambia la contraseña
  const handlePasswordChanged = () => {
    fetchData(); // Refrescar datos si es necesario
  };

  const tabs = [
    {
      label: 'Lista',
      icon: <AdminPanelSettings />,
      component: (
        <UsuarioLista
          usuarios={usuarios}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetail={handleViewDetail}
          onChangePassword={handleChangePassword}
          onNewUser={handleNewUser}
          loading={loading}
        />
      )
    },
    {
      label: editingData ? 'Editar' : 'Crear',
      icon: <PersonAdd />,
      component: (
        <UsuarioFormulario
          editingData={editingData}
          personasDisponibles={personasDisponibles}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={loading}
        />
      )
    },
    {
      label: 'Roles',
      icon: <Group />,
      component: (
        <UsuarioRoles
          usuarios={usuarios}
        />
      )
    }
  ];

  if (loading) {
    return <LoadingSpinner message="Cargando datos de usuarios..." fullHeight />;
  }

  return (
    <ErrorBoundary>
      <Box>
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
              <Typography variant="h4" fontWeight="bold" color="text.primary" display="flex" alignItems="center" mb={2}>
                <AdminPanelSettings sx={{ mr: 2, fontSize: 40 }} />
                Gestión de Usuarios
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Administración completa de usuarios del sistema, roles, permisos y seguridad
              </Typography>

              <Tabs 
                value={value} 
                onChange={handleChange} 
                aria-label="Pestañas de gestión de usuarios"
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
        <UsuarioDetalles
          open={detailDialog.open}
          onClose={() => setDetailDialog({ open: false, data: null })}
          userData={detailDialog.data}
          onEdit={handleEdit}
          onChangePassword={handleChangePassword}
        />

        <UsuarioPassword
          open={passwordDialog.open}
          onClose={() => setPasswordDialog({ open: false, userId: null, userName: null })}
          userId={passwordDialog.userId}
          userName={passwordDialog.userName}
          onPasswordChanged={handlePasswordChanged}
        />

        <ConfirmDialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ open: false, id: null })}
          onConfirm={confirmDelete}
          title="¿Eliminar usuario?"
          message="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este usuario del sistema?"
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

export default UsuarioMain;