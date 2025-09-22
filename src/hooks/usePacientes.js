import { useState } from 'react';
import { PacienteService } from '../services/pacienteService.js';

export const usePacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPacientes = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await PacienteService.getAll();
      setPacientes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando pacientes:', err);
      setError(err.message);
      setPacientes([]);
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    setPacientes([]);
    setError(null);
  };

  return {
    pacientes,
    loading,
    error,
    loadPacientes,
    clearData
  };
};