// src/components/chat/ConversationList.jsx
import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Badge,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const ConversationList = ({
  conversations = [],
  activeConversation = null,
  onSelectConversation = () => {},
  onNewConversation = () => {},
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar conversaciones por término de búsqueda
  const filteredConversations = conversations.filter(conversation =>
    conversation.nombre_contacto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.ultimo_mensaje?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Formatear fecha para mostrar de forma amigable
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: es 
      });
    } catch {
      return '';
    }
  };

  /**
   * Obtener iniciales del nombre para el avatar
   */
  const getInitials = (name) => {
    if (!name) return 'U';
    
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || 'U';
  };

  /**
   * Truncar mensaje largo
   */
  const truncateMessage = (message, maxLength = 40) => {
    if (!message) return 'Sin mensajes';
    if (message.length <= maxLength) return message;
    return `${message.substring(0, maxLength)}...`;
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Barra de búsqueda */}
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar conversaciones..."
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

      {/* Botón nueva conversación */}
      <Box sx={{ px: 2, pb: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onNewConversation}
          size="small"
        >
          Nueva conversación
        </Button>
      </Box>

      {/* Lista de conversaciones */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : filteredConversations.length === 0 ? (
          <Box sx={{ p: 2 }}>
            {conversations.length === 0 ? (
              <Alert severity="info" sx={{ textAlign: 'center' }}>
                No tienes conversaciones aún.
                <br />
                <Button
                  size="small"
                  onClick={onNewConversation}
                  sx={{ mt: 1 }}
                >
                  Iniciar primera conversación
                </Button>
              </Alert>
            ) : (
              <Alert severity="info">
                No se encontraron conversaciones que coincidan con "{searchTerm}"
              </Alert>
            )}
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {filteredConversations.map((conversation, index) => (
              <ListItem key={`conversation-${conversation.id_contacto}-${index}`} disablePadding>
                <ListItemButton
                  selected={activeConversation?.id_contacto === conversation.id_contacto}
                  onClick={() => onSelectConversation(conversation)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    '&.Mui-selected': {
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.light',
                      },
                    },
                  }}
                >
                  {/* Avatar */}
                  <ListItemAvatar>
                    <Badge
                      badgeContent={conversation.no_leidos || 0}
                      color="error"
                      max={99}
                      invisible={!conversation.no_leidos}
                    >
                      <Avatar
                        src={conversation.avatar}
                        sx={{
                          bgcolor: 'secondary.main',
                          width: 40,
                          height: 40,
                        }}
                      >
                        {conversation.avatar ? null : (
                          getInitials(conversation.nombre_contacto)
                        )}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>

                  {/* Contenido */}
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle2"
                        noWrap
                        sx={{
                          fontWeight: conversation.no_leidos > 0 ? 600 : 400,
                        }}
                      >
                        {conversation.nombre_contacto || 'Usuario'}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          sx={{
                            fontWeight: conversation.no_leidos > 0 ? 500 : 400,
                          }}
                        >
                          {truncateMessage(conversation.ultimo_mensaje)}
                        </Typography>
                        {conversation.fecha_ultimo_mensaje && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: '0.75rem' }}
                          >
                            {formatDate(conversation.fecha_ultimo_mensaje)}
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

export default ConversationList;