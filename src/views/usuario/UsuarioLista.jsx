// src/views/usuarios/UsuarioLista.jsx
import React, { useState } from 'react';
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
  InputAdornment,
  Stack,
  Avatar,
  Chip,
  Tooltip,
  Typography,
  Box,
  MenuItem,
  Select,
  FormControl,

  useTheme
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  Search,
  Person,
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
import { FotoPerfilTabla } from '../../components/shared/index.js';

const purpleOutlineSX = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'primary.main' },
    '&:hover fieldset': { borderColor: 'primary.main' },
    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
  }
};

const UsuarioLista = ({
  usuarios,
  onEdit,
  onDelete,
  onViewDetail,
  onChangePassword,
  onNewUser,
  loading = false
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('activo');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { showError } = useSnackbar();

  let filteredUsuarios = UsuarioService.filterUsuarios(usuarios, searchTerm);
  filteredUsuarios = UsuarioService.filterByEstado(filteredUsuarios, filterEstado);

  return (
    <Card
      elevation={8}
      sx={{
        borderRadius: 4,
        mb: 4,
        backgroundColor: 'background.paper',
        border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
        overflow: 'hidden',
        width: '100%',
        maxWidth: { xs: '100%', sm: 800, md: 900 },
        mx: 'auto'
      }}
    >
      {/* Header morado */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center">
            <AdminPanelSettings sx={{ mr: 1 }} />
            Lista de Usuarios
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Filtra por nombre y estado y gestiona los usuarios del sistema
          </Typography>
        </Box>

        <Chip
          label={`${filteredUsuarios.length} usuario${filteredUsuarios.length !== 1 ? 's' : ''}`}
          color="default"
          sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
          size="small"
        />
      </Box>

      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        {/* Toolbar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
            flexWrap: 'nowrap',
            overflowX: 'auto',
            pb: 1,
            '& > *': { flex: '0 0 auto' }
          }}
        >
          <TextField
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, usuario, rol..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
            sx={{
              ...purpleOutlineSX,
              minWidth: 260,
              flex: '1 1 380px'
            }}
          />

          <FormControl size="small" sx={{ ...purpleOutlineSX, width: 160 }}>
            <Select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              displayEmpty
              renderValue={(val) => (val === '' ? 'Todos' : val === 'activo' ? 'Activo' : 'Inactivo')}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="activo">Activo</MenuItem>
              <MenuItem value="inactivo">Inactivo</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAdd />}
            onClick={onNewUser}
            sx={{ height: 40, px: 2, bgcolor: theme.palette.primary.main, color: theme.palette.getContrastText(theme.palette.primary.main), '&:hover': { bgcolor: theme.palette.primary.dark } }}
          >
            Nuevo Usuario
          </Button>
        </Box>

        {/* Tabla */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Usuario</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Centro</TableCell>
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
                const rolInfo = UsuarioService.getRolInfo(item.rol_id, item.rol_nombre || item.rol);

                return (
                  <TableRow key={item.id}>
                    {/* Usuario: foto, nombre y teléfono */}
                    <TableCell>
                      <Box display="flex" alignItems="flex-start">
                        <FotoPerfilTabla
                          rutaFoto={item.foto_perfil}
                          nombreCompleto={UsuarioService.getFullName(item)}
                          size={40}
                          sx={{ mr: 2 }}
                        />
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {UsuarioService.getFullName(item)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{item.usuario}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {contactInfo.telefono || 'Sin teléfono'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Rol */}
                    <TableCell>
                      <Chip
                        label={rolInfo.label}
                        color={rolInfo.color}
                        size="small"
                        icon={  
                          rolInfo.icon === 'AdminPanelSettings' ? <AdminPanelSettings /> :
                          rolInfo.icon === 'SupervisorAccount' ? <SupervisorAccount /> :
                          rolInfo.icon === 'Psychology' ? <Psychology /> :
                          rolInfo.icon === 'School' ? <School /> :
                          <Person />
                        }
                      />
                    </TableCell>

                    {/* Centro */}
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {item.centro_nombre || 'Centro Tía Glenda'}
                      </Typography>
                    </TableCell>

                    {/* Último Acceso */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" display="flex" alignItems="center" fontSize="0.75rem">
                          <AccessTime sx={{ fontSize: 14, mr: 0.5 }} />
                          {securityInfo.tiempoUltimoAcceso}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {securityInfo.ultimoAcceso}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Estado */}
                    <TableCell>
                      <Chip label={estadoInfo.label} color={estadoInfo.color} size="small" />
                      <Typography variant="caption" display="block" color="text.secondary">
                        Creado: {securityInfo.fechaCreacion}
                      </Typography>
                    </TableCell>

                    {/* Acciones */}
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Ver detalles">
                          <IconButton color="info" size="small" onClick={() => onViewDetail(item)}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cambiar contraseña">
                          <IconButton color="warning" size="small" onClick={() => onChangePassword(item.id)}>
                            <VpnKey />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton color="primary" size="small" onClick={() => onEdit(item)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton color="error" size="small" onClick={() => onDelete(item.id)}>
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
