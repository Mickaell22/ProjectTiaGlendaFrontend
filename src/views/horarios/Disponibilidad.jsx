// src/views/horarios/Disponibilidad.jsx
import React from 'react';
import ComingSoon from 'src/components/shared/ComingSoon';

export const Disponibilidad = () => {
  return (
    <ComingSoon
      title="Gestión de Disponibilidad"
      description="Configuración de horarios disponibles para profesionales y recursos"
      module="Horarios"
      progress={35}
    />
  );
};