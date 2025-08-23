// src/components/shared/FotoPerfil.jsx
import React from 'react';
import { Avatar, Tooltip } from '@mui/material';
import { Person } from '@mui/icons-material';
import FotoPerfilService from '../../services/fotoPerfilService.js';

/**
 * Componente reutilizable para mostrar fotos de perfil
 * @param {Object} props
 * @param {string} props.rutaFoto - Ruta de la foto de perfil
 * @param {string} props.nombreCompleto - Nombre completo del usuario para el tooltip
 * @param {number} props.size - Tamaño del avatar (por defecto 40)
 * @param {Object} props.sx - Estilos adicionales para el Avatar
 * @param {boolean} props.showTooltip - Mostrar tooltip con el nombre (por defecto true)
 * @param {string} props.variant - Variante del avatar ('circular', 'rounded', 'square')
 */
const FotoPerfil = ({
  rutaFoto,
  nombreCompleto = 'Usuario',
  size = 40,
  sx = {},
  showTooltip = true,
  variant = 'circular',
  ...props
}) => {
  // Generar URL de la foto si existe
  const urlFoto = FotoPerfilService.generarUrlFoto(rutaFoto);

  // Obtener iniciales del nombre para mostrar cuando no hay foto
  const obtenerIniciales = (nombre) => {
    if (!nombre) return 'U';
    
    const palabras = nombre.trim().split(' ');
    if (palabras.length === 1) {
      return palabras[0].charAt(0).toUpperCase();
    }
    
    return (palabras[0].charAt(0) + palabras[palabras.length - 1].charAt(0)).toUpperCase();
  };

  const avatar = (
    <Avatar
      src={urlFoto}
      alt={nombreCompleto}
      variant={variant}
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        bgcolor: 'primary.main',
        ...sx
      }}
      {...props}
    >
      {!urlFoto && (
        <>
          {nombreCompleto ? obtenerIniciales(nombreCompleto) : <Person />}
        </>
      )}
    </Avatar>
  );

  // Si no se debe mostrar tooltip, retornar solo el avatar
  if (!showTooltip) {
    return avatar;
  }

  // Retornar avatar con tooltip
  return (
    <Tooltip title={nombreCompleto} arrow>
      {avatar}
    </Tooltip>
  );
};

export default FotoPerfil;