// src/views/usuarios/UsuarioRoles.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  AdminPanelSettings,
  SupervisorAccount,
  Psychology,
  School,
  Person,
  Edit,
  Visibility,
  Group
} from '@mui/icons-material';

import UsuarioService from '../../services/usuarioService.js';
import useSnackbar from '../../hooks/useSnackbar.js';

const cardWidthSX = {
  width: '100%',
  maxWidth: { xs: '100%', sm: 800, md: 900 },
  mx: 'auto'
};

const UsuarioRoles = ({ usuarios = [] }) => {
  const [rolesStats, setRolesStats] = useState({});
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleDialog, setRoleDialog] = useState({ open: false, type: 'view', data: null });

  const { showError } = useSnackbar();

  useEffect(() => {
    calculateRolesStats();
  }, [usuarios]);

  const calculateRolesStats = () => {
    const stats = {};
    const roles = UsuarioService.getRoles();

    roles.forEach((rol) => {
      const usuariosConRol = usuarios.filter(
        (u) => u.rol_id === rol.value || u.rol_nombre === rol.label
      );
      stats[rol.value] = {
        ...rol,
        count: usuariosConRol.length,
        usuarios: usuariosConRol,
        activos: usuariosConRol.filter((u) => u.estado === 'activo').length,
        inactivos: usuariosConRol.filter((u) => u.estado === 'inactivo').length
      };
    });

    setRolesStats(stats);
  };

  const handleRoleClick = (roleKey) => {
    setSelectedRole(roleKey);
  };

  const handleViewRoleUsers = (roleKey) => {
    setRoleDialog({
      open: true,
      type: 'view',
      data: rolesStats[roleKey]
    });
  };

  const handleCloseDialog = () => {
    setRoleDialog({ open: false, type: 'view', data: null });
  };

  const getRoleIcon = (iconName) => {
    switch (iconName) {
      case 'AdminPanelSettings':
        return <AdminPanelSettings />;
      case 'SupervisorAccount':
        return <SupervisorAccount />;
      case 'Psychology':
        return <Psychology />;
      case 'School':
        return <School />;
      default:
        return <Person />;
    }
  };

  return (
    <Box>
      {/* Tarjeta resumen de roles */}
      <Card
        elevation={8}
        sx={{
          borderRadius: 4,
          mb: 4,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          overflow: 'hidden',
          ...cardWidthSX
        }}
      >
        {/* Header morado */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #7e57c2 0%, #673ab7 100%)',
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box display="flex" alignItems="center">
            <Group sx={{ mr: 1 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Gestión de Roles y Permisos
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Visualiza y gestiona los roles de usuario del sistema
              </Typography>
            </Box>
          </Box>

          <Chip
            label={`${Object.keys(rolesStats).length} roles`}
            color="default"
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            size="small"
          />
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Grid container spacing={2}>
            {Object.entries(rolesStats).map(([roleKey, roleData]) => (
              <Grid item xs={12} sm={6} md={6} key={roleKey}>
                <Card
                  elevation={selectedRole === roleKey ? 3 : 1}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 3,
                    border: selectedRole === roleKey ? '2px solid' : 'none',
                    borderColor: selectedRole === roleKey ? 'primary.main' : 'transparent',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                  onClick={() => handleRoleClick(roleKey)}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: `${roleData.color}.main`,
                        mx: 'auto',
                        mb: 2,
                        width: 56,
                        height: 56
                      }}
                    >
                      {getRoleIcon(roleData.icon)}
                    </Avatar>

                    <Typography variant="h6" gutterBottom>
                      {roleData.label}
                    </Typography>

                    <Chip label={`${roleData.count} usuarios`} color="primary" size="small" />

                    <Grid container spacing={1} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="success.main">
                          Activos: {roleData.activos}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="error.main">
                          Inactivos: {roleData.inactivos}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewRoleUsers(roleKey);
                      }}
                      sx={{ mt: 1 }}
                      startIcon={<Visibility />}
                    >
                      Ver Usuarios
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Detalle del rol seleccionado */}
      {selectedRole && rolesStats[selectedRole] && (
        <Card
          elevation={8}
          sx={{
            borderRadius: 4,
            mb: 4,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            overflow: 'hidden',
            ...cardWidthSX
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #7e57c2 0%, #673ab7 100%)',
              color: 'white',
              p: 2
            }}
          >
            <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center">
              {getRoleIcon(rolesStats[selectedRole].icon)}
              <Box ml={1}>Detalles del Rol: {rolesStats[selectedRole].label}</Box>
            </Typography>
          </Box>

          <CardContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              Este rol tiene {rolesStats[selectedRole].count} usuarios.
            </Alert>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Nombre de Usuario</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Último Acceso</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rolesStats[selectedRole].usuarios.map((usuario) => {
                  const estadoInfo = UsuarioService.getEstadoInfo(usuario.estado);
                  const securityInfo = UsuarioService.getSecurityInfo(usuario);

                  return (
                    <TableRow key={usuario.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                            <Person fontSize="small" />
                          </Avatar>
                          <Typography variant="body2">
                            {UsuarioService.getFullName(usuario)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{usuario.nombre_usuario}</TableCell>
                      <TableCell>
                        <Chip label={estadoInfo.label} color={estadoInfo.color} size="small" />
                      </TableCell>
                      <TableCell>{securityInfo.tiempoUltimoAcceso}</TableCell>
                      <TableCell>
                        <Tooltip title="Ver detalles">
                          <IconButton size="small" color="info">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton size="small" color="primary">
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog usuarios por rol */}
      <Dialog open={roleDialog.open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            {roleDialog.data && getRoleIcon(roleDialog.data.icon)}
            <Box ml={1}>Usuarios con rol: {roleDialog.data?.label}</Box>
            <Chip
              label={`${roleDialog.data?.count || 0} usuarios`}
              size="small"
              sx={{ ml: 2 }}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {roleDialog.data && roleDialog.data.usuarios.length > 0 ? (
            <List>
              {roleDialog.data.usuarios.map((usuario, index) => (
                <React.Fragment key={usuario.id}>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        <Person />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={UsuarioService.getFullName(usuario)}
                      secondary={
                        <Chip
                          label={UsuarioService.getEstadoInfo(usuario.estado).label}
                          color={UsuarioService.getEstadoInfo(usuario.estado).color}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                  {index < roleDialog.data.usuarios.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography variant="body2" align="center">
              No hay usuarios en este rol
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsuarioRoles;
