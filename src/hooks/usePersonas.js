import { useState } from 'react';
import { PersonaService } from '../services/personaService.js';

export const usePersonas = () => {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPersonas = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await PersonaService.getAll();
      setPersonas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando personas:', err);
      setError(err.message);
      setPersonas([]);
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    setPersonas([]);
    setError(null);
  };

  return {
    personas,
    loading,
    error,
    loadPersonas,
    clearData
  };
};