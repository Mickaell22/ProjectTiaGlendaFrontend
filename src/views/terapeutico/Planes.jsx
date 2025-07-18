// src/views/terapeutico/Planes.jsx
import React from 'react';
import ComingSoon from 'src/components/shared/ComingSoon';

export const Planes = () => {
  return (
    <ComingSoon
      title="Planes de Tratamiento"
      description="Herramienta para diseñar y gestionar planes de tratamiento personalizados para cada paciente"
      module="Terapéutico"
      progress={25}
    />
  );
};