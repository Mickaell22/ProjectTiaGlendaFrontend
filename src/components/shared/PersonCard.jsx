import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Avatar,
  Button,
  IconButton,
  Chip,
  Box,
  Grid,
  Tooltip,
  Badge,
  Stack,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Person,
  SupervisorAccount,
  Phone,
  Email,
  Badge as BadgeIcon,
  StarBorder,
  Star,
  CheckCircle,
  RadioButtonUnchecked,
  Warning,
  CheckBox,
  CheckBoxOutlineBlank
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

const PersonCard = ({
  person,
  onSelect,
  viewMode = 'cards', // 'cards' | 'list'
  isFavorite = false,
  onToggleFavorite,
  enableFavorites = true,
  isSelected = false,
  multiple = false,
  index = 0
}) => {
  const theme = useTheme();

  const getSourceTypeIcon = () => {
    switch (person.sourceType) {
      case 'persona':
        return <Person />;
      case 'tutor':
        return <SupervisorAccount />;
      default:
        return <Person />;
    }
  };

  const getSourceTypeColor = () => {
    switch (person.sourceType) {
      case 'persona':
        return 'primary';
      case 'tutor':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  const getAvailabilityStatus = () => {
    if (person.isEditingPatient) {
      return {
        icon: <CheckCircle />,
        color: 'info',
        text: 'Editando',
        tooltip: 'Esta es la persona del paciente que estás editando'
      };
    } else if (person.isRegisteredPatient) {
      return {
        icon: <Warning />,
        color: 'warning',
        text: 'Ya es paciente',
        tooltip: 'Esta persona ya está registrada como paciente'
      };
    } else {
      return {
        icon: <CheckCircle />,
        color: 'success',
        text: 'Disponible',
        tooltip: 'Persona disponible para registro'
      };
    }
  };

  const getContactIcons = () => {
    const icons = [];
    if (person.telefono) {
      icons.push(
        <Tooltip key="phone" title={`Teléfono: ${person.telefono}`}>
          <Phone color="action" fontSize="small" />
        </Tooltip>
      );
    }
    if (person.correo) {
      icons.push(
        <Tooltip key="email" title={`Email: ${person.correo}`}>
          <Email color="action" fontSize="small" />
        </Tooltip>
      );
    }
    if (person.cedula) {
      icons.push(
        <Tooltip key="id" title={`Cédula: ${person.cedula}`}>
          <BadgeIcon color="action" fontSize="small" />
        </Tooltip>
      );
    }
    return icons;
  };

  const availability = getAvailabilityStatus();

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ scale: 1.02 }}
      >
        <Card
          elevation={isSelected ? 8 : 2}
          sx={{
            cursor: 'pointer',
            borderRadius: 2,
            transition: 'all 0.3s ease',
            border: isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
            bgcolor: isSelected ? 'primary.50' : 'background.paper',
            '&:hover': {
              elevation: 6,
              transform: 'translateY(-2px)',
              bgcolor: isSelected ? 'primary.100' : 'action.hover'
            }
          }}
          onClick={onSelect}
        >
          <ListItem sx={{ py: 2 }}>
            <ListItemAvatar>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Avatar
                    sx={{
                      width: 22,
                      height: 22,
                      bgcolor: `${availability.color}.main`,
                      border: `2px solid ${theme.palette.background.paper}`
                    }}
                  >
                    {React.cloneElement(availability.icon, { fontSize: 'small', color: 'inherit' })}
                  </Avatar>
                }
              >
                <Avatar
                  sx={{
                    bgcolor: `${getSourceTypeColor()}.main`,
                    width: 56,
                    height: 56,
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}
                >
                  {person.avatar}
                </Avatar>
              </Badge>
            </ListItemAvatar>

            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Typography variant="h6" fontWeight="bold">
                    {person.displayName}
                  </Typography>
                  <Chip
                    icon={getSourceTypeIcon()}
                    label={person.sourceType === 'persona' ? 'Persona' : 'Tutor'}
                    size="small"
                    color={getSourceTypeColor()}
                    variant="outlined"
                  />
                  <Tooltip title={availability.tooltip}>
                    <Chip
                      icon={availability.icon}
                      label={availability.text}
                      size="small"
                      color={availability.color}
                      variant="filled"
                    />
                  </Tooltip>
                </Box>
              }
              secondary={
                <Box mt={1}>
                  <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                    {person.cedula ? `Cédula: ${person.cedula}` : 'Sin cédula registrada'}
                  </Typography>
                  {person.contextInfo && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {person.contextInfo}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {getContactIcons()}
                  </Stack>
                </Box>
              }
            />

            <ListItemSecondaryAction>
              <Stack direction="row" spacing={1} alignItems="center">
                {enableFavorites && (
                  <Tooltip title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite();
                      }}
                      color={isFavorite ? 'warning' : 'default'}
                    >
                      {isFavorite ? <Star /> : <StarBorder />}
                    </IconButton>
                  </Tooltip>
                )}
                {multiple && (
                  <IconButton color={isSelected ? 'primary' : 'default'}>
                    {isSelected ? <CheckBox /> : <CheckBoxOutlineBlank />}
                  </IconButton>
                )}
                <Button
                  variant={isSelected ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                  }}
                >
                  {multiple ? (isSelected ? 'Quitar' : 'Agregar') : 'Seleccionar'}
                </Button>
              </Stack>
            </ListItemSecondaryAction>
          </ListItem>
        </Card>
      </motion.div>
    );
  }

  // Card view mode
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        elevation={isSelected ? 12 : 4}
        sx={{
          height: '100%',
          cursor: 'pointer',
          borderRadius: 3,
          transition: 'all 0.3s ease',
          border: isSelected ? `3px solid ${theme.palette.primary.main}` : '1px solid transparent',
          bgcolor: isSelected ? 'primary.50' : 'background.paper',
          position: 'relative',
          overflow: 'visible',
          '&:hover': {
            elevation: 8,
            bgcolor: isSelected ? 'primary.100' : 'action.hover',
            '& .person-card-actions': {
              opacity: 1,
              transform: 'translateY(0)'
            }
          }
        }}
        onClick={onSelect}
      >
        {/* Favorite star overlay */}
        {enableFavorites && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 2
            }}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              sx={{
                bgcolor: isFavorite ? 'warning.main' : 'background.paper',
                color: isFavorite ? theme.palette.warning.contrastText : 'text.secondary',
                boxShadow: theme.shadows[2],
                '&:hover': {
                  bgcolor: isFavorite ? 'warning.dark' : theme.palette.action.hover
                }
              }}
            >
              {isFavorite ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
            </IconButton>
          </Box>
        )}

        {/* Selection indicator for multiple mode */}
        {multiple && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 2
            }}
          >
            <IconButton
              size="small"
              color={isSelected ? 'primary' : 'default'}
              sx={{
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[2]
              }}
            >
              {isSelected ? <CheckBox /> : <CheckBoxOutlineBlank />}
            </IconButton>
          </Box>
        )}

        <CardContent sx={{ pb: 1 }}>
          {/* Avatar and basic info */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Tooltip title={availability.tooltip}>
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: `${availability.color}.main`,
                      border: `3px solid ${theme.palette.background.paper}`
                    }}
                  >
                    {React.cloneElement(availability.icon, { fontSize: 'small' })}
                  </Avatar>
                </Tooltip>
              }
            >
              <Avatar
                sx={{
                  bgcolor: `${getSourceTypeColor()}.main`,
                  width: 80,
                  height: 80,
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  mb: 1,
                  boxShadow: theme.shadows[4]
                }}
              >
                {person.avatar}
              </Avatar>
            </Badge>

            <Typography
              variant="h6"
              fontWeight="bold"
              textAlign="center"
              sx={{
                lineHeight: 1.2,
                mb: 0.5,
                color: isSelected ? 'primary.main' : 'text.primary'
              }}
            >
              {person.displayName}
            </Typography>

            <Chip
              icon={getSourceTypeIcon()}
              label={person.sourceType === 'persona' ? 'Persona' : 'Tutor'}
              size="small"
              color={getSourceTypeColor()}
              variant={isSelected ? 'filled' : 'outlined'}
            />
          </Box>

          {/* Details */}
          <Box textAlign="center" mb={2}>
            <Typography
              variant="body2"
              color="text.secondary"
              fontFamily="monospace"
              gutterBottom
            >
              {person.cedula ? `Cédula: ${person.cedula}` : 'Sin cédula'}
            </Typography>

            {person.contextInfo && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: '0.8rem',
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {person.contextInfo}
              </Typography>
            )}
          </Box>

          {/* Contact icons */}
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            alignItems="center"
            mb={2}
          >
            {getContactIcons()}
          </Stack>

          {/* Availability status */}
          <Box display="flex" justifyContent="center">
            <Tooltip title={availability.tooltip}>
              <Chip
                icon={availability.icon}
                label={availability.text}
                size="small"
                color={availability.color}
                variant="filled"
                sx={{
                  fontWeight: 'bold',
                  '& .MuiChip-icon': {
                    fontSize: '1rem'
                  }
                }}
              />
            </Tooltip>
          </Box>
        </CardContent>

        <CardActions
          className="person-card-actions"
          sx={{
            justifyContent: 'center',
            pt: 0,
            pb: 2,
            opacity: 0.7,
            transform: 'translateY(10px)',
            transition: 'all 0.3s ease'
          }}
        >
          <Button
            variant={isSelected ? 'contained' : 'outlined'}
            color="primary"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            sx={{
              borderRadius: 2,
              fontWeight: 'bold',
              py: 1
            }}
          >
            {multiple ? (isSelected ? 'Quitar' : 'Agregar') : 'Seleccionar'}
          </Button>
        </CardActions>
      </Card>
    </motion.div>
  );
};

export default PersonCard;