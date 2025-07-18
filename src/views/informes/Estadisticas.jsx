// src/views/informes/Estadisticas.jsx
import React from 'react';
import ComingSoon from 'src/components/shared/ComingSoon';

export const Estadisticas = () => {
  return (
    <ComingSoon
      title="Estadísticas"
      description="Dashboard con métricas y análisis estadísticos del centro"
      module="Informes"
      progress={55}
    />
  );
};