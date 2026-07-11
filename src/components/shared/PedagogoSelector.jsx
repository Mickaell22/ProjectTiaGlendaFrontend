import React, { useEffect } from 'react';
import PersonSelector from './PersonSelector';
import { usePedagogos } from '../../hooks/usePedagogos';

const PedagogoSelector = ({
  selectedPedagogo = null,
  onSelect,
  className = "",
  placeholder = "Seleccionar pedagogo"
}) => {
  const { pedagogos, loading, loadPedagogos } = usePedagogos();

  useEffect(() => {
    loadPedagogos();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- carga intencional solo al montar/cambiar la clave
  }, []); // Sin dependencias problemáticas

  return (
    <PersonSelector
      persons={pedagogos}
      loading={loading}
      selectedPerson={selectedPedagogo}
      onSelect={onSelect}
      placeholder={placeholder}
      title="Seleccionar Pedagogo"
      emptyMessage="No hay pedagogos disponibles"
      className={className}
    />
  );
};

export default PedagogoSelector;