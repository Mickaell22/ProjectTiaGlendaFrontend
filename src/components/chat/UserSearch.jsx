// src/components/chat/UserSearch.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import chatService from '../../services/chatService';

const UserSearch = ({ 
  onSelectUser = () => {}, 
  onBack = () => {} 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar usuarios disponibles al montar el componente
  useEffect(() => {
    loadAvailableUsers();
  }, []);

  // Filtrar usuarios cuando cambia el término de búsqueda
  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  /**
   * Cargar lista de usuarios disponibles para chat
   */
  const loadAvailableUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await chatService.getUsuariosDisponibles();
      if (result.success) {
        setUsers(result.usuarios);
      } else {
        setError(result.error || 'Error al cargar usuarios');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setError('Error al cargar usuarios disponibles');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Filtrar usuarios según el término de búsqueda
   */
  const filterUsers = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = users.filter(user => {
      const fullName = `${user.nombre || ''} ${user.apellido || ''}`.toLowerCase();
      const username = (user.username || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const rol = (user.rol || '').toLowerCase();
      
      return (
        fullName.includes(term) ||
        username.includes(term) ||
        email.includes(term) ||
        rol.includes(term)
      );
    });

    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  /**
   * Obtener iniciales del nombre para el avatar
   */
  const getInitials = (user) => {
    if (!user) return 'U';
    
    const nombre = user.nombre || '';
    const apellido = user.apellido || '';
    
    if (nombre && apellido) {
      return `${nombre[0]}${apellido[0]}`.toUpperCase();
    } else if (nombre) {
      return nombre.substring(0, 2).toUpperCase();
    } else if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    
    return 'U';
  };

  /**
   * Formatear nombre completo del usuario
   */
  const getFullName = (user) => {
    const nombre = user.nombre || '';
    const apellido = user.apellido || '';
    
    if (nombre && apellido) {
      return `${nombre} ${apellido}`;
    } else if (nombre) {
      return nombre;
    } else if (user.username) {
      return user.username;
    }
    
    return 'Usuario';
  };

  /**
   * Obtener color del rol
   */
  const getRolColor = (rol) => {
    switch (rol?.toLowerCase()) {
      case 'administrador':
        return 'error';
      case 'medico':
      case 'doctor':
        return 'primary';
      case 'enfermero':
      case 'enfermera':
        return 'secondary';
      case 'recepcionista':
        return 'info';
      case 'terapeuta':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header con botón volver */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={onBack} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Nuevo chat
        </Typography>
      </Box>

      {/* Barra de búsqueda */}
      <Box sx={{ px: 2, pb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar usuarios por nombre, email o rol..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchTerm('')}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Lista de usuarios */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2 }}>
            <Alert 
              severity="error"
              action={
                <IconButton
                  color="inherit"
                  size="small"
                  onClick={loadAvailableUsers}
                >
                  <SearchIcon />
                </IconButton>
              }
            >
              {error}
            </Alert>
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Alert severity="info">
              {users.length === 0 
                ? 'No hay usuarios disponibles para chat'
                : `No se encontraron usuarios que coincidan con "${searchTerm}"`
              }
            </Alert>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {filteredUsers.map((user) => (
              <ListItem key={user.id || user.username} disablePadding>
                <ListItemButton
                  onClick={() => onSelectUser(user)}
                  sx={{ py: 1.5, px: 2 }}
                >
                  {/* Avatar */}
                  <ListItemAvatar>
                    <Avatar
                      src={user.avatar}
                      sx={{
                        bgcolor: 'secondary.main',
                        width: 40,
                        height: 40,
                      }}
                    >
                      {getInitials(user)}
                    </Avatar>
                  </ListItemAvatar>

                  {/* Información del usuario */}
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          {getFullName(user)}
                        </Typography>
                        {user.rol && (
                          <Chip
                            label={user.rol}
                            size="small"
                            color={getRolColor(user.rol)}
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        {user.username && (
                          <Typography variant="body2" color="text.secondary">
                            @{user.username}
                          </Typography>
                        )}
                        {user.email && (
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        )}
                        {user.especialidad && (
                          <Typography variant="caption" color="text.secondary">
                            {user.especialidad}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default UserSearch;