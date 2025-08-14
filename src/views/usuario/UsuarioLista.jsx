import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  IconButton,
  Grid,
  MenuItem,
  InputAdornment,
  Stack,
  Avatar,
  Chip,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Box
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  Search,
  Person,
  Phone,
  Email,
  PersonAdd,
  VpnKey,
  AdminPanelSettings,
  SupervisorAccount,
  AccessTime,
  Psychology,
  School
} from '@mui/icons-material';

import UsuarioService from '../../services/usuarioService.js';
import useSnackbar from '../../hooks/useSnackbar.js';

const UsuarioLista = ({ 
  usuarios, 
  onEdit, 
  onDelete, 
  onViewDetail, 
  onChangePassword, 
  onNewUser,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterRol, setFilterRol] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { showError } = useSnackbar();

  let filteredUsuarios = UsuarioService.filterUsuarios(usuarios, searchTerm);
  filteredUsuarios = UsuarioService.filterByEstado(filteredUsuarios, filterEstado);
  filteredUsuarios = UsuarioService.filterByRol(filteredUsuarios, filterRol);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" mb={2} display="flex" alignItems="center">
          <AdminPanelSettings sx={{ mr: 1 }} />
          Lista de Usuarios
          <Chip 
            label={`${filteredUsuarios.length} usuario${filteredUsuarios.length !== 1 ? 's' : ''}`} 
            color="primary" 
            size="small" 
            sx={{ ml: 2 }}
          />
        </Typography>
        
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Buscar usuarios"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
              placeholder="Buscar por nombre, usuario, rol..."
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                label="Estado"
              >
                <MenuItem value="">Todos</MenuItem>
                {UsuarioService.getEstados().map((estado) => (
                  <MenuItem key={estado.value} value={estado.value}>
                    {estado.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Rol</InputLabel>
              <Select
                value={filterRol}
                onChange={(e) => setFilterRol(e.target.value)}
                label="Rol"
              >
                <MenuItem value="">Todos los roles</MenuItem>
                {UsuarioService.getRoles().map((rol) => (
                  <MenuItem key={rol.value} value={rol.value}>
                    {rol.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={onNewUser}
              sx={{ height: '40px' }}
            >
              Nuevo Usuario
            </Button>
          </Grid>
        </Grid>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Usuario</TableCell>
              <TableCell>Nombre de Usuario</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Último Acceso</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsuarios
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item) => {
                const estadoInfo = UsuarioService.getEstadoInfo(item.estado);
                const contactInfo = UsuarioService.getContactInfo(item);
                const securityInfo = UsuarioService.getSecurityInfo(item);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {UsuarioService.getFullName(item)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="flex" alignItems="center">
                            <Phone sx={{ fontSize: '12px', mr: 0.5 }} />
                            {contactInfo.telefono}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="flex" alignItems="center">
                            <Email sx={{ fontSize: '12px', mr: 0.5 }} />
                            {contactInfo.correo}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {item.nombre_usuario}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {item.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const rolInfo = UsuarioService.getRolInfo(item.rol_nombre || item.rol);
                        return (
                          <Chip 
                            label={rolInfo.label} 
                            color={rolInfo.color}
                            size="small"
                            icon={rolInfo.icon === 'AdminPanelSettings' ? <AdminPanelSettings /> :
                                  rolInfo.icon === 'SupervisorAccount' ? <SupervisorAccount /> :
                                  rolInfo.icon === 'Psychology' ? <Psychology /> :
                                  rolInfo.icon === 'School' ? <School /> :
                                  <Person />}
                          />
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" display="flex" alignItems="center" fontSize="0.75rem">
                          <AccessTime sx={{ fontSize: '14px', mr: 0.5 }} />
                          {securityInfo.tiempoUltimoAcceso}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {securityInfo.ultimoAcceso}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={estadoInfo.label} 
                        color={estadoInfo.color}
                        size="small"
                      />
                      <Typography variant="caption" display="block" color="text.secondary">
                        Creado: {securityInfo.fechaCreacion}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Ver detalles">
                          <IconButton 
                            color="info" 
                            size="small"
                            onClick={() => onViewDetail(item)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cambiar contraseña">
                          <IconButton 
                            color="warning" 
                            size="small"
                            onClick={() => onChangePassword(item.id)}
                          >
                            <VpnKey />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton 
                            color="primary" 
                            size="small"
                            onClick={() => onEdit(item)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton 
                            color="error" 
                            size="small"
                            onClick={() => onDelete(item.id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filteredUsuarios.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </CardContent>
    </Card>
  );
};

export default UsuarioLista;