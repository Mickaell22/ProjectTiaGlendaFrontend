// src/contexts/ConfigContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import ConfiguracionService from '../services/configuracionService';

const ConfigContext = createContext();

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig debe usarse dentro de ConfigProvider');
  }
  return context;
};

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({
    nombreCentro: '',
    direccion: '',
    telefono: '',
    email: '',
    horarioInicio: '08:00',
    horarioFin: '17:00',
    zonaHoraria: 'America/Guayaquil',
    formatoFecha: 'DD/MM/YYYY',
    formatoHora: '24h',
    moneda: 'USD',
    idioma: 'es',
    descripcion: ''
  });
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Solo cargar configuracion si hay token (usuario autenticado)
    const token = localStorage.getItem('jwt_token');
    if (token && !initialized) {
      fetchConfiguracion();
    }
  }, [initialized]);

  const fetchConfiguracion = async () => {
    // No intentar cargar si no hay token
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await ConfiguracionService.getResumenConfiguracion();

      if (result.success && result.data?.general) {
        const generalConfig = ConfiguracionService.mapGeneralConfigToFrontend(result.data.general);
        setConfig(generalConfig);
        setInitialized(true);
      }
    } catch (error) {
      console.error('Error al cargar configuracion:', error);
      // En caso de error (401, etc), no reintentar constantemente
      setInitialized(true);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (newConfig) => {
    setConfig(prevConfig => ({ ...prevConfig, ...newConfig }));
  };

  const initConfig = () => {
    setInitialized(false);
  };

  const value = {
    config,
    loading,
    updateConfig,
    refreshConfig: fetchConfiguracion,
    initConfig
  };

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

export default ConfigContext;
