// src/views/terapeutico/Seguimiento.jsx
import React from 'react';
import ComingSoon from 'src/components/shared/ComingSoon';

export const Seguimiento = () => {
  return (
    <ComingSoon
      title="Seguimiento Terapéutico"
      description="Monitor del progreso y evolución de los pacientes en sus tratamientos terapéuticos"
      module="Terapéutico"
      progress={20}
    />
  );
};