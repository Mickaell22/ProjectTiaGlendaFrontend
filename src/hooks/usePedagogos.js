import { useState } from 'react';
import { PersonalService } from '../services/personalService.js';

export const usePedagogos = () => {
  const [pedagogos, setPedagogos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPedagogos = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await PersonalService.getAll();

      // Filtrar solo pedagogos
      const personalData = Array.isArray(data) ? data : [];
      const pedagogosData = personalData.filter(personal =>
        personal.especialidad &&
        personal.especialidad.toLowerCase().includes('pedagog')
      );

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