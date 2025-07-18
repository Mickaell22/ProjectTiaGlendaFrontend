// src/views/pedagogico/ProgresoAcademico.jsx
import React from 'react';
import ComingSoon from 'src/components/shared/ComingSoon';

export const ProgresoAcademico = () => {
  return (
    <ComingSoon
      title="Progreso Académico"
      description="Seguimiento detallado del avance académico y logros educativos de los alumnos"
      module="Pedagógico"
      progress={30}
    />
  );
};