// src/components/shared/FotoPerfilConAutorizacion.jsx
import React, { useState, useEffect } from 'react';
import { Avatar, Tooltip } from '@mui/material';
import { Person } from '@mui/icons-material';
import FotoPerfilService from '../../services/fotoPerfilService.js';

/**
 * Componente de foto de perfil que maneja autorización correctamente
 * Convierte la imagen a blob para poder mostrarla con headers de autorización
 */
const FotoPerfilConAutorizacion = ({
  rutaFoto,
  nombreCompleto = 'Usuario',
  size = 40,
  sx = {},
  showTooltip = true,
  variant = 'circular',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);

  // Obtener iniciales del nombre para mostrar cuando no hay foto
  const obtenerIniciales = (nombre) => {
    if (!nombre) return 'U';
    
    const palabras = nombre.trim().split(' ');
    if (palabras.length === 1) {
      return palabras[0].charAt(0).toUpperCase();
    }
    
    return (palabras[0].charAt(0) + palabras[palabras.length - 1].charAt(0)).toUpperCase();
  };

  // Cargar imagen con autorización
  useEffect(() => {
    const loadImage = async () => {
      if (!rutaFoto) {
        setImageSrc(null);
        return;
      }

      try {
        setLoading(true);

        const photoUrl = FotoPerfilService.generarUrlFoto(rutaFoto);
        const token = localStorage.getItem('jwt_token');

        if (!token) {
          setImageSrc(null);
          return;
        }

        // Fetch imagen con headers de autorización
        const response = await fetch(photoUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          // Convertir a blob y crear URL temporal
          const blob = await response.blob();
          const objectURL = URL.createObjectURL(blob);
          setImageSrc(objectURL);
        } else {
          setImageSrc(null);
        }
      } catch (error) {
        console.error('💥 Error loading image:', error);
        setImageSrc(null);
      } finally {
        setLoading(false);
      }
    };

    loadImage();

    // Cleanup function para liberar la URL del blob
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
        bgcolor: loading ? 'grey.300' : 'primary.main',
        ...sx
      }}
      {...props}
    >
      {!imageSrc && !loading && (
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

export default FotoPerfilConAutorizacion;