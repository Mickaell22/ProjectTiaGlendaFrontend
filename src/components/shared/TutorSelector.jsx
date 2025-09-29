// src/components/shared/TutorSelector.jsx
import React, { useEffect, useState } from 'react';
import PersonSelector from './PersonSelector';
import { TutorService } from '../../services/tutorService';

const TutorSelector = ({
  selectedTutor = null,
  onSelect,
  className = "",
  placeholder = "Seleccionar tutor"
}) => {
  const [tutores, setTutores] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadTutores = async () => {
    try {
      setLoading(true);
      const data = await TutorService.getAll();

      // Transform tutors data to match PersonSelector format
      const formattedTutores = data.map(tutor => ({
        id: tutor.id,
        nombre: tutor.nombre,
        apellido: tutor.apellido,
        nombre_completo: tutor.nombre_completo,
        cedula: tutor.cedula,
        telefono: tutor.telefono,
        correo: tutor.email || tutor.correo,
        direccion: tutor.direccion,
        parentesco: tutor.parentesco,
        ocupacion: tutor.ocupacion,
        displayName: `${tutor.nombre} ${tutor.apellido} (${tutor.parentesco})`,
        sourceType: 'tutor'
      }));

      setTutores(formattedTutores);
    } catch (error) {
      console.error('Error loading tutors:', error);
      setTutores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTutores();
  }, []);

  return (
    <PersonSelector
      persons={tutores}
      loading={loading}
      selectedPerson={selectedTutor}
      onSelect={onSelect}
      placeholder={placeholder}
      title="Seleccionar Tutor"
      emptyMessage="No hay tutores disponibles"
      className={className}
      showExtraInfo={true} // Show parentesco info
    />
  );
};

export default TutorSelector;