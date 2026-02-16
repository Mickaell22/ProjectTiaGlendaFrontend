import { useState } from 'react';
import { PersonalService } from '../services/personalService.js';

export const useTerapeutas = () => {
  const [terapeutas, setTerapeutas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTerapeutas = async (filtros = {}) => {
    setLoading(true);
    setError(null);

    try {
      const data = await PersonalService.getAll();

      // Procesar los datos
      const personalData = Array.isArray(data) ? data : (data?.data || []);

      // Filtrar terapeutas por múltiples criterios
      let terapeutasData = personalData.filter(personal => {
        // Solo personal activo
        if (personal.estado && personal.estado !== 'activo') {
          return false;
        }

        // Filtrar por especialidades terapéuticas
        const tieneEspecialidadTerapeutica = personal.especialidades?.some(esp =>
          esp.area === 'Especialidad terapeutica' ||
          esp.area === 'terapeutica' ||
          esp.nombre?.toLowerCase().includes('terapeut') ||
          esp.nombre?.toLowerCase().includes('terapia')
        ) || (personal.cargo && (
          personal.cargo.toLowerCase().includes('terapeut') ||
          personal.cargo.toLowerCase().includes('terapia')
        ));

        if (!tieneEspecialidadTerapeutica) {
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
      terapeutasData = terapeutasData.map(personal => ({
        ...personal,
        id: personal.id || personal.persona_id,
        nombre: personal.nombres || personal.nombre || '',
        apellido: personal.apellidos || personal.apellido || '',
        nombres: personal.nombres || personal.nombre || '',
        apellidos: personal.apellidos || personal.apellido || '',
        displayName: personal.nombre_completo ||
                     `${personal.nombres || personal.nombre || ''} ${personal.apellidos || personal.apellido || ''}`.trim(),
        especialidadesText: personal.especialidades?.map(e => e.nombre).join(', ') || personal.cargo || 'Terapeuta',
        centroNombre: personal.centro?.nombre || 'Centro no especificado'
      }));

      setTerapeutas(terapeutasData);
    } catch (err) {
      console.error('Error cargando terapeutas:', err);
      setError(err.message);
      setTerapeutas([]);
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    setTerapeutas([]);
    setError(null);
  };

  return {
    terapeutas,
    loading,
    error,
    loadTerapeutas,
    clearData
  };
};