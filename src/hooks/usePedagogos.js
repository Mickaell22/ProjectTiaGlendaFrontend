import { useState } from 'react';
import { PersonalService } from '../services/personalService.js';

export const usePedagogos = () => {
  const [pedagogos, setPedagogos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPedagogos = async (filtros = {}) => {
    setLoading(true);
    setError(null);

    try {
      const data = await PersonalService.getAll();

      // Procesar los datos
      const personalData = Array.isArray(data) ? data : (data?.data || []);

      // Filtrar pedagogos por múltiples criterios
      let pedagogosData = personalData.filter(personal => {
        // Solo personal activo
        if (personal.estado && personal.estado !== 'activo') {
          return false;
        }

        // Filtrar por especialidades pedagógicas
        const tieneEspecialidadPedagogica = personal.especialidades?.some(esp =>
          esp.area === 'Especialidad pedagogica' ||
          esp.area === 'pedagogica' ||
          esp.nombre?.toLowerCase().includes('pedagog') ||
          esp.nombre?.toLowerCase().includes('educac')
        ) || (personal.cargo && (
          personal.cargo.toLowerCase().includes('pedagog') ||
          personal.cargo.toLowerCase().includes('educad') ||
          personal.cargo.toLowerCase().includes('maestr') ||
          personal.cargo.toLowerCase().includes('profesor')
        ));

        if (!tieneEspecialidadPedagogica) {
          return false;
        }

        // Filtrar por centro si se especifica
        if (filtros.centroId && personal.id_centro !== filtros.centroId) {
          return false;
        }

        // Filtrar por área específica si se especifica
        if (filtros.area) {
          const tieneArea = personal.especialidades?.some(esp =>
            esp.area === filtros.area
          );
          if (!tieneArea) {
            return false;
          }
        }

        return true;
      });

      // Enriquecer datos para el selector
      pedagogosData = pedagogosData.map(personal => ({
        ...personal,
        id: personal.id || personal.persona_id,
        nombre: personal.nombres || personal.nombre || '',
        apellido: personal.apellidos || personal.apellido || '',
        nombres: personal.nombres || personal.nombre || '',
        apellidos: personal.apellidos || personal.apellido || '',
        displayName: personal.nombre_completo ||
                     `${personal.nombres || personal.nombre || ''} ${personal.apellidos || personal.apellido || ''}`.trim(),
        especialidadesText: personal.especialidades?.map(e => e.nombre).join(', ') || personal.cargo || 'Pedagogo',
        centroNombre: personal.centro?.nombre || 'Centro no especificado'
      }));

      setPedagogos(pedagogosData);
    } catch (err) {
      console.error('Error cargando pedagogos:', err);
      setError(err.message);
      setPedagogos([]);
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    setPedagogos([]);
    setError(null);
  };

  return {
    pedagogos,
    loading,
    error,
    loadPedagogos,
    clearData
  };
};