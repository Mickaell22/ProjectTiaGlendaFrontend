// src/components/shared/FotoPerfil.jsx
import React, { useState, useEffect } from 'react';
import { Avatar, Tooltip } from '@mui/material';
import { Person } from '@mui/icons-material';
import FotoPerfilService from '../../services/fotoPerfilService.js';

/**
 * Componente reutilizable para mostrar fotos de perfil
 * Carga la imagen con headers de autorizacion (Bearer token)
 * @param {Object} props
 * @param {string} props.rutaFoto - Ruta de la foto de perfil
 * @param {string} props.nombreCompleto - Nombre completo del usuario para el tooltip
 * @param {number} props.size - Tamano del avatar (por defecto 40)
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
  const [imageSrc, setImageSrc] = useState(null);

  // Obtener iniciales del nombre para mostrar cuando no hay foto
  const obtenerIniciales = (nombre) => {
    if (!nombre) return 'U';

    const palabras = nombre.trim().split(' ');
    if (palabras.length === 1) {
      return palabras[0].charAt(0).toUpperCase();
    }

    return (palabras[0].charAt(0) + palabras[palabras.length - 1].charAt(0)).toUpperCase();
  };

  // Cargar imagen con autorizacion
  useEffect(() => {
    const loadImage = async () => {
      if (!rutaFoto) {
        setImageSrc(null);
        return;
      }

      try {
        const photoUrl = FotoPerfilService.generarUrlFoto(rutaFoto);
        const token = localStorage.getItem('jwt_token');

        if (!token) {
          setImageSrc(null);
          return;
        }

        const response = await fetch(photoUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const blob = await response.blob();
          const objectURL = URL.createObjectURL(blob);
          setImageSrc(objectURL);
        } else {
          setImageSrc(null);
        }
      } catch (error) {
        console.error('Error loading image:', error);
        setImageSrc(null);
      }
    };

    loadImage();

    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [rutaFoto]);

  // Cleanup cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc]);

  const avatar = (
    <Avatar
      src={imageSrc}
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
      {!imageSrc && (
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
