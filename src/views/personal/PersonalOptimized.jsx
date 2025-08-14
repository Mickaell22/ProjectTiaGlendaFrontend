// src/views/personal/PersonalOptimized.jsx
// Módulo de personal optimizado

import React, { useState, useEffect } from 'react';
import { Grid, Typography, TextField, Button, Stack, MenuItem, Box, Avatar } from '@mui/material';
import {
  SupervisorAccount,
  PersonAdd,
  Edit,
  Person,
  Phone,
  Email,
  Work,
  AccountBox
} from '@mui/icons-material';

import PersonalService from '../../services/personalService.js';
import PersonaService from '../../services/personaService.js';
import EspecialidadService from '../../services/especialidadService.js';
import ModuleBase from '../../components/shared/ModuleBase';
import FormSection from '../../components/shared/FormSection';
import StatusChip from '../../components/shared/StatusChip';
import DetailDialog from '../../components/shared/DetailDialog';
import PersonSelector from '../../components/shared/PersonSelector';

const PersonalOptimized = () => {
  // Estados principales
  const [personal, setPersonal] = useState([]);
  const [personasDisponibles, setPersonasDisponibles] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  
  // Estados de búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState('');
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    persona_id: '',
    titulo_profesional: '',
    estado: 'activo'
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedPerson, setSelectedPerson] = useState(null);
  
  // Estados de UI
  const [detailDialog, setDetailDialog] = useState({ open: false, data: null });

  useEffect(() => {
    fetchData();
    window.refetchData = fetchData;
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [personalData, personasData, especialidadesData] = await Promise.all([
        PersonalService.getAll().catch(() => []),
        PersonaService.getAll().catch(() => []),
        EspecialidadService.getAll().catch(() => [])
      ]);
      
      setPersonal(personalData);
      setPersonasDisponibles(personasData);
      setEspecialidades(especialidadesData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
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
    const backendData = PersonalService.formatForBackend(formData);
    const validation = PersonalService.validatePersonalData(backendData);
    
    if (PersonalService.checkPersonaExists(personal, formData.persona_id, editingId)) {
      validation.errors.persona_id = 'Esta persona ya está registrada como personal';
      validation.isValid = false;
    }

    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const backendData = PersonalService.formatForBackend(formData);
      
      if (editingId) {
        await PersonalService.update(editingId, backendData);
      } else {
        await PersonalService.create(backendData);
      }
      
      resetForm();
      fetchData();
      setActiveTab(0);
    } catch (error) {
      console.error('Error al guardar personal:', error);
    }
  };

  const resetForm = () => {
    setFormData({ persona_id: '', titulo_profesional: '', estado: 'activo' });
    setEditingId(null);
    setErrors({});
    setSelectedPerson(null);
  };

  const handleEdit = (item) => {
    setFormData({
      persona_id: item.persona_id,
      titulo_profesional: item.titulo_profesional || '',
      estado: item.estado
    });
    
    const persona = personasDisponibles.find(p => p.id === item.persona_id);
    if (persona) setSelectedPerson(persona);
    
    setEditingId(item.id);
    setActiveTab(1);
  };

  const handlePersonaSelect = (persona) => {
    setSelectedPerson(persona);
    setFormData(prev => ({ ...prev, persona_id: persona.id }));
    if (errors.persona_id) {
      setErrors(prev => ({ ...prev, persona_id: '' }));
    }
  };

  const handlePersonaClear = () => {
    setSelectedPerson(null);
    setFormData(prev => ({ ...prev, persona_id: '' }));
  };

  // Configuración de columnas
  const columns = [
    { id: 'empleado', label: 'Empleado', field: 'nombre' },
    { id: 'titulo', label: 'Título Profesional', field: 'titulo_profesional' },
    { id: 'especialidades', label: 'Especialidades', field: 'especialidades' },
    { id: 'contacto', label: 'Contacto', field: 'telefono' },
    { id: 'estado', label: 'Estado', field: 'estado' }
  ];

  const renderCell = (row, column) => {
    switch (column.id) {
      case 'empleado':
        return (
          <Box display="flex" alignItems="center">
            <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
              <Person />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="bold">
                {PersonalService.getFullName(row)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.cedula}
              </Typography>
            </Box>
          </Box>
        );
      case 'titulo':
        return (
          <Typography variant="body2" fontWeight="bold">
            {row.titulo_profesional}
          </Typography>
        );
      case 'especialidades':
        return (
          <Box>
            {row.especialidades && row.especialidades.length > 0 ? (
              row.especialidades.map((esp, index) => (
                <span key={index} style={{ marginRight: '4px', marginBottom: '4px', display: 'inline-block' }}>
                  <StatusChip 
                    status={esp.nombre}
                    statusInfo={{ label: esp.nombre, color: PersonalService.getEspecialidadColor(esp.area) }}
                    size="small"
                  />
                </span>
              ))
            ) : (
              <Typography variant="caption" color="text.secondary">
                Sin especialidades asignadas
              </Typography>
            )}
          </Box>
        );
      case 'contacto':
        const contactInfo = PersonalService.getContactInfo(row);
        return (
          <Box>
            <Typography variant="body2" display="flex" alignItems="center" fontSize="0.75rem">
              <Phone sx={{ fontSize: '14px', mr: 0.5 }} />
              {contactInfo.telefono}
            </Typography>
            <Typography variant="body2" display="flex" alignItems="center" fontSize="0.75rem" color="text.secondary">
              <Email sx={{ fontSize: '14px', mr: 0.5 }} />
              {contactInfo.correo}
            </Typography>
          </Box>
        );
      case 'estado':
        return (
          <Box>
            <StatusChip 
              status={row.estado}
              statusInfo={PersonalService.getEstadoInfo(row.estado)}
            />
            <Typography variant="caption" display="block" color="text.secondary">
              Desde: {PersonalService.formatDate(row.fecha_creacion)}
            </Typography>
          </Box>
        );
      default:
        return row[column.field];
    }
  };

  // Datos filtrados
  let filteredPersonal = PersonalService.filterPersonal(
    PersonalService.filterByArea(personal, filterArea),
    searchTerm
  );

  // Configuración de filtros
  const filters = [
    {
      type: 'select',
      label: 'Área',
      value: filterArea,
      onChange: setFilterArea,
      options: PersonalService.getUniqueAreas(personal).map(area => ({
        value: area,
        label: EspecialidadService.getAreaLabel(area)
      })),
      width: 3
    }
  ];

  // Componente de formulario
  const FormComponent = () => (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <FormSection title="Información Personal" icon={AccountBox}>
          <Grid item xs={12}>
            <PersonSelector
              selectedPerson={selectedPerson}
              onPersonSelect={handlePersonaSelect}
              onClear={handlePersonaClear}
              label="Persona"
              required={true}
              error={errors.persona_id}
              placeholder="Buscar y Seleccionar Persona"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body1" mb={1}>Título Profesional: *</Typography>
            <TextField
              fullWidth
              name="titulo_profesional"
              value={formData.titulo_profesional}
              onChange={handleChange}
              error={!!errors.titulo_profesional}
              helperText={errors.titulo_profesional}
              placeholder="Ej: Licenciado en Psicología, Doctor en Medicina, etc."
            />
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
              startIcon={editingId ? <Edit /> : <PersonAdd />}
              size="large"
              disabled={!formData.persona_id || !formData.titulo_profesional}
            >
              {editingId ? 'Actualizar Personal' : 'Registrar Personal'}
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
        title="Personal"
        icon={SupervisorAccount}
        headerColors={['#4CAF50', '#2196F3', '#FF9800', '#9C27B0']}
        service={PersonalService}
        data={filteredPersonal}
        loading={loading}
        columns={columns}
        renderCell={renderCell}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por nombre, título profesional o especialidad"
        filters={filters}
        onEdit={handleEdit}
        onView={(item) => setDetailDialog({ open: true, data: item })}
        FormComponent={FormComponent}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        editingId={editingId}
        addNewText="Nuevo Personal"
        deleteTitle="¿Eliminar personal?"
        deleteMessage="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este miembro del personal?"
      />

      {/* Dialog de detalles */}
      <DetailDialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, data: null })}
        title="Detalles del Personal"
        icon={SupervisorAccount}
        data={detailDialog.data}
        onEdit={handleEdit}
        maxWidth="lg"
      >
        {detailDialog.data && (
          <>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="primary">Información Personal</Typography>
              <Typography variant="body2">
                <strong>Nombre:</strong> {PersonalService.getFullName(detailDialog.data)}
              </Typography>
              <Typography variant="body2">
                <strong>Cédula:</strong> {detailDialog.data.cedula}
              </Typography>
              <Typography variant="body2">
                <strong>Título:</strong> {detailDialog.data.titulo_profesional}
              </Typography>
              <Typography variant="body2" display="flex" alignItems="center">
                <Phone fontSize="small" sx={{ mr: 1 }} />
                {PersonalService.getContactInfo(detailDialog.data).telefono}
              </Typography>
              <Typography variant="body2" display="flex" alignItems="center">
                <Email fontSize="small" sx={{ mr: 1 }} />
                {PersonalService.getContactInfo(detailDialog.data).correo}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="primary">Especialidades Asignadas</Typography>
              {detailDialog.data.especialidades && detailDialog.data.especialidades.length > 0 ? (
                <Box>
                  {detailDialog.data.especialidades.map((esp, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <StatusChip 
                        status={esp.nombre}
                        statusInfo={{ label: esp.nombre, color: PersonalService.getEspecialidadColor(esp.area) }}
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        Área: {EspecialidadService.getAreaLabel(esp.area)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Sin especialidades asignadas
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="primary">Estado y Fechas</Typography>
              <Box mb={1}>
                <StatusChip 
                  status={detailDialog.data.estado}
                  statusInfo={PersonalService.getEstadoInfo(detailDialog.data.estado)}
                />
              </Box>
              <Typography variant="body2">
                <strong>Fecha de creación:</strong> {PersonalService.formatDate(detailDialog.data.fecha_creacion)}
              </Typography>
              <Typography variant="body2">
                <strong>Fecha de modificación:</strong> {PersonalService.formatDate(detailDialog.data.fecha_modificacion)}
              </Typography>
            </Grid>

            {detailDialog.data.usuario_id && (
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="primary">Información de Usuario</Typography>
                <Typography variant="body2">
                  <strong>Usuario del sistema:</strong> {detailDialog.data.nombre_usuario || 'Sí'}
                </Typography>
                <Typography variant="body2">
                  <strong>Rol:</strong> {detailDialog.data.rol_usuario || 'N/A'}
                </Typography>
              </Grid>
            )}
          </>
        )}
      </DetailDialog>
    </>
  );
};

export default PersonalOptimized;