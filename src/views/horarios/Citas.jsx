// src/views/horarios/Citas.jsx
import React from 'react';
import ComingSoon from 'src/components/shared/ComingSoon';

export const Citas = () => {
  return (
    <ComingSoon
      title="Programar Citas"
      description="Sistema de agendamiento de citas para terapias y consultas"
      module="Horarios"
      progress={45}
    />
  );
};