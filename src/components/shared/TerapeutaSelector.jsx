import React, { useEffect } from 'react';
import PersonSelector from './PersonSelector';
import { useTerapeutas } from '../../hooks/useTerapeutas';

const TerapeutaSelector = ({
  selectedTerapeuta = null,
  onSelect,
  className = "",
  placeholder = "Seleccionar terapeuta"
}) => {
  const { terapeutas, loading, loadTerapeutas } = useTerapeutas();

  useEffect(() => {
    // Cargar terapeutas sin filtros visibles para el usuario
    loadTerapeutas();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- carga intencional solo al montar/cambiar la clave
  }, []);

  return (
    <PersonSelector
      persons={terapeutas}
      loading={loading}
      selectedPerson={selectedTerapeuta}
      onSelect={onSelect}
      placeholder={placeholder}
      title="Seleccionar Terapeuta"
      emptyMessage="No hay terapeutas disponibles"
      className={className}
    />
  );
};

export default TerapeutaSelector;