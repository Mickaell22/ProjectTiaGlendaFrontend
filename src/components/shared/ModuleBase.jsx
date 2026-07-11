// src/components/shared/ModuleBase.jsx
// Componente base para módulos con estructura común

import React, { useState, useEffect } from 'react';
import { Box, Container, Card, CardContent, Typography, Chip } from '@mui/material';
import { PersonAdd } from '@mui/icons-material';

import ModernHeader from './ModernHeader';
import ModernTabs from './ModernTabs';
import SearchAndFilters from './SearchAndFilters';
import ModernTable from './ModernTable';
import ErrorBoundary from './ErrorBoundary';
import LoadingSpinner from './LoadingSpinner';
import CustomSnackbar from './CustomSnackbar';
import ConfirmDialog from './ConfirmDialog';
import useSnackbar from '../../hooks/useSnackbar';
import useAuth from '../../hooks/useAuth';

const ModuleBase = ({
  // Configuración del módulo
  title,
  icon,
  headerColors,
  
  // Servicios
  service,
  
  // Datos
  data = [],
  loading = false,
  
  // Tabla
  columns,
  renderCell,
  
  // Búsqueda y filtros
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  
  // Acciones
  onEdit,
  onView,
  customActions = [],
  
  // Formulario
  FormComponent,
  formProps = {},
  
  // Paginación
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  
  // Estados
  activeTab = 0,
  onTabChange,
  editingId = null,
  
  // Configuración adicional
  addNewText = "Nuevo",
  deleteTitle = "¿Eliminar elemento?",
  deleteMessage = "Esta acción no se puede deshacer. ¿Estás seguro?",
  
  // Children para contenido personalizado
  children
}) => {
  // Estados locales
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  
  // Hooks
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const { requireAuth } = useAuth();

  // Verificar autenticación
  useEffect(() => {
    requireAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- carga intencional solo al montar/cambiar la clave
  }, []);

  // Función para eliminar
  const handleDelete = (id) => {
    setConfirmDialog({ open: true, id });
  };

  const confirmDelete = async () => {
    try {
      await service.delete(confirmDialog.id);
      showSuccess('Elemento eliminado correctamente');
      // Refetch data if callback provided
      if (window.refetchData) {
        window.refetchData();
      }
    } catch (error) {
      showError(error.message);
    }
    setConfirmDialog({ open: false, id: null });
  };

  // Datos filtrados
  const filteredData = data || [];

  // Configuración de pestañas
  const tabs = [
    {
      label: `Lista de ${title}`,
      icon: icon,
      content: (
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2} display="flex" alignItems="center">
              {icon && React.createElement(icon, { sx: { mr: 1 } })}
              Lista de {title}
              <Chip 
                label={`${filteredData.length} elemento${filteredData.length !== 1 ? 's' : ''}`} 
                color="primary" 
                size="small" 
                sx={{ ml: 2 }}
              />
            </Typography>
            
            <SearchAndFilters
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
              searchPlaceholder={searchPlaceholder}
              filters={filters}
              onAddNew={() => onTabChange(1)}
              addNewText={addNewText}
              addNewIcon={<PersonAdd />}
            />

            <ModernTable
              columns={columns}
              data={filteredData}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={onPageChange}
              onRowsPerPageChange={onRowsPerPageChange}
              onView={onView}
              onEdit={onEdit}
              onDelete={handleDelete}
              renderCell={renderCell}
              customActions={customActions}
            />
          </CardContent>
        </Card>
      )
    },
    {
      label: editingId ? `Editar ${title}` : `Nuevo ${title}`,
      icon: <PersonAdd />,
      content: FormComponent ? <FormComponent {...formProps} /> : null
    }
  ];

  // Loading state
  if (loading) {
    return <LoadingSpinner message={`Cargando ${title.toLowerCase()}...`} fullHeight />;
  }

  return (
    <ErrorBoundary>
      <Box p={2}>
        <Container maxWidth="xl">
          {/* Header */}
          <ModernHeader 
            title={`Gestión de ${title}`}
            icon={icon}
            colors={headerColors}
          />

          {/* Contenido personalizado o pestañas */}
          {children || (
            <ModernTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={onTabChange}
            />
          )}

          {/* Dialog de confirmación */}
          <ConfirmDialog
            open={confirmDialog.open}
            onClose={() => setConfirmDialog({ open: false, id: null })}
            onConfirm={confirmDelete}
            title={deleteTitle}
            message={deleteMessage}
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
        </Container>
      </Box>
    </ErrorBoundary>
  );
};

export default ModuleBase;