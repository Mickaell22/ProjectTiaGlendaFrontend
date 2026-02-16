import React from 'react';
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack
} from '@mui/material';
import {
  AdminPanelSettings,
  Person,
  Phone,
  Email,
  Badge,
  CalendarToday,
  AccessTime,
  Security,
  Edit,
  VpnKey,
  Fingerprint,
  LocationOn,
  Work,
  School,
  Psychology,
  SupervisorAccount,
  Business
} from '@mui/icons-material';

import UsuarioService from '../../services/usuarioService.js';

const UsuarioDetalles = ({ 
  open, 
  onClose, 
  userData, 
  onEdit, 
  onChangePassword 
}) => {
  if (!userData) return null;

  let rolKey = userData.rol_nombre || userData.rol?.nombre || userData.rol?.id || userData.rol_id || userData.rol;
  if (typeof rolKey === 'object' && rolKey !== null) {
    rolKey = rolKey.nombre || rolKey.id || '';
  }
  if (typeof rolKey === 'string') {
    rolKey = rolKey.trim().toLowerCase();
  }

  const estadoInfo = UsuarioService.getEstadoInfo(userData.estado);
  const contactInfo = UsuarioService.getContactInfo(userData);
  const securityInfo = UsuarioService.getSecurityInfo(userData);
  const rolInfo = UsuarioService.getRolInfo(rolKey);

  const handleEdit = () => {
    onEdit(userData);
    onClose();
  };

  const handleChangePassword = () => {
    onChangePassword(userData.id);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <AdminPanelSettings sx={{ mr: 2 }} />
            Detalles del Usuario
          </Box>
          <Chip 
            label={estadoInfo.label}
            color={estadoInfo.color}
            icon={estadoInfo.color === 'success' ? <Person /> : <Security />}
          />
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Tarjeta de perfil principal */}
          <Grid item xs={12}>
            <Card elevation={2} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar 
                    src={userData.foto_perfil || undefined}
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      bgcolor: 'primary.main',
                      mr: 3,
                      fontSize: '2rem'
                    }}
                  >
                    {!userData.foto_perfil && <Person fontSize="large" />}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {UsuarioService.getFullName(userData)}
                    </Typography>
                    <Typography variant="h6" color="primary" gutterBottom>
                      @{userData.usuario}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Chip 
                        label={rolInfo.label}
                        color={rolInfo.color}
                      />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Información Personal */}
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
                  <Person sx={{ mr: 1 }} />
                  Información Personal
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Badge color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Nombre Completo"
                      secondary={UsuarioService.getFullName(userData)}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <Fingerprint color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Cédula de Identidad"
                      secondary={userData.cedula || 'No registrada'}
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <Phone color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Teléfono"
                      secondary={contactInfo.telefono}
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <Email color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Correo Electrónico"
                      secondary={contactInfo.correo}
                    />
                  </ListItem>

                  {userData.direccion && (
                    <ListItem>
                      <ListItemIcon>
                        <LocationOn color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Dirección"
                        secondary={userData.direccion}
                      />
                    </ListItem>
                  )}

                  <ListItem>
                    <ListItemIcon>
                      <Business color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Centro(s) de Trabajo"
                      secondary={
                        userData.centro_display ||
                        userData.centro_nombre ||
                        'Sin centro asignado'
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Información del Sistema */}
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
                  <Security sx={{ mr: 1 }} />
                  Información del Sistema
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <AdminPanelSettings color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Nombre de Usuario"
                      secondary={userData.usuario}
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <Work color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Rol del Sistema"
                      secondary={
                        <Chip 
                          label={rolInfo.label}
                          color={rolInfo.color}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      }
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <Security color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Estado de la Cuenta"
                      secondary={
                        <Chip 
                          label={estadoInfo.label}
                          color={estadoInfo.color}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      }
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <AccessTime color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Último Acceso"
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {securityInfo.ultimoAcceso}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {securityInfo.tiempoUltimoAcceso}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Información de Auditoría 
          <Grid item xs={12}>
            <Card elevation={1}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom display="flex" alignItems="center">
                  <CalendarToday sx={{ mr: 1 }} />
                  Información de Auditoría
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="caption" color="text.secondary">
                        Fecha de Creación
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {securityInfo.fechaCreacion}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="caption" color="text.secondary">
                        Última Modificación
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {securityInfo.fechaModificacion}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="caption" color="text.secondary">
                        Tiempo en el Sistema
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {securityInfo.tiempoCreacion || 'Calculando...'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="caption" color="text.secondary">
                        Estado de Seguridad
                      </Typography>
                      <Chip 
                        label={estadoInfo.color === 'success' ? 'Seguro' : 'Revisar'}
                        color={estadoInfo.color}
                        size="small"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>*/}
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Stack direction="row" spacing={1}>
          <Button 
            onClick={onClose}
            variant="outlined"
          >
            Cerrar
          </Button>
          <Button 
            onClick={handleChangePassword}
            variant="outlined"
            color="warning"
            startIcon={<VpnKey />}
          >
            Cambiar Contraseña
          </Button>
          <Button 
            onClick={handleEdit}
            variant="contained"
            startIcon={<Edit />}
          >
            Editar Usuario
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default UsuarioDetalles;