import React, { useEffect } from 'react';
import PersonSelector from './PersonSelector';
import { usePacientes } from '../../hooks/usePacientes';

const PacienteSelector = ({
  selectedPaciente = null,
  onSelect,
  className = "",
  placeholder = "Seleccionar paciente"
}) => {
  const { pacientes, loading, loadPacientes } = usePacientes();

  useEffect(() => {
    loadPacientes();
  }, []); // Sin dependencias problemáticas

  return (
    <PersonSelector
      persons={pacientes}
      loading={loading}
      selectedPerson={selectedPaciente}
      onSelect={onSelect}
      placeholder={placeholder}
      title="Seleccionar Paciente"
      emptyMessage="No hay pacientes registrados"
      className={className}
    />
  );
};

export default PacienteSelector;