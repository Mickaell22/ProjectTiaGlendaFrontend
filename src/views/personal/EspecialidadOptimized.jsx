// src/views/personal/EspecialidadOptimized.jsx
// Módulo de especialidades optimizado

import React, { useState, useEffect } from 'react';
import { Grid, Typography, TextField, Button, Stack, MenuItem, Box, Avatar, Chip } from '@mui/material';
import {
  Work,
  Add,
  Edit,
  LocalHospital,
  School,
  AccountBox
} from '@mui/icons-material';

import EspecialidadService from '../../services/especialidadService.js';
import ModuleBase from '../../components/shared/ModuleBase';
import FormSection from '../../components/shared/FormSection';
import StatusChip from '../../components/shared/StatusChip';
import DetailDialog from '../../components/shared/DetailDialog';

const EspecialidadOptimized = () => {
  // Estados principales
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  
  // Estados de búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState('');
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    area: '',
    estado: 'activo'
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  
  // Estados de UI
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });

  useEffect(() => {
    fetchEspecialidades();
    window.refetchData = fetchEspecialidades;
  }, []);

  const fetchEspecialidades = async () => {
    try {
      setLoading(true);
      const data = await EspecialidadService.getAll();
      setEspecialidades(data);
    } catch (error) {
      console.error('Error al cargar especialidades:', error);
    } finally {
      setLoading(false);
    }
  };

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
    
    if (EspecialidadService.checkNombreExists(especialidades, formData.nombre, editingId)) {
      validation.errors.nombre = 'Esta especialidad ya existe';
      validation.isValid = false;
    }

    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const backendData = EspecialidadService.formatForBackend(formData);
      
      if (editingId) {
        await EspecialidadService.update(editingId, backendData);
      } else {
        await EspecialidadService.create(backendData);
      }
      
      resetForm();
      fetchEspecialidades();
      setActiveTab(0);
    } catch (error) {
      console.error('Error al guardar especialidad:', error);
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', area: '', estado: 'activo' });
    setEditingId(null);
    setErrors({});
  };

  const handleEdit = (item) => {
    setFormData({
      nombre: item.nombre,
      area: item.area,
      estado: item.estado
    });
    setEditingId(item.id);
    setActiveTab(1);
  };

  const getAreaIcon = (area) => {
    return area === 'terapeutico' ? <LocalHospital /> : <School />;
  };

  // Configuración de columnas
  const columns = [
    { id: 'especialidad', label: 'Especialidad', field: 'nombre' },
    { id: 'area', label: 'Área', field: 'area' },
    { id: 'estado', label: 'Estado', field: 'estado' },
    { id: 'fechas', label: 'Fechas', field: 'fecha_creacion' }
  ];

  const renderCell = (row, column) => {
    switch (column.id) {
      case 'especialidad':
        const areaColor = EspecialidadService.getAreaColor(row.area);
        return (
          <Box display="flex" alignItems="center">
            <Avatar sx={{ mr: 2, bgcolor: `${areaColor}.light` }}>
              {getAreaIcon(row.area)}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="bold">
                {row.nombre}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ID: {row.id}
              </Typography>
            </Box>
          </Box>
        );
      case 'area':
        return (
          <Chip 
            label={EspecialidadService.getAreaLabel(row.area)} 
            color={EspecialidadService.getAreaColor(row.area)}
            size="small"
            icon={getAreaIcon(row.area)}
          />
        );
      case 'estado':
        return (
          <StatusChip 
            status={row.estado}
            statusInfo={EspecialidadService.getEstadoInfo(row.estado)}
          />
        );
      case 'fechas':
        return (
          <Box>
            <Typography variant="body2" fontSize="0.75rem">
              <strong>Creado:</strong> {EspecialidadService.formatDate(row.fecha_creacion)}
            </Typography>
            <Typography variant="body2" fontSize="0.75rem" color="text.secondary">
              <strong>Modificado:</strong> {EspecialidadService.formatDate(row.fecha_modificacion)}
            </Typography>
          </Box>
        );
      default:
        return row[column.field];
    }
  };

  // Datos filtrados
  let filteredEspecialidades = EspecialidadService.filterEspecialidades(
    EspecialidadService.filterByArea(especialidades, filterArea),
    searchTerm
  );

  // Configuración de filtros
  const filters = [
    {
      type: 'select',
      label: 'Área',
      value: filterArea,
      onChange: setFilterArea,
      options: EspecialidadService.getAreas(),
      width: 3
    }
  ];

  // Componente de formulario
  const FormComponent = () => (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <FormSection title="Información de la Especialidad" icon={Work}>
          <Grid item xs={12}>
            <Typography variant="body1" mb={1}>Nombre de la Especialidad: *</Typography>
            <TextField
              fullWidth
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              error={!!errors.nombre}
              helperText={errors.nombre}
              placeholder="Ej: Terapia Ocupacional, Psicopedagogía, etc."
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body1" mb={1}>Área: *</Typography>
            <TextField
              select
              fullWidth
              name="area"
              value={formData.area}
              onChange={handleChange}
              error={!!errors.area}
              helperText={errors.area}
            >
              <MenuItem value="">Seleccione un área</MenuItem>
              {EspecialidadService.getAreas().map((area) => (
                <MenuItem key={area.value} value={area.value}>
                  <Box display="flex" alignItems="center">
                    {getAreaIcon(area.value)}
                    <Typography sx={{ ml: 1 }}>{area.label}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body1" mb={1}>Estado:</Typography>
            <TextField
              select
              fullWidth
              name="estado"
              value={formData.estado}
              onChange={handleChange}
            >
              <MenuItem value="activo">Activo</MenuItem>
              <MenuItem value="inactivo">Inactivo</MenuItem>
            </TextField>
          </Grid>
        </FormSection>

        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
            <Button 
              variant="contained" 
              type="submit" 
              color="primary"
              startIcon={editingId ? <Edit /> : <Add />}
              size="large"
              disabled={!formData.nombre.trim() || !formData.area}
            >
              {editingId ? 'Actualizar Especialidad' : 'Crear Especialidad'}
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => {
                resetForm();
                setActiveTab(0);
              }}
              color="secondary"
              size="large"
            >
              Cancelar
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </form>
  );

  return (
    <>
      <ModuleBase
        title="Especialidades"
        icon={Work}
        headerColors={['#FF9800', '#2196F3', '#4CAF50', '#9C27B0']}
        service={EspecialidadService}
        data={filteredEspecialidades}
        loading={loading}
        columns={columns}
        renderCell={renderCell}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por nombre de especialidad"
        filters={filters}
        onEdit={handleEdit}
        onView={(item) => setDetailDialog({ open: true, data: item })}
        FormComponent={FormComponent}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        editingId={editingId}
        addNewText="Nueva Especialidad"
        deleteTitle="¿Eliminar especialidad?"
        deleteMessage="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar esta especialidad?"
      />

      {/* Dialog de detalles */}
      <DetailDialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, data: null })}
        title="Detalles de la Especialidad"
        icon={Work}
        data={detailDialog.data}
        onEdit={handleEdit}
        maxWidth="md"
      >
        {detailDialog.data && (
          <>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="primary">Información General</Typography>
              <Typography variant="body2">
                <strong>Nombre:</strong> {detailDialog.data.nombre}
              </Typography>
              <Typography variant="body2">
                <strong>ID:</strong> {detailDialog.data.id}
              </Typography>
              <Box mt={1}>
                <Chip 
                  label={EspecialidadService.getAreaLabel(detailDialog.data.area)} 
                  color={EspecialidadService.getAreaColor(detailDialog.data.area)}
                  icon={getAreaIcon(detailDialog.data.area)}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="primary">Estado y Fechas</Typography>
              <Box mb={1}>
                <StatusChip 
                  status={detailDialog.data.estado}
                  statusInfo={EspecialidadService.getEstadoInfo(detailDialog.data.estado)}
                />
              </Box>
              <Typography variant="body2">
                <strong>Fecha de creación:</strong> {EspecialidadService.formatDate(detailDialog.data.fecha_creacion)}
              </Typography>
              <Typography variant="body2">
                <strong>Última modificación:</strong> {EspecialidadService.formatDate(detailDialog.data.fecha_modificacion)}
              </Typography>
            </Grid>
          </>
        )}
      </DetailDialog>
    </>
  );
};

export default EspecialidadOptimized;