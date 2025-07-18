// src/views/terapeutico/Evaluaciones.jsx
import React from 'react';
import ComingSoon from 'src/components/shared/ComingSoon';

const Evaluaciones = () => {
  return (
    <ComingSoon
      title="Evaluaciones Terapéuticas"
      description="Sistema para crear, gestionar y realizar seguimiento de evaluaciones terapéuticas de pacientes"
      module="Terapéutico"
      progress={30}
    />
  );
};

export default Evaluaciones;