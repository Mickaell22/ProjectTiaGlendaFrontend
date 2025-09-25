/**
 * CENTRO TÍA GLENDA - HELPERS PARA MANEJO DE FECHAS
 *
 * Este archivo contiene funciones utilitarias para manejar las inconsistencias
 * de formato de fechas entre el backend y frontend, especialmente para resolver
 * los problemas de timezone documentados en CLAUDE.md
 *
 * PROBLEMA DOCUMENTADO:
 * - Cronograma devuelve: "2025-08-06" (YYYY-MM-DD string) ✅ SEGURO
 * - Asistencias devuelve: "Wed, 06 Aug 2025 00:00:00 GMT" ❌ PROBLEMÁTICO (timezone)
 */

/**
 * Convierte fechas del backend a formato Date de JavaScript de manera segura
 * @param {string} dateString - Fecha del backend
 * @param {string} source - Fuente de la fecha ('cronograma', 'asistencia', etc.)
 * @returns {Date|null} - Objeto Date o null si es inválido
 */
export const safeParseDate = (dateString, source = 'unknown') => {
    if (!dateString || dateString === 'null' || dateString === 'undefined') {
        return null;
    }

    try {
        // CASO 1: Formato GMT problemático de asistencias
        if (dateString.includes('GMT') && dateString.includes(',')) {
            console.warn(`[dateHelpers] GMT date detected from ${source}:`, dateString);

            // Extraer solo la fecha (día, mes, año) ignorando la hora y GMT
            const parts = dateString.split(' ');
            if (parts.length >= 4) {
                // "Wed, 06 Aug 2025 00:00:00 GMT" -> "06 Aug 2025"
                const dateOnly = `${parts[1]} ${parts[2]} ${parts[3]}`;
                const parsedDate = new Date(dateOnly);

                if (!isNaN(parsedDate.getTime())) {
                    console.info(`[dateHelpers] GMT date converted safely:`, dateOnly, '->', parsedDate);
                    return parsedDate;
                }
            }
        }

        // CASO 2: Formato ISO/YYYY-MM-DD seguro
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            const parsedDate = new Date(dateString + 'T00:00:00');
            console.debug(`[dateHelpers] ISO date parsed from ${source}:`, dateString, '->', parsedDate);
            return parsedDate;
        }

        // CASO 3: Formato ISO completo con tiempo
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateString)) {
            const parsedDate = new Date(dateString);
            console.debug(`[dateHelpers] ISO datetime parsed from ${source}:`, dateString, '->', parsedDate);
            return parsedDate;
        }

        // CASO 4: Fallback - intentar parse directo
        const fallbackDate = new Date(dateString);
        if (!isNaN(fallbackDate.getTime())) {
            console.debug(`[dateHelpers] Fallback parse successful from ${source}:`, dateString, '->', fallbackDate);
            return fallbackDate;
        }

        throw new Error(`Unable to parse date: ${dateString}`);

    } catch (error) {
        console.error(`[dateHelpers] Error parsing date from ${source}:`, dateString, error);
        return null;
    }
};

/**
 * Formatea una fecha para mostrar en la UI
 * @param {Date|string} date - Fecha a formatear
 * @param {Object} options - Opciones de formateo
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date, options = {}) => {
    const {
        format = 'dd/MM/yyyy',
        locale = 'es-EC',
        source = 'unknown'
    } = options;

    let dateObj = date;

    // Si es string, convertir a Date de manera segura
    if (typeof date === 'string') {
        dateObj = safeParseDate(date, source);
    }

    if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        return 'Fecha inválida';
    }

    try {
        // Usar Intl.DateTimeFormat para formateo consistente
        const formatter = new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZone: 'America/Guayaquil' // Ecuador timezone
        });

        return formatter.format(dateObj);
    } catch (error) {
        console.error('[dateHelpers] Error formatting date:', error);
        return dateObj.toLocaleDateString();
    }
};

/**
 * Formatea una fecha y hora para mostrar en la UI
 * @param {Date|string} date - Fecha a formatear
 * @param {string} time - Hora en formato HH:MM
 * @param {Object} options - Opciones de formateo
 * @returns {string} - Fecha y hora formateadas
 */
export const formatDateTime = (date, time, options = {}) => {
    const formattedDate = formatDate(date, options);

    if (!time) {
        return formattedDate;
    }

    return `${formattedDate} ${time}`;
};

/**
 * Convierte una fecha a formato ISO para enviar al backend
 * @param {Date} date - Fecha a convertir
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
export const toBackendDateFormat = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return null;
    }

    try {
        // Usar toLocaleDateString con formato específico para evitar problemas de timezone
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error('[dateHelpers] Error converting to backend format:', error);
        return null;
    }
};

/**
 * Convierte un array de fechas del backend de manera segura
 * @param {Array} dateArray - Array de objetos con fechas
 * @param {string} dateField - Nombre del campo de fecha
 * @param {string} source - Fuente de los datos
 * @returns {Array} - Array con fechas procesadas
 */
export const safeParseDateArray = (dateArray, dateField, source = 'unknown') => {
    if (!Array.isArray(dateArray)) {
        return [];
    }

    return dateArray.map(item => {
        if (!item || typeof item !== 'object') {
            return item;
        }

        const dateValue = item[dateField];
        if (dateValue) {
            const parsedDate = safeParseDate(dateValue, source);
            return {
                ...item,
                [dateField]: parsedDate,
                [`${dateField}_formatted`]: formatDate(parsedDate, { source })
            };
        }

        return item;
    });
};

/**
 * Verifica si una fecha está en el rango de hoy
 * @param {Date|string} date - Fecha a verificar
 * @returns {boolean} - true si es hoy
 */
export const isToday = (date) => {
    const dateObj = typeof date === 'string' ? safeParseDate(date) : date;

    if (!dateObj || !(dateObj instanceof Date)) {
        return false;
    }

    const today = new Date();
    return dateObj.toDateString() === today.toDateString();
};

/**
 * Calcula la diferencia en días entre dos fechas
 * @param {Date|string} date1 - Primera fecha
 * @param {Date|string} date2 - Segunda fecha
 * @returns {number} - Diferencia en días
 */
export const daysDifference = (date1, date2) => {
    const d1 = typeof date1 === 'string' ? safeParseDate(date1) : date1;
    const d2 = typeof date2 === 'string' ? safeParseDate(date2) : date2;

    if (!d1 || !d2 || !(d1 instanceof Date) || !(d2 instanceof Date)) {
        return 0;
    }

    const timeDiff = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * Nombres de días en español para UI
 */
export const DIAS_SEMANA = {
    0: 'Domingo',
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado'
};

/**
 * Convierte número de día a nombre
 * @param {number} dayNumber - Número del día (0-6)
 * @returns {string} - Nombre del día
 */
export const getDayName = (dayNumber) => {
    return DIAS_SEMANA[dayNumber] || 'Día inválido';
};

// Export por defecto con todas las funciones
export default {
    safeParseDate,
    formatDate,
    formatDateTime,
    toBackendDateFormat,
    safeParseDateArray,
    isToday,
    daysDifference,
    getDayName,
    DIAS_SEMANA
};