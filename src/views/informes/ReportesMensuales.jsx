/ src/views/informes/ReportesMensuales.jsx
import React from 'react';
import ComingSoon from 'src/components/shared/ComingSoon';

export const ReportesMensuales = () => {
  return (
    <ComingSoon
      title="Reportes Mensuales"
      description="Generación automática de reportes mensuales consolidados"
      module="Informes"
      progress={25}
    />
  );
};