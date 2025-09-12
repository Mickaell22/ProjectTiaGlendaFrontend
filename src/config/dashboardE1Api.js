// src/config/dashboardE1Api.js
// Phase E1 - Clean API configuration for role-based dashboard

export const DASHBOARD_E1_ENDPOINTS = {
  // Role-based dashboard endpoints from backend Phase 1 implementation
  MIS_SESIONES_HOY: '/api/dashboard/mis-sesiones-hoy',      // Therapist's today sessions
  MIS_CLASES_HOY: '/api/dashboard/mis-clases-hoy',          // Pedagogue's today classes
  MIS_PACIENTES: '/api/dashboard/mis-pacientes',            // Therapist's assigned patients
  MIS_ESTUDIANTES: '/api/dashboard/mis-estudiantes',        // Pedagogue's assigned students
};

// User role detection helper
export const detectUserRole = (user) => {
  if (!user) return 'guest';
  
  // Admin role
  if (user.rol === 'Administrador') {
    return 'admin';
  }
  
  // Check specialties for role detection
  if (user.especialidades && user.especialidades.length > 0) {
    const hasTherapeuticSpecialty = user.especialidades.some(esp => 
      esp.area === 'Especialidad terapéutica' || 
      esp.area?.toLowerCase().includes('terap')
    );
    
    const hasPedagogicSpecialty = user.especialidades.some(esp => 
      esp.area === 'Especialidad pedagógica' || 
      esp.area?.toLowerCase().includes('pedag')
    );
    
    if (hasTherapeuticSpecialty) return 'therapist';
    if (hasPedagogicSpecialty) return 'pedagogue';
  }
  
  // Default role for authenticated users
  return 'staff';
};

// Role labels for UI
export const ROLE_LABELS = {
  admin: 'Administrador',
  therapist: 'Terapeuta', 
  pedagogue: 'Pedagogo',
  staff: 'Personal',
  guest: 'Invitado'
};

// Role icons
export const ROLE_ICONS = {
  admin: 'AdminPanelSettings',
  therapist: 'Psychology', 
  pedagogue: 'School',
  staff: 'Person',
  guest: 'PersonOutline'
};