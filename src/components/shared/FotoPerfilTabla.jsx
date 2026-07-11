// src/components/shared/FotoPerfilTabla.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Tooltip } from '@mui/material';
import { Person } from '@mui/icons-material';
import FotoPerfilService from '../../services/fotoPerfilService.js';

/**
 * Componente de foto de perfil optimizado para tablas
 * Carga la imagen solo cuando es visible (lazy loading)
 */
const FotoPerfilTabla = ({
  rutaFoto,
  nombreCompleto = 'Usuario',
  size = 40,
  sx = {},
  showTooltip = true,
  variant = 'circular',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const avatarRef = useRef(null);

  // Obtener iniciales del nombre para mostrar cuando no hay foto
  const obtenerIniciales = (nombre) => {
    if (!nombre) return 'U';
    
    const palabras = nombre.trim().split(' ');
    if (palabras.length === 1) {
      return palabras[0].charAt(0).toUpperCase();
    }
    
    return (palabras[0].charAt(0) + palabras[palabras.length - 1].charAt(0)).toUpperCase();
  };

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (!rutaFoto) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const node = avatarRef.current;
    if (node) {
      observer.observe(node);
    }

    return () => {
      if (node) {
        observer.unobserve(node);
      }
    };
  }, [rutaFoto]);

  // Cargar imagen solo cuando es visible
  useEffect(() => {
    const loadImage = async () => {
      if (!rutaFoto || !isVisible || loading || imageSrc) return;

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
        console.error('💥 Error loading table image:', error);
        setImageSrc(null);
      } finally {
        setLoading(false);
      }
    };

    loadImage();

    // Cleanup function
    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- carga intencional solo al montar/cambiar la clave
  }, [rutaFoto, isVisible]);

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
      ref={avatarRef}
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

export default FotoPerfilTabla;