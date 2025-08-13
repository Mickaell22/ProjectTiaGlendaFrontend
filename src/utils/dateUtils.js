/**
 * Utilidades para el manejo correcto de fechas
 * Basado en la implementación del Project D
 */

// Función para parsear fechas como fechas locales (sin timezone issues)
export const parseLocalDate = (dateString) => {
  if (!dateString) return null
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Función para parsear fechas GMT de asistencia como fechas locales
export const parseGMTDateAsLocal = (gmtDateString) => {
  if (!gmtDateString) return null
  
  // Parse the GMT date string to extract date components
  const gmtDate = new Date(gmtDateString)
  
  // Extract the UTC date components to avoid timezone conversion
  const year = gmtDate.getUTCFullYear()
  const month = gmtDate.getUTCMonth() 
  const day = gmtDate.getUTCDate()
  
  // Create a new local date with those components
  return new Date(year, month, day)
}

// Función para formatear fechas de manera consistente
export const formatDateLocal = (dateValue) => {
  if (!dateValue) return '—';
  
  let date;
  if (typeof dateValue === 'string') {
    // Si es formato YYYY-MM-DD, usar parseLocalDate
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      date = parseLocalDate(dateValue);
    } 
    // Si es formato GMT/ISO, usar parseGMTDateAsLocal
    else if (dateValue.includes('GMT') || dateValue.includes('T')) {
      date = parseGMTDateAsLocal(dateValue);
    }
    else {
      date = new Date(dateValue);
    }
  } else {
    date = new Date(dateValue);
  }
  
  if (isNaN(date.getTime())) return '—';
  
  // Formatear como DD/MM/YYYY
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

// Función para formatear fechas para inputs de tipo date (YYYY-MM-DD)
export const formatDateForInput = (dateValue) => {
  if (!dateValue) return '';
  
  let date;
  if (typeof dateValue === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue; // Ya está en el formato correcto
    }
    if (dateValue.includes('GMT') || dateValue.includes('T')) {
      date = parseGMTDateAsLocal(dateValue);
    } else {
      date = new Date(dateValue);
    }
  } else {
    date = new Date(dateValue);
  }
  
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// Función para obtener la fecha actual en formato YYYY-MM-DD
export const getCurrentDateForInput = () => {
  const today = new Date();
  return formatDateForInput(today);
}

// Función para comparar fechas de cronograma vs asistencias
export const compareAttendanceDates = (cronogramaDate, attendanceDate) => {
  const cronogramaParsed = parseLocalDate(cronogramaDate);
  const attendanceParsed = parseGMTDateAsLocal(attendanceDate);
  
  if (!cronogramaParsed || !attendanceParsed) return false;
  
  return cronogramaParsed.toDateString() === attendanceParsed.toDateString();
}

export default {
  parseLocalDate,
  parseGMTDateAsLocal,
  formatDateLocal,
  formatDateForInput,
  getCurrentDateForInput,
  compareAttendanceDates
}