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
  Close,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDateLocal } from 'src/utils/dateUtils';
import { useAuth } from '../../contexts/AuthContext';

// Servicios
import ApiService, { extractData } from '../../services/apiService.js';
import { FileValidator } from '../../utils/fileValidation.js';

const DocumentosPaciente = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Soporta rutas /pacientes/:id/documentos o /pacientes/:pacienteId/documentos
  const { pacienteId: pacienteIdParam, id: idParam } = useParams();
  const pacienteId = pacienteIdParam || idParam;

  // Verificar si el usuario es administrador
  const esAdministrador = user?.rol?.toLowerCase() === 'administrador';

  // Estados principales
  const [paciente, setPaciente] = useState(null);
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
  });

  // Removido: ahora ApiService maneja los headers automáticamente

  const tiposDocumento = [
    { value: 'historia_clinica', label: '🏥 Historia Clínica' },
    { value: 'evaluacion_inicial', label: '📝 Evaluación Inicial' },
    { value: 'informe_progreso', label: '📊 Informe de Progreso' },
    { value: 'alta_medica', label: '🏥 Alta Médica' },
    { value: 'consentimiento_informado', label: '✍️ Consentimiento Informado' },
    { value: 'autorizacion_tratamiento', label: '✅ Autorización de Tratamiento' },
    { value: 'cedula_paciente', label: '🆔 Cédula del Paciente' },
    { value: 'cedula_tutor', label: '🆔 Cédula del Tutor' },
    { value: 'otros', label: '📎 Otros' }
  ];

  useEffect(() => {
    if (pacienteId) {
      loadPaciente();
      loadDocumentos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pacienteId]);

  const loadPaciente = async () => {
    try {
      const response = await ApiService.get(`/api/pacientes/${pacienteId}`);
      const data = extractData(response);
      setPaciente(data);
    } catch (error) {
      console.error('Error al cargar paciente:', error);
      setSnackbar({ open: true, message: 'Error al cargar datos del paciente', severity: 'error' });
    }
  };

  const loadDocumentos = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get(`/api/pacientes/${pacienteId}/documentos`);
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
      const validation = FileValidator.validateFile(file, 'PATIENT_DOCUMENTS');

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
      setSnackbar({ open: true, message: 'Debe seleccionar un archivo PDF', severity: 'error' });
      return;
    }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('archivo', uploadData.archivo);
      formData.append('tipo_documento', uploadData.tipo_documento);
      formData.append('descripcion', uploadData.descripcion);

      await ApiService.post(`/api/pacientes/${pacienteId}/documentos`, formData, {
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
        `/api/pacientes/${pacienteId}/documentos/${documento.id}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = formatFileName(documento);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSnackbar({ open: true, message: `Documento "${formatFileName(documento)}" descargado`, severity: 'success' });
    } catch (error) {
      console.error('Error al descargar documento:', error);
      setSnackbar({ open: true, message: 'Error al descargar documento', severity: 'error' });
    }
  };

  const handleDelete = async (documento) => {
    if (!window.confirm(`¿Está seguro de eliminar el documento "${formatFileName(documento)}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      await ApiService.delete(`/api/pacientes/${pacienteId}/documentos/${documento.id}`);
      setSnackbar({ open: true, message: 'Documento eliminado exitosamente', severity: 'success' });
      await loadDocumentos();
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      setSnackbar({ open: true, message: 'Error al eliminar documento', severity: 'error' });
    }
  };

  const handleEdit = (documento) => {
    setEditingDocumento({ ...documento });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        tipo_documento: editingDocumento.tipo_documento,
        descripcion: editingDocumento.descripcion,
      };
      await ApiService.put(
        `/api/pacientes/${pacienteId}/documentos/${editingDocumento.id}`,
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
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      {/* Boton volver */}
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/app/gestion/paciente')}
          variant="outlined"
          size="small"
        >
          Volver a Pacientes
        </Button>
      </Box>

      <Card
        elevation={8}
        sx={{
          borderRadius: 4,
          mb: 4,
          backgroundColor: 'background.paper',
          overflow: 'hidden',
          border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center">
              <Description sx={{ mr: 1 }} />
              Documentos del Paciente
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {paciente?.nombre_completo || 'Cargando...'}
            </Typography>
          </Box>
          <Box display="flex" gap={1} alignItems="center">
            <Chip
              label={`${documentos.length} documento${documentos.length !== 1 ? 's' : ''}`}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              size="small"
            />
            <Tooltip title="Recargar">
              <IconButton size="small" onClick={loadDocumentos} sx={{ color: 'white' }}>
                <Refresh />
              </IconButton>
            </Tooltip>
            {esAdministrador && (
              <Button
                variant="contained"
                size="small"
                startIcon={<Upload />}
                onClick={() => setShowUploadForm(true)}
                disabled={uploading}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                }}
              >
                Subir
              </Button>
            )}
          </Box>
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          {documentos.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 6,
                background: theme.palette.background.paper,
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
                Este paciente no tiene documentos PDF cargados
              </Typography>
              {esAdministrador && (
                <Button
                  variant="contained"
                  startIcon={<Upload />}
                  onClick={() => setShowUploadForm(true)}
                  sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 'bold' ,backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
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
                <Grid item xs={12} sm={6} md={4} key={documento.id}>
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
                          <strong>Subido:</strong> {formatDate(documento.fecha_subida)}
                        </Typography>
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
                  id="file-upload-paciente"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-upload-paciente">
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
                          Seleccionar archivo PDF
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Solo archivos PDF (Máx. 10MB)
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
                <Grid item xs={12}>
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

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Descripcion"
                    value={editingDocumento.descripcion || ''}
                    onChange={(e) => setEditingDocumento(prev => ({ ...prev, descripcion: e.target.value }))}
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

export default DocumentosPaciente;
