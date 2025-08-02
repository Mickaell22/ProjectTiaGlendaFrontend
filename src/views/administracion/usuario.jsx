import React, { useState } from 'react';
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
  Snackbar,
  Alert,
  Tooltip,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';

const datosQuemados = [
  { id: 1, nombre: 'Juan', correo: 'juan@example.com', rol: 'Admin' },
  { id: 2, nombre: 'Ana', correo: 'ana@example.com', rol: 'Usuario' },
  { id: 3, nombre: 'Luis', correo: 'luis@example.com', rol: 'Editor' },
  { id: 4, nombre: 'Elena', correo: 'elena@example.com', rol: 'Invitado' },
];

const Usuario = () => {
  const [usuarios, setUsuarios] = useState(datosQuemados);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(5);
  const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', correo: '', rol: '' });
  const [errores, setErrores] = useState({});
  const [alerta, setAlerta] = useState({ abierta: false, mensaje: '', severidad: 'success' });
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const validar = () => {
    const erroresTemp = {};
    if (!nuevoUsuario.nombre) erroresTemp.nombre = 'Nombre requerido';
    if (!nuevoUsuario.correo || !/\S+@\S+\.\S+/.test(nuevoUsuario.correo)) erroresTemp.correo = 'Correo válido requerido';
    if (!nuevoUsuario.rol) erroresTemp.rol = 'Rol requerido';
    setErrores(erroresTemp);
    return Object.keys(erroresTemp).length === 0;
  };

  const manejarCambio = (e) => {
    setNuevoUsuario({ ...nuevoUsuario, [e.target.name]: e.target.value });
  };

  const agregarUsuario = () => {
    if (!validar()) return;
    const nuevo = { ...nuevoUsuario, id: usuarios.length + 1 };
    setUsuarios([...usuarios, nuevo]);
    setNuevoUsuario({ nombre: '', correo: '', rol: '' });
    setAlerta({ abierta: true, mensaje: 'Usuario agregado correctamente', severidad: 'success' });
  };

  const manejarBusqueda = (e) => {
    setBusqueda(e.target.value.toLowerCase());
    setPagina(0);
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre.toLowerCase().includes(busqueda) ||
    u.correo.toLowerCase().includes(busqueda) ||
    u.rol.toLowerCase().includes(busqueda)
  );

  const mostrarDetalles = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setDetalleAbierto(true);
  };

  return (
    <Box p={2} sx={{ ml: { lg: 2, md: 2, sm: 1, xs: 0 } }}>
      <Container maxWidth="md" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
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
            <Typography variant="h4" fontWeight="bold" color="black">
              Gestión de Usuarios
            </Typography>
          </Box>
        </Paper>

        {/* Aquí continúa el contenido original */}

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Registrar nuevo usuario</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Nombre"
                name="nombre"
                value={nuevoUsuario.nombre}
                onChange={manejarCambio}
                fullWidth
                error={!!errores.nombre}
                helperText={errores.nombre}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Correo"
                name="correo"
                value={nuevoUsuario.correo}
                onChange={manejarCambio}
                fullWidth
                error={!!errores.correo}
                helperText={errores.correo}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Rol"
                name="rol"
                value={nuevoUsuario.rol}
                onChange={manejarCambio}
                fullWidth
                error={!!errores.rol}
                helperText={errores.rol}
              />
            </Grid>
          </Grid>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={agregarUsuario}
          >
            Agregar
          </Button>
        </Paper>

        <Box sx={{ mb: 2 }}>
          <TextField
            label="Buscar usuarios"
            variant="outlined"
            fullWidth
            value={busqueda}
            onChange={manejarBusqueda}
          />
        </Box>

        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Correo</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuariosFiltrados
                .slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina)
                .map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.nombre}</TableCell>
                    <TableCell>{u.correo}</TableCell>
                    <TableCell>{u.rol}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalles">
                        <IconButton onClick={() => mostrarDetalles(u)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={usuariosFiltrados.length}
            page={pagina}
            onPageChange={(e, nuevaPagina) => setPagina(nuevaPagina)}
            rowsPerPage={filasPorPagina}
            onRowsPerPageChange={(e) => {
              setFilasPorPagina(parseInt(e.target.value, 10));
              setPagina(0);
            }}
          />
        </Paper>

        <Dialog open={detalleAbierto} onClose={() => setDetalleAbierto(false)} fullWidth>
          <DialogTitle>Detalle del Usuario</DialogTitle>
          <DialogContent>
            {usuarioSeleccionado && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">{usuarioSeleccionado.nombre}</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography><strong>Correo:</strong> {usuarioSeleccionado.correo}</Typography>
                  <Typography><strong>Rol:</strong> {usuarioSeleccionado.rol}</Typography>
                </CardContent>
              </Card>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetalleAbierto(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={alerta.abierta}
          autoHideDuration={4000}
          onClose={() => setAlerta({ ...alerta, abierta: false })}
        >
          <Alert severity={alerta.severidad} variant="filled">
            {alerta.mensaje}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Usuario;
