import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  Snackbar,
  Divider,
  Paper,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Upload,
  Download,
  Delete,
  Edit,
  ArrowBack,
  Refresh,
  Description,
  Security,
  Close,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDateLocal } from 'src/utils/dateUtils';
import { useAuth } from '../../contexts/AuthContext';

// Servicios
import { API_CONFIG } from '../../config/api.js';
import ApiService, { extractData } from '../../services/apiService.js';
import { FileValidator } from '../../utils/fileValidation.js';

const DocumentosPersonal = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Soporta rutas /personal/:id/documentos o /personal/:personalId/documentos
  const { personalId: personalIdParam, id: idParam } = useParams();
  const personalId = personalIdParam || idParam;

  // Verificar si el usuario es administrador
  const esAdministrador = user?.rol?.toLowerCase() === 'administrador';

  // Estados principales
  const [personal, setPersonal] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Estados de UI
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingDocumento, setEditingDocumento] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Estados del formulario
  const [uploadData, setUploadData] = useState({
    archivo: null,
    tipo_documento: 'otros',
    descripcion: '',
    es_confidencial: false,
    fecha_vencimiento: ''
  });

  const tiposDocumento = [
    { value: 'cedula', label: '🆔 Cédula de Identidad' },
    { value: 'curriculum', label: '📄 Currículum Vitae' },
    { value: 'titulo_profesional', label: '🎓 Título Profesional' },
    { value: 'licencia_profesional', label: '🏥 Licencia Profesional' },
    { value: 'colegiatura', label: '🎖️ Colegiatura' },
    { value: 'certificacion', label: '🏆 Certificación' },
    { value: 'capacitacion', label: '📚 Capacitación' },
    { value: 'contrato', label: '🤝 Contrato' },
    { value: 'acuerdo_confidencialidad', label: '🔒 Acuerdo de Confidencialidad' },
    { value: 'seguro_responsabilidad', label: '🛡️ Seguro de Responsabilidad' },
    { value: 'referencias', label: '📋 Referencias Laborales' },
    { value: 'evaluacion_desempeño', label: '📊 Evaluación de Desempeño' },
    { value: 'antecedentes_penales', label: '📜 Antecedentes Penales' },
    { value: 'record_policial', label: '👮 Record Policial' },
    { value: 'foto_personal', label: '📸 Foto Personal' },
    { value: 'otros', label: '📎 Otros Documentos' }
  ];

  useEffect(() => {
    if (personalId) {
      loadPersonal();
      loadDocumentos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personalId]);

  const loadPersonal = async () => {
    try {
      const response = await ApiService.get(`/api/personal/${personalId}`);
      const data = extractData(response);
      setPersonal(data);
    } catch (error) {
      console.error('Error al cargar personal:', error);
      setSnackbar({ open: true, message: 'Error al cargar datos del personal', severity: 'error' });
    }
  };

  const loadDocumentos = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get(`/api/personal/${personalId}/documentos`);
      const data = extractData(response);
      setDocumentos(data || []);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      setSnackbar({ open: true, message: 'Error al cargar documentos', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = FileValidator.validateFile(file, 'PERSONAL_DOCUMENTS');

      if (!validation.isValid) {
        setSnackbar({
          open: true,
          message: validation.message,
          severity: 'error'
        });
        e.target.value = '';
        return;
      }

      setUploadData(prev => ({ ...prev, archivo: file }));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.archivo) {
      setSnackbar({ open: true, message: 'Debe seleccionar un archivo', severity: 'error' });
      return;
    }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('archivo', uploadData.archivo);
      formData.append('tipo_documento', uploadData.tipo_documento);
      formData.append('descripcion', uploadData.descripcion);
      formData.append('es_confidencial', uploadData.es_confidencial);
      if (uploadData.fecha_vencimiento) formData.append('fecha_vencimiento', uploadData.fecha_vencimiento);

      await ApiService.post(`/api/personal/${personalId}/documentos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      setSnackbar({ open: true, message: 'Documento subido exitosamente', severity: 'success' });
      setShowUploadForm(false);
      setUploadData({
        archivo: null,
        tipo_documento: 'otros',
        descripcion: '',
        es_confidencial: false,
        fecha_vencimiento: ''
      });

      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

      await loadDocumentos();
    } catch (error) {
      console.error('Error al subir documento:', error);
      const errorMsg = error.response?.data?.message || 'Error al subir documento';
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (documento) => {
    try {
      const response = await ApiService.get(
        `/api/personal/${personalId}/documentos/${documento.id}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = documento.nombre_original;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSnackbar({ open: true, message: `Documento "${documento.nombre_original}" descargado`, severity: 'success' });
    } catch (error) {
      console.error('Error al descargar documento:', error);
      setSnackbar({ open: true, message: 'Error al descargar documento', severity: 'error' });
    }
  };

  const handleDelete = async (documento) => {
    if (!window.confirm(`¿Está seguro de eliminar el documento "${documento.nombre_original}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await ApiService.delete(`/api/personal/${personalId}/documentos/${documento.id}`);
      setSnackbar({ open: true, message: 'Documento eliminado exitosamente', severity: 'success' });
      await loadDocumentos();
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      setSnackbar({ open: true, message: 'Error al eliminar documento', severity: 'error' });
    }
  };

  const handleEdit = (documento) => {
    setEditingDocumento({
      ...documento,
      fecha_vencimiento: documento.fecha_vencimiento
        ? new Date(documento.fecha_vencimiento).toISOString().split('T')[0]
        : ''
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        tipo_documento: editingDocumento.tipo_documento,
        descripcion: editingDocumento.descripcion,
        es_confidencial: editingDocumento.es_confidencial,
        fecha_vencimiento: editingDocumento.fecha_vencimiento || null
      };
      await ApiService.put(
        `/api/personal/${personalId}/documentos/${editingDocumento.id}`,
        updateData
      );
      setSnackbar({ open: true, message: 'Documento actualizado exitosamente', severity: 'success' });
      setEditingDocumento(null);
      await loadDocumentos();
    } catch (error) {
      console.error('Error al actualizar documento:', error);
      setSnackbar({ open: true, message: 'Error al actualizar documento', severity: 'error' });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    return formatDateLocal(dateString);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTipoDocumentoLabel = (tipo) => {
    const tipoObj = tiposDocumento.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  };

  // Helper para mostrar nombre de archivo limpio
  const formatFileName = (documento) => {
    // Prioridad: nombre_original > nombre_archivo limpio
    if (documento.nombre_original && documento.nombre_original !== documento.nombre_archivo) {
      return documento.nombre_original;
    }

    // Si solo tiene nombre_archivo, intentar limpiarlo
    if (documento.nombre_archivo) {
      const fileName = documento.nombre_archivo;

      // Patrón 1: UUID completo con guiones (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx_nombrearchivo.ext)
      let match = fileName.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_(.+)$/i);
      if (match) {
        return match[1];
      }

      // Patrón 2: UUID sin guiones (xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx_nombrearchivo.ext)
      match = fileName.match(/^[0-9a-f]{32}_(.+)$/i);
      if (match) {
        return match[1];
      }

      // Patrón 3: Cualquier cadena hexadecimal larga seguida de guion bajo
      match = fileName.match(/^[0-9a-f]+_(.+)$/i);
      if (match && match[1]) {
        return match[1];
      }

      // Si no coincide con ningún patrón, devolver el nombre completo
      return fileName;
    }

    return 'Documento sin nombre';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography ml={2}>Cargando documentos...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* ===== Encabezado arcoíris (igual estilo que Persona/Paciente) ===== */}
      <Paper
        elevation={6}
        sx={{
          borderRadius: 3,
          backgroundColor: 'background.paper',
          mb: 4,
          p: 0,
          overflow: 'hidden',
          border: '4px solid transparent',
          backgroundImage: (theme) =>
            theme.palette.mode === 'dark'
              ? 'none'
              : `linear-gradient(${theme.palette.background.paper}, ${theme.palette.background.paper}), linear-gradient(270deg, red, orange, yellow, green, blue, indigo, violet)`,
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          animation: 'rainbow 5s linear infinite',
          '@keyframes rainbow': {
            '0%': { backgroundPosition: '0% 50%' },
            '100%': { backgroundPosition: '100% 50%' },
          },
          backgroundSize: '300% 100%',
        }}
      >
        <Box
          sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap'
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight="bold" color="black">
              Documentos de {personal?.nombre_completo || 'Personal'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gestión de documentos del personal
            </Typography>
          </Box>

          <Box display="flex" gap={1} flexWrap="wrap">
            {esAdministrador && (
              <Tooltip title="Subir Documento">
                <Button
                  variant="contained"
                  startIcon={<Upload />}
                  onClick={() => setShowUploadForm(true)}
                  disabled={uploading}
                  sx={{
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    backgroundColor: theme.palette.primary.main,
                '&:hover': {
               backgroundColor: theme.palette.primary.dark,
                 }
                    }}
                >
                  Subir
                </Button>
              </Tooltip>
            )}
            <Tooltip title="Recargar">
              <IconButton
                onClick={loadDocumentos}
                disabled={loading}
                color="primary"
                sx={{ border: '1px solid', borderColor: 'divider' }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Volver">
              <IconButton
                onClick={() => navigate('/gestion/personal')}
                color="inherit"
                sx={{ border: '1px solid', borderColor: 'divider' }}
              >
                <ArrowBack />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* ===== Lista / grid de documentos (card mejorado estilo form Paciente) ===== */}
      <Card
        elevation={8}
        sx={{
          borderRadius: 4,
          mb: 4,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
        {/* Cabecera de la lista */}
        <Box
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            📋 Documentos ({documentos.length})
          </Typography>
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          {documentos.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 6,
                background: '#fff',
                borderRadius: 3,
                border: '1px dashed',
                borderColor: 'divider'
              }}
            >
              <Description sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Sin documentos
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Este personal no tiene documentos cargados
              </Typography>
              {esAdministrador && (
                <Button
                  variant="contained"
                  startIcon={<Upload />}
                  onClick={() => setShowUploadForm(true)}
                  sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 'bold', backgroundColor: theme.palette.primary.main,
                '&:hover': {
               backgroundColor: theme.palette.primary.dark, // 👈 color al pasar el mouse
                 }
                    }}
                >
                  Subir Primer Documento
                </Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={3}>
              {documentos.map((documento) => (
                <Grid key={documento.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      borderColor: 'divider',
                      backgroundColor: 'background.paper',
                    }}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Chip
                          label={getTipoDocumentoLabel(documento.tipo_documento)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        {documento.es_confidencial && (
                          <Chip
                            icon={<Security />}
                            label="Confidencial"
                            size="small"
                            color="error"
                            variant="outlined"
                          />
                        )}
                      </Box>

                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ wordBreak: 'break-word' }}>
                        {formatFileName(documento)}
                      </Typography>

                      {documento.descripcion && (
                        <Typography variant="body2" color="text.secondary" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                          {documento.descripcion}
                        </Typography>
                      )}

                      <Box mb={2}>
                        <Typography variant="caption" display="block">
                          <strong>Tamaño:</strong> {formatFileSize(documento.tamaño_archivo)}
                        </Typography>
                        <Typography variant="caption" display="block">
                          <strong>Subido:</strong> {formatDate(documento.fecha_creacion)}
                        </Typography>
                        {documento.fecha_vencimiento && (
                          <Typography variant="caption" display="block">
                            <strong>Vence:</strong> {formatDate(documento.fecha_vencimiento)}
                          </Typography>
                        )}
                      </Box>

                      <Divider sx={{ my: 1 }} />

                      <Box display="flex" justifyContent="space-between">
                        <Tooltip title="Descargar">
                          <IconButton size="small" color="primary" onClick={() => handleDownload(documento)}>
                            <Download />
                          </IconButton>
                        </Tooltip>
                        {esAdministrador && (
                          <>
                            <Tooltip title="Editar">
                              <IconButton size="small" color="success" onClick={() => handleEdit(documento)}>
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton size="small" color="error" onClick={() => handleDelete(documento)}>
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Subir Documento */}
      <Dialog
        open={showUploadForm}
        onClose={() => setShowUploadForm(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={600}>
              Subir Documento
            </Typography>
            <IconButton size="small" onClick={() => setShowUploadForm(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <Divider />

        <form onSubmit={handleUploadSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={2.5}>
              {/* Zona de Archivo */}
              <Box>
                <input
                  id="file-upload-personal"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={handleFileChange}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-upload-personal">
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: '2px dashed',
                      borderColor: uploadData.archivo ? 'success.main' : 'grey.300',
                      backgroundColor: uploadData.archivo ? 'success.50' : 'grey.50',
                      borderRadius: 2,
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.50',
                      }
                    }}
                  >
                    {uploadData.archivo ? (
                      <>
                        <Description sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                        <Typography variant="body2" fontWeight={600} gutterBottom noWrap>
                          {uploadData.archivo.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(uploadData.archivo.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Upload sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body2" fontWeight={600} gutterBottom>
                          Seleccionar archivo
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          PDF, Word, Excel, Imágenes (Máx. 15MB)
                        </Typography>
                      </>
                    )}
                  </Paper>
                </label>
              </Box>

              {/* Tipo de Documento */}
              <TextField
                select
                fullWidth
                label="Tipo de Documento"
                value={uploadData.tipo_documento}
                onChange={(e) => setUploadData(prev => ({ ...prev, tipo_documento: e.target.value }))}
                required
                disabled={uploading}
              >
                {tiposDocumento.map((tipo) => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </MenuItem>
                ))}
              </TextField>

              {/* Fecha de Vencimiento */}
              <TextField
                type="date"
                fullWidth
                label="Fecha de Vencimiento (Opcional)"
                InputLabelProps={{ shrink: true }}
                value={uploadData.fecha_vencimiento}
                onChange={(e) => setUploadData(prev => ({ ...prev, fecha_vencimiento: e.target.value }))}
                disabled={uploading}
              />

              {/* Descripción */}
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Descripción (Opcional)"
                placeholder="Detalles del documento..."
                value={uploadData.descripcion}
                onChange={(e) => setUploadData(prev => ({ ...prev, descripcion: e.target.value }))}
                disabled={uploading}
              />

              {/* Confidencial */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={uploadData.es_confidencial}
                    onChange={(e) => setUploadData(prev => ({ ...prev, es_confidencial: e.target.checked }))}
                    disabled={uploading}
                  />
                }
                label="Documento Confidencial"
              />

              {/* Loading */}
              {uploading && (
                <Alert severity="info" icon={<CircularProgress size={20} />}>
                  Subiendo documento...
                </Alert>
              )}
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              onClick={() => setShowUploadForm(false)}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={uploading || !uploadData.archivo}
              startIcon={<Upload />}
            >
              {uploading ? 'Subiendo...' : 'Subir'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog de Editar Documento */}
      <Dialog open={!!editingDocumento} onClose={() => setEditingDocumento(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Edit />
            Editar Documento
          </Box>
        </DialogTitle>
        {editingDocumento && (
          <form onSubmit={handleUpdateSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Tipo de Documento"
                    value={editingDocumento.tipo_documento}
                    onChange={(e) => setEditingDocumento(prev => ({ ...prev, tipo_documento: e.target.value }))}
                    required
                  >
                    {tiposDocumento.map((tipo) => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    type="date"
                    fullWidth
                    label="Fecha de Vencimiento"
                    InputLabelProps={{ shrink: true }}
                    value={editingDocumento.fecha_vencimiento}
                    onChange={(e) => setEditingDocumento(prev => ({ ...prev, fecha_vencimiento: e.target.value }))}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Descripción"
                    value={editingDocumento.descripcion || ''}
                    onChange={(e) => setEditingDocumento(prev => ({ ...prev, descripcion: e.target.value }))}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editingDocumento.es_confidencial}
                        onChange={(e) => setEditingDocumento(prev => ({ ...prev, es_confidencial: e.target.checked }))}
                      />
                    }
                    label="🔒 Documento confidencial"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditingDocumento(null)}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" startIcon={<Edit />} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                Guardar Cambios
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentosPersonal;