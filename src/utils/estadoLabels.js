// src/utils/estadoLabels.js
// Mapeo unico de estados de sesion (backend) a label legible + color de Chip MUI.
// ponytail: mapa plano; si el backend agrega estados nuevos caen al default legible.
const ESTADOS_SESION = {
  planificada: { label: 'Planificada', color: 'info' },
  programada: { label: 'Programada', color: 'info' },
  en_curso: { label: 'En curso', color: 'primary' },
  pausada: { label: 'Pausada', color: 'warning' },
  finalizada: { label: 'Finalizada', color: 'success' },
  completada: { label: 'Completada', color: 'success' },
  cancelada: { label: 'Cancelada', color: 'error' },
  activa: { label: 'Activa', color: 'success' },
  inactiva: { label: 'Inactiva', color: 'default' },
};

export const estadoSesionInfo = (estado) => {
  if (!estado) return { label: 'Sin estado', color: 'default' };
  return (
    ESTADOS_SESION[estado] || {
      // fallback legible para estados no mapeados: "algun_estado" -> "Algun estado"
      label: String(estado).replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()),
      color: 'default',
    }
  );
};

export default estadoSesionInfo;
