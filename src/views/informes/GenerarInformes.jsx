// src/views/informes/GenerarInformes.jsx
import React from 'react';
import ComingSoon from 'src/components/shared/ComingSoon';

export const GenerarInformes = () => {
  return (
    <ComingSoon
      title="Generar Informes"
      description="Herramienta para crear reportes personalizados y documentos oficiales"
      module="Informes"
      progress={40}
    />
  );
};