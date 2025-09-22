import { useState } from 'react';
import { PersonalService } from '../services/personalService.js';

export const useTerapeutas = () => {
  const [terapeutas, setTerapeutas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTerapeutas = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await PersonalService.getAll();

      // Filtrar solo terapeutas
      const personalData = Array.isArray(data) ? data : [];
      const terapeutasData = personalData.filter(personal =>
        personal.especialidad &&
        personal.especialidad.toLowerCase().includes('terapeuta')
      );

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