import React, { useEffect } from 'react';
import PersonSelector from './PersonSelector';
import { usePersonas } from '../../hooks/usePersonas';

const PersonaGeneralSelector = ({
  selectedPersona = null,
  onSelect,
  className = "",
  placeholder = "Seleccionar persona"
}) => {
  const { personas, loading, loadPersonas } = usePersonas();

  useEffect(() => {
    loadPersonas();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- carga intencional solo al montar/cambiar la clave
  }, []); // Sin dependencias problemáticas

  return (
    <PersonSelector
      persons={personas}
      loading={loading}
      selectedPerson={selectedPersona}
      onSelect={onSelect}
      placeholder={placeholder}
      title="Seleccionar Persona"
      emptyMessage="No hay personas disponibles"
      className={className}
    />
  );
};

export default PersonaGeneralSelector;