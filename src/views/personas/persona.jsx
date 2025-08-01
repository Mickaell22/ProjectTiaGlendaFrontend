import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Tooltip,
  Card,
  CardContent,
  Divider,
  Chip,
} from '@mui/material';
import { Edit, Delete, Visibility, PersonAdd, Search } from '@mui/icons-material';
import axios from 'axios';

const Persona = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    correo: '',
    direccion: '',
    fechaNacimiento: '',
  });

  const [personas, setPersonas] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [detalle, setDetalle] = useState(null);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar personas desde el backend
  useEffect(() => {
    axios.get('/api/personas')
      .then(res => setPersonas(res.data.data || []))
      .catch(() => setSnackbar({ open: true, message: 'Error cargando personas', severity: 'error' }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Nombre es requerido';
    if (!formData.apellido.trim()) newErrors.apellido = 'Apellido es requerido';
    if (!formData.cedula.trim()) newErrors.cedula = 'Cédula es requerida';
    else if (!/^\d{10}$/.test(formData.cedula)) newErrors.cedula = 'Cédula debe tener 10 dígitos';
    if (!formData.telefono.trim()) newErrors.telefono = 'Teléfono es requerido';
    else if (!/^\d{10}$/.test(formData.telefono)) newErrors.telefono = 'Teléfono debe tener 10 dígitos';
    if (!formData.correo.trim()) newErrors.correo = 'Correo es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) newErrors.correo = 'Correo no válido';
    if (!formData.direccion.trim()) newErrors.direccion = 'Dirección es requerida';
    if (!formData.fechaNacimiento) newErrors.fechaNacimiento = 'Fecha de nacimiento es requerida';

    // Validar cédula duplicada
    const cedulaExists = personas.some((p, index) =>
      p.cedula === formData.cedula && (editingIndex === -1 || index !== editingIndex)
    );
    if (cedulaExists) newErrors.cedula = 'Esta cédula ya está registrada';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingIndex >= 0) {
        // Actualizar persona
        const personaId = personas[editingIndex].id;
        await axios.put(`/api/personas/${personaId}`, formData);
        const updatedPersonas = [...personas];
        updatedPersonas[editingIndex] = { ...formData, id: personaId };
        setPersonas(updatedPersonas);
        setEditingIndex(-1);
        setSnackbar({ open: true, message: 'Persona actualizada exitosamente', severity: 'success' });
      } else {
        // Crear persona
        const res = await axios.post('/api/personas', formData);
        setPersonas([...personas, res.data.data]);
        setSnackbar({ open: true, message: 'Persona registrada exitosamente', severity: 'success' });
      }
      setFormData({
        nombre: '',
        apellido: '',
        cedula: '',
        telefono: '',
        correo: '',
        direccion: '',
        fechaNacimiento: '',
      });
      setErrors({});
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al guardar persona', severity: 'error' });
    }
  };

  const handleDelete = async (index) => {
    try {
      const personaId = personas[index].id;
      await axios.delete(`/api/personas/${personaId}`);
      const nuevasPersonas = [...personas];
      nuevasPersonas.splice(index, 1);
      setPersonas(nuevasPersonas);
      setSnackbar({ open: true, message: 'Persona eliminada exitosamente', severity: 'info' });
      setEditingIndex(-1);
      setFormData({
        nombre: '',
        apellido: '',
        cedula: '',
        telefono: '',
        correo: '',
        direccion: '',
        fechaNacimiento: '',
      });
      setErrors({});
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al eliminar persona', severity: 'error' });
    }
  };

  const handleEdit = (index) => {
    const persona = personas[index];
    setFormData(persona);
    setEditingIndex(index);
    setSnackbar({ open: true, message: 'Editando persona. Modifica los campos y guarda los cambios.', severity: 'info' });
  };

  const handleCancelEdit = () => {
    setEditingIndex(-1);
    setFormData({
      nombre: '',
      apellido: '',
      cedula: '',
      telefono: '',
      correo: '',
      direccion: '',
      fechaNacimiento: '',
    });
    setErrors({});
  };

  const handleView = (persona) => {
    setDetalle(persona);
  };

  const handleClose = () => {
    setDetalle(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredPersonas = personas.filter(persona =>
    persona.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    persona.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    persona.cedula.includes(searchTerm)
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Box p={2} sx={{ ml: { lg: 2, md: 2, sm: 1, xs: 0 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <Paper
          elevation={6}
          sx={{
            borderRadius: 3,
            backgroundColor: '#fff',
            mb: 4,
            p: 0,
            overflow: 'hidden',
            border: '4px solid transparent',
            backgroundImage:
              'linear-gradient(white, white), linear-gradient(270deg, red, orange, yellow, green, blue, indigo, violet)',
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
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" color="black">
              Gestión de Personas
            </Typography>
          </Box>
        </Paper>

        <Card
          elevation={8}
          sx={{
            mb: 4,
            borderRadius: 4,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            border: '1px solid',
            borderColor: 'divider',
            transition: 'all 0.3s ease',
            '&:hover': {
              elevation: 12,
              transform: 'translateY(-2px)',
            }
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                background: editingIndex >= 0
                  ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
                  : 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                color: 'white',
                p: 3,
                borderRadius: '16px 16px 0 0',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  transform: 'translate(30px, -30px)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                      p: 1.5,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <PersonAdd sx={{ fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                      {editingIndex >= 0 ? 'Editar Persona' : 'Registrar Nueva Persona'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {editingIndex >= 0
                        ? 'Modifica los campos necesarios y guarda los cambios'
                        : 'Completa todos los campos para registrar una nueva persona'
                      }
                    </Typography>
                  </Box>
                </Box>
                {editingIndex >= 0 && (
                  <Chip
                    label="EDITANDO"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.75rem'
                    }}
                  />
                )}
              </Box>
            </Box>

            <Box sx={{ p: 4 }}>
              <Box component="form" onSubmit={handleSubmit}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    color: 'primary.main',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    '&::before': {
                      content: '""',
                      width: '4px',
                      height: '24px',
                      bgcolor: 'primary.main',
                      mr: 1,
                      borderRadius: '2px'
                    }
                  }}
                >
                  Información Personal
                </Typography>

                {/* Nombre */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: 'text.primary',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    Nombre Completo *
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    name="nombre"
                    placeholder="Ingresa el nombre completo"
                    value={formData.nombre}
                    onChange={handleChange}
                    error={!!errors.nombre}
                    helperText={errors.nombre}
                    sx={{
                      maxWidth: 600,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: '#f8f9ff',
                        },
                        '&.Mui-focused': {
                          backgroundColor: '#f8f9ff',
                          '& fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: '2px'
                          }
                        }
                      }
                    }}
                  />
                </Box>

                {/* Apellido */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: 'text.primary',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    Apellidos *
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    name="apellido"
                    placeholder="Ingresa los apellidos"
                    value={formData.apellido}
                    onChange={handleChange}
                    error={!!errors.apellido}
                    helperText={errors.apellido}
                    sx={{
                      maxWidth: 600,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: '#f8f9ff',
                        },
                        '&.Mui-focused': {
                          backgroundColor: '#f8f9ff',
                          '& fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: '2px'
                          }
                        }
                      }
                    }}
                  />
                </Box>

                {/* Cédula */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: 'text.primary',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    Número de Cédula *
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    name="cedula"
                    placeholder="Ingresa el número de cédula (10 dígitos)"
                    value={formData.cedula}
                    onChange={handleChange}
                    error={!!errors.cedula}
                    helperText={errors.cedula}
                    inputProps={{ maxLength: 10 }}
                    sx={{
                      maxWidth: 400,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: '#f8f9ff',
                        },
                        '&.Mui-focused': {
                          backgroundColor: '#f8f9ff',
                          '& fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: '2px'
                          }
                        }
                      }
                    }}
                  />
                </Box>

                {/* Fecha de Nacimiento */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: 'text.primary',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    Fecha de Nacimiento *
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    name="fechaNacimiento"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    error={!!errors.fechaNacimiento}
                    helperText={errors.fechaNacimiento}
                    sx={{
                      maxWidth: 300,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: '#f8f9ff',
                        },
                        '&.Mui-focused': {
                          backgroundColor: '#f8f9ff',
                          '& fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: '2px'
                          }
                        }
                      }
                    }}
                  />
                </Box>

                {/* Teléfono */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: 'text.primary',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    Número de Teléfono *
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    name="telefono"
                    placeholder="Ingresa el número de teléfono (10 dígitos)"
                    value={formData.telefono}
                    onChange={handleChange}
                    error={!!errors.telefono}
                    helperText={errors.telefono}
                    inputProps={{ maxLength: 10 }}
                    sx={{
                      maxWidth: 350,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: '#f8f9ff',
                        },
                        '&.Mui-focused': {
                          backgroundColor: '#f8f9ff',
                          '& fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: '2px'
                          }
                        }
                      }
                    }}
                  />
                </Box>

                {/* Correo */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: 'text.primary',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    Correo Electrónico *
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    name="correo"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={formData.correo}
                    onChange={handleChange}
                    error={!!errors.correo}
                    helperText={errors.correo}
                    sx={{
                      maxWidth: 500,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: '#f8f9ff',
                        },
                        '&.Mui-focused': {
                          backgroundColor: '#f8f9ff',
                          '& fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: '2px'
                          }
                        }
                      }
                    }}
                  />
                </Box>

                {/* Dirección */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: 'text.primary',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    Dirección Completa *
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    name="direccion"
                    placeholder="Ej: Av. Principal 123, Sector Norte, Ciudad, Provincia"
                    value={formData.direccion}
                    onChange={handleChange}
                    error={!!errors.direccion}
                    helperText={errors.direccion}
                    multiline
                    rows={3}
                    sx={{
                      maxWidth: 600,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: '#f8f9ff',
                        },
                        '&.Mui-focused': {
                          backgroundColor: '#f8f9ff',
                          '& fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: '2px'
                          }
                        }
                      }
                    }}
                  />
                </Box>

                {/* Botones */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'center',
                    alignItems: 'center',
                    mt: 4,
                    pt: 3,
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  {editingIndex >= 0 && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleCancelEdit}
                      size="large"
                      sx={{
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        fontSize: '1rem',
                        border: '2px solid',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      Cancelar Edición
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    size="large"
                    sx={{
                      borderRadius: 3,
                      px: 5,
                      py: 1.5,
                      fontWeight: 'bold',
                      textTransform: 'none',
                      fontSize: '1rem',
                      minWidth: 200,
                      background: editingIndex >= 0
                        ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
                        : 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                      boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(33, 150, 243, 0.6)',
                        background: editingIndex >= 0
                          ? 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)'
                          : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                      }
                    }}
                  >
                    {editingIndex >= 0 ? '✓ Actualizar Persona' : '+ Registrar Persona'}
                  </Button>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card elevation={3} sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Listado de Personas ({filteredPersonas.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  size="small"
                  placeholder="Buscar por nombre, apellido o cédula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
                  }}
                  sx={{ minWidth: 300 }}
                />
              </Box>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Apellido</TableCell>
                    <TableCell>Cédula</TableCell>
                    <TableCell>Dirección</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPersonas
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((persona, filteredIndex) => {
                      const originalIndex = personas.findIndex(p => p === persona);
                      return (
                        <TableRow key={originalIndex} hover>
                          <TableCell>{persona.nombre}</TableCell>
                          <TableCell>{persona.apellido}</TableCell>
                          <TableCell>{persona.cedula}</TableCell>
                          <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {persona.direccion}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Ver detalles">
                                <IconButton
                                  color="primary"
                                  onClick={() => handleView(persona)}
                                  size="small"
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Editar persona">
                                <IconButton
                                  color="warning"
                                  onClick={() => handleEdit(originalIndex)}
                                  size="small"
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar persona">
                                <IconButton
                                  color="error"
                                  onClick={() => handleDelete(originalIndex)}
                                  size="small"
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </Box>
            <TablePagination
              component="div"
              count={filteredPersonas.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[]}
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
              }
            />
          </CardContent>
        </Card>
      </Container>

      <Dialog open={!!detalle} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center' }}>
          <Visibility sx={{ mr: 1 }} />
          Detalle de Persona
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          {detalle && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Nombre</Typography>
                <Typography variant="body1" fontWeight="bold">{detalle.nombre}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Apellido</Typography>
                <Typography variant="body1" fontWeight="bold">{detalle.apellido}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Cédula</Typography>
                <Typography variant="body1" fontWeight="bold">{detalle.cedula}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Teléfono</Typography>
                <Typography variant="body1" fontWeight="bold">{detalle.telefono}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Correo Electrónico</Typography>
                <Typography variant="body1" fontWeight="bold">{detalle.correo}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Dirección</Typography>
                <Typography variant="body1" fontWeight="bold">{detalle.direccion}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Fecha de Nacimiento</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {new Date(detalle.fechaNacimiento).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} variant="contained" color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Persona;