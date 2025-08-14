// src/hooks/useAuth.js
// Hook customizado para manejar autenticación

import { useAuth as useAuthContext } from '../contexts/AuthContext';

// Re-exportar el hook del contexto para mantener compatibilidad
export const useAuth = () => {
  return useAuthContext();
};

export default useAuth;