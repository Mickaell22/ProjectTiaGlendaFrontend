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
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
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
  Add,
  Security,
  Check,
  Close,
  Info,
  Group,
  Assignment,
  Visibility,
  Delete
} from '@mui/icons-material';

import UsuarioService from '../../services/usuarioService.js';
import useSnackbar from '../../hooks/useSnackbar.js';

const UsuarioRoles = ({ usuarios = [] }) => {
  const [rolesStats, setRolesStats] = useState({});
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleDialog, setRoleDialog] = useState({ open: false, type: 'view', data: null });
  const [loading, setLoading] = useState(false);

  const { showSuccess, showError } = useSnackbar();

  useEffect(() => {
    calculateRolesStats();
  }, [usuarios]);

  const calculateRolesStats = () => {
    const stats = {};
    const roles = UsuarioService.getRoles();
    
    roles.forEach(rol => {
      const usuariosConRol = usuarios.filter(u => u.rol_id === rol.value || u.rol_nombre === rol.label);
      stats[rol.value] = {
        ...rol,
        count: usuariosConRol.length,
        usuarios: usuariosConRol,
        activos: usuariosConRol.filter(u => u.estado === 'activo').length,
        inactivos: usuariosConRol.filter(u => u.estado === 'inactivo').length
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
      {/* Resumen de roles */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2} display="flex" alignItems="center">
            <Group sx={{ mr: 1 }} />
            Gestión de Roles y Permisos del Sistema
            <Chip 
              label={`${Object.keys(rolesStats).length} roles configurados`}
              color="primary"
              size="small"
              sx={{ ml: 2 }}
            />
          </Typography>

          <Grid container spacing={2}>
            {Object.entries(rolesStats).map(([roleKey, roleData]) => (
              <Grid item xs={12} sm={6} md={3} key={roleKey}>
                <Card 
                  elevation={selectedRole === roleKey ? 3 : 1}
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedRole === roleKey ? 2 : 0,
                    borderColor: selectedRole === roleKey ? 'primary.main' : 'transparent',
                    '&:hover': {
                      elevation: 2,
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
                    
                    <Box display="flex" justifyContent="center" gap={1} mb={2}>
                      <Chip 
                        label={`${roleData.count} usuarios`}
                        color="primary"
                        size="small"
                      />
                    </Box>

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

      {/* Información detallada del rol seleccionado */}
      {selectedRole && rolesStats[selectedRole] && (
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2} display="flex" alignItems="center">
              {getRoleIcon(rolesStats[selectedRole].icon)}
              <Box ml={1}>
                Detalles del Rol: {rolesStats[selectedRole].label}
              </Box>
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Este rol tiene asignados {rolesStats[selectedRole].count} usuarios en el sistema.
                {rolesStats[selectedRole].activos > 0 && ` ${rolesStats[selectedRole].activos} están activos.`}
                {rolesStats[selectedRole].inactivos > 0 && ` ${rolesStats[selectedRole].inactivos} están inactivos.`}
              </Typography>
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
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {usuario.nombre_usuario}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={estadoInfo.label}
                          color={estadoInfo.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {securityInfo.tiempoUltimoAcceso}
                        </Typography>
                      </TableCell>
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

            {rolesStats[selectedRole].usuarios.length === 0 && (
              <Box textAlign="center" py={4}>
                <Typography variant="body2" color="text.secondary">
                  No hay usuarios asignados a este rol
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog para ver usuarios de un rol */}
      <Dialog
        open={roleDialog.open}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            {roleDialog.data && getRoleIcon(roleDialog.data.icon)}
            <Box ml={1}>
              Usuarios con rol: {roleDialog.data?.label}
            </Box>
            <Chip 
              label={`${roleDialog.data?.count || 0} usuarios`}
              size="small"
              sx={{ ml: 2 }}
            />
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {roleDialog.data && (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Este rol incluye {roleDialog.data.activos} usuarios activos y {roleDialog.data.inactivos} inactivos.
                </Typography>
              </Alert>

              {roleDialog.data.usuarios.length > 0 ? (
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
                            <Box>
                              <Typography variant="caption" display="block">
                                Usuario: {usuario.nombre_usuario}
                              </Typography>
                              <Chip 
                                label={UsuarioService.getEstadoInfo(usuario.estado).label}
                                color={UsuarioService.getEstadoInfo(usuario.estado).color}
                                size="small"
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < roleDialog.data.usuarios.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="text.secondary">
                    No hay usuarios asignados a este rol
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsuarioRoles;