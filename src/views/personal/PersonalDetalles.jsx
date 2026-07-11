// src/views/personal/PersonalDetalles.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Chip,
  Card,
  CardContent,
  Avatar,
  Divider,
  Stack,
  CircularProgress,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Visibility,
  SupervisorAccount,
  Person,
  Phone,
  Email,
  Badge,
  Edit,
  Description,
  CloudDownload,
  Delete,
  MoreVert
} from '@mui/icons-material';

// Servicios
import PersonalService from '../../services/personalService.js';
import EspecialidadService from '../../services/especialidadService.js';
import ApiService, { extractData } from '../../services/apiService.js';

/* ===== Helpers ===== */
function formatDateLocal(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-ES');
  } catch {
    return '—';
  }
}

const PersonalDetalles = ({
  open,
  data,
  onClose,
  onEdit
}) => {
  const [documentos, setDocumentos] = useState([]);
  const [loadingDocumentos, setLoadingDocumentos] = useState(false);

  // Estados para gestión de documentos
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Cargar documentos cuando se abre el diálogo
  useEffect(() => {
    if (open && data?.id) {
      loadDocumentos();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- carga intencional solo al montar/cambiar la clave
  }, [open, data?.id]);

  const loadDocumentos = async () => {
    if (!data?.id) return;

    try {
      setLoadingDocumentos(true);
      const response = await ApiService.get(`/api/personal/${data.id}/documentos`);
      const documentosData = extractData(response);
      setDocumentos(documentosData || []);
    } catch (error) {
      console.error('Error loading documentos:', error);
      setDocumentos([]);
    } finally {
      setLoadingDocumentos(false);
    }
  };

  if (!data) return null;

  const handleEdit = () => {
    onEdit(data);
    onClose();
  };

  // Funciones para gestión de documentos
  const handleMenuOpen = (event, documento) => {
    setMenuAnchor(event.currentTarget);
    setSelectedDoc(documento);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedDoc(null);
  };

  const handleDeleteDocument = async () => {
    if (!selectedDoc) return;

    if (window.confirm('¿Está seguro de que desea eliminar este documento?')) {
      try {
        await ApiService.delete(`/api/personal/${data.id}/documentos/${selectedDoc.id}`);
        setSnackbar({ open: true, message: 'Documento eliminado exitosamente', severity: 'success' });
        loadDocumentos();
      } catch {
        setSnackbar({ open: true, message: 'Error al eliminar documento', severity: 'error' });
      }
    }
    handleMenuClose();
  };

  const handleDownloadDocument = async (documento) => {
    try {
      const response = await ApiService.get(
        `/api/documentos-personal/${documento.id}/descargar`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = documento.nombre_original || documento.nombre_archivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSnackbar({ open: true, message: `Documento "${documento.nombre_original || documento.nombre_archivo}" descargado`, severity: 'success' });
    } catch (error) {
      console.error('Error downloading document:', error);
      setSnackbar({ open: true, message: 'Error al descargar documento', severity: 'error' });
    }
  };

  // Estado (usa el service para mantener la semántica de colores)
  const estadoInfo = PersonalService.getEstadoInfo
    ? PersonalService.getEstadoInfo(data.estado)
    : { label: data.estado || 'activo', color: 'default' };

  // Fechas: usa lo que tengas disponible

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      {/* Header morado con icono (igual estilo que PersonaDetalles) */}
      <DialogTitle
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Visibility sx={{ mr: 1 }} />
        Detalles del Personal
      </DialogTitle>

      <DialogContent sx={{ p: 0, mt: 2 }}>
        {/* Encabezado del colaborador */}
        <Box sx={{ p: 3, bgcolor: 'primary.50' }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                mr: 3,
                fontSize: '2rem'
              }}
            >
              <SupervisorAccount fontSize="large" />
            </Avatar>

            <Box flex={1}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {PersonalService.getFullName ? PersonalService.getFullName(data) : `${data.nombre || ''} ${data.apellido || ''}`.trim()}
              </Typography>

              {/* Cédula y título como subtítulos */}
              <Typography variant="h6" color="primary" gutterBottom>
                Cédula: {data.cedula || 'Sin cédula'}
              </Typography>

              <Box display="flex" gap={1} flexWrap="wrap">
                {/* Estado */}
                <Chip
                  label={estadoInfo.label}
                  color={estadoInfo.color}
                />
                {/* Título profesional (si tiene) */}
                {data.titulo_profesional ? (
                  <Chip
                    label={data.titulo_profesional}
                    color="info"
                  />
                ) : null}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Cuerpo con tarjetas (igual estructura que PersonaDetalles) */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Información del Colaborador */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
                    <Person sx={{ mr: 1 }} />
                    Información del Colaborador
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Nombre Completo</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {PersonalService.getFullName ? PersonalService.getFullName(data) : `${data.nombre || ''} ${data.apellido || ''}`.trim()}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">Cédula</Typography>
                      <Typography variant="body1" fontWeight="bold" display="flex" alignItems="center">
                        <Badge sx={{ fontSize: 16, mr: 0.5 }} />
                        {data.cedula || 'Sin cédula'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">Título Profesional</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {data.titulo_profesional || '—'}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Información de Contacto */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
                    <Phone sx={{ mr: 1 }} />
                    Información de Contacto
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Teléfono</Typography>
                      {data.telefono ? (
                        <Typography variant="body1" fontWeight="bold" display="flex" alignItems="center">
                          <Phone sx={{ fontSize: 16, mr: 0.5 }} />
                          {data.telefono}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                          Sin teléfono registrado
                        </Typography>
                      )}
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">Correo Electrónico</Typography>
                      {data.correo ? (
                        <Typography variant="body1" fontWeight="bold" display="flex" alignItems="center">
                          <Email sx={{ fontSize: 16, mr: 0.5 }} />
                          {data.correo}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                          Sin correo registrado
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Especialidades */}
            <Grid size={{ xs: 12 }}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Especialidades Asignadas
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {data.especialidades && data.especialidades.length > 0 ? (
                    <Box>
                      {data.especialidades.map((esp, index) => (
                        <Box key={index} sx={{ mb: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                          <Chip
                            label={esp.nombre}
                            color={PersonalService.getEspecialidadColor ? PersonalService.getEspecialidadColor(esp.area) : 'default'}
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            Área: {EspecialidadService.getAreaLabel ? EspecialidadService.getAreaLabel(esp.area) : esp.area}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Sin especialidades asignadas
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Documentos Personales */}
            <Grid size={{ xs: 12 }}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
                    <Description sx={{ mr: 1 }} />
                    Documentos Personales
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  {loadingDocumentos ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                      <CircularProgress size={24} sx={{ mr: 2 }} />
                      <Typography variant="body2">Cargando documentos...</Typography>
                    </Box>
                  ) : documentos.length > 0 ? (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {documentos.length} documento(s) personal(es)
                      </Typography>
                      <Stack spacing={1}>
                        {documentos.map((documento) => (
                          <Box
                            key={documento.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              p: 2,
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              backgroundColor: 'background.paper',
                              '&:hover': {
                                backgroundColor: 'action.hover'
                              }
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                <Chip
                                  label={documento.tipo_documento?.replace('_', ' ').toUpperCase() || 'DOCUMENTO'}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                                {documento.es_confidencial && (
                                  <Chip
                                    label="Confidencial"
                                    size="small"
                                    color="error"
                                    variant="filled"
                                  />
                                )}
                              </Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {documento.nombre_original || documento.nombre_archivo}
                              </Typography>
                              {documento.descripcion && (
                                <Typography variant="caption" color="text.secondary">
                                  {documento.descripcion}
                                </Typography>
                              )}
                              <Box display="flex" gap={2} mt={0.5}>
                                <Typography variant="caption" color="text.secondary">
                                  {documento.tamaño_archivo ? `${(documento.tamaño_archivo / 1024).toFixed(1)} KB` : 'N/A'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {documento.fecha_creacion ? formatDateLocal(documento.fecha_creacion) : 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                            <Box display="flex" gap={1}>
                              <Tooltip title="Descargar">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleDownloadDocument(documento)}
                                >
                                  <CloudDownload />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Más opciones">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleMenuOpen(e, documento)}
                                >
                                  <MoreVert />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                      Sin documentos personales registrados
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} variant="outlined">
            Cerrar
          </Button>
          <Button
            onClick={handleEdit}
            variant="contained"
            startIcon={<Edit />}
            sx={(theme) => ({
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            })}
          >
            Editar
          </Button>
        </Stack>
      </DialogActions>

      {/* Menú de opciones de documento */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 160 }
        }}
      >
        <MenuItem onClick={handleDeleteDocument} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Delete fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>

      {/* Snackbar para notificaciones */}
      {snackbar.open && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 9999,
            bgcolor: snackbar.severity === 'error' ? 'error.main' : 'success.main',
            color: 'white',
            p: 2,
            borderRadius: 1,
            boxShadow: 3
          }}
        >
          <Typography variant="body2">{snackbar.message}</Typography>
          <Button
            size="small"
            sx={{ color: 'white', mt: 1 }}
            onClick={() => setSnackbar({ ...snackbar, open: false })}
          >
            Cerrar
          </Button>
        </Box>
      )}
    </Dialog>
  );
};

export default PersonalDetalles;
