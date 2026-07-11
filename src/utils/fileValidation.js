// src/utils/fileValidation.js
// Utilidad para validación de archivos

export const FILE_TYPES = {
  PATIENT_DOCUMENTS: {
    types: ['application/pdf'],
    extensions: ['.pdf'],
    description: 'Solo archivos PDF',
    maxSize: 10 * 1024 * 1024 // 10MB
  },
  PERSONAL_DOCUMENTS: {
    types: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ],
    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.webp'],
    description: 'PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, GIF, WebP',
    maxSize: 15 * 1024 * 1024, // 15MB
    validDocumentTypes: [
      'cedula', 'curriculum', 'titulo_profesional', 'certificacion', 'contrato',
      'acuerdo_confidencialidad', 'referencias', 'antecedentes_penales', 'record_policial',
      'licencia_profesional', 'colegiatura', 'seguro_responsabilidad', 'evaluacion_desempeño',
      'capacitacion', 'foto_personal', 'otros'
    ]
  },
  PROFILE_PHOTOS: {
    types: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    description: 'JPG, PNG, GIF, WebP',
    maxSize: 5 * 1024 * 1024 // 5MB
  }
};

export class FileValidator {
  /**
   * Valida un archivo según el tipo de documento especificado
   * @param {File} file - El archivo a validar
   * @param {string} documentType - Tipo de documento ('PATIENT_DOCUMENTS', 'PERSONAL_DOCUMENTS', 'PROFILE_PHOTOS')
   * @returns {Object} - { isValid: boolean, message: string }
   */
  static validateFile(file, documentType = 'PERSONAL_DOCUMENTS') {
    if (!file) {
      return {
        isValid: false,
        message: 'No se ha seleccionado ningún archivo'
      };
    }

    const config = FILE_TYPES[documentType];
    if (!config) {
      return {
        isValid: false,
        message: 'Tipo de documento no válido'
      };
    }

    // Validar tipo de archivo
    if (!config.types.includes(file.type)) {
      return {
        isValid: false,
        message: `Tipo de archivo no permitido. Formatos válidos: ${config.description}`
      };
    }

    // Validar tamaño
    if (file.size > config.maxSize) {
      const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(1);
      return {
        isValid: false,
        message: `El archivo es demasiado grande. Máximo ${maxSizeMB}MB`
      };
    }

    // Validar extensión como medida adicional de seguridad
    const fileName = file.name.toLowerCase();
    const hasValidExtension = config.extensions.some(ext => fileName.endsWith(ext));

    if (!hasValidExtension) {
      return {
        isValid: false,
        message: `Extensión de archivo no válida. Extensiones permitidas: ${config.extensions.join(', ')}`
      };
    }

    return {
      isValid: true,
      message: 'Archivo válido'
    };
  }

  /**
   * Obtiene la configuración de validación para un tipo de documento
   * @param {string} documentType - Tipo de documento
   * @returns {Object} - Configuración del tipo de archivo
   */
  static getFileConfig(documentType) {
    return FILE_TYPES[documentType] || FILE_TYPES.PERSONAL_DOCUMENTS;
  }

  /**
   * Formatea el tamaño de archivo en formato legible
   * @param {number} bytes - Tamaño en bytes
   * @returns {string} - Tamaño formateado
   */
  static formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Detecta el tipo de archivo basado en la extensión (fallback)
   * @param {string} fileName - Nombre del archivo
   * @returns {string} - Tipo MIME estimado
   */
  static detectMimeType(fileName) {
    const extension = fileName.toLowerCase().split('.').pop();

    const mimeMap = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp'
    };

    return mimeMap[extension] || 'application/octet-stream';
  }

  /**
   * Obtiene el icono apropiado para un tipo de archivo
   * @param {string} mimeType - Tipo MIME del archivo
   * @returns {string} - Nombre del icono de Material-UI
   */
  static getFileIcon(mimeType) {
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType === 'application/pdf') return 'PictureAsPdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'Description';
    if (mimeType === 'text/plain') return 'TextSnippet';

    return 'InsertDriveFile';
  }

  /**
   * Valida múltiples archivos
   * @param {FileList} files - Lista de archivos
   * @param {string} documentType - Tipo de documento
   * @param {number} maxFiles - Número máximo de archivos permitidos
   * @returns {Object} - { isValid: boolean, message: string, validFiles: Array }
   */
  static validateMultipleFiles(files, documentType = 'PERSONAL_DOCUMENTS', maxFiles = 10) {
    if (!files || files.length === 0) {
      return {
        isValid: false,
        message: 'No se han seleccionado archivos',
        validFiles: []
      };
    }

    if (files.length > maxFiles) {
      return {
        isValid: false,
        message: `Máximo ${maxFiles} archivos permitidos. Seleccionaste ${files.length}`,
        validFiles: []
      };
    }

    const validFiles = [];
    const invalidFiles = [];

    Array.from(files).forEach((file, _index) => {
      const validation = this.validateFile(file, documentType);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        invalidFiles.push({ file: file.name, error: validation.message });
      }
    });

    if (invalidFiles.length > 0) {
      const errorMessages = invalidFiles.map(item => `${item.file}: ${item.error}`);
      return {
        isValid: false,
        message: `Archivos inválidos:\n${errorMessages.join('\n')}`,
        validFiles
      };
    }

    return {
      isValid: true,
      message: `${validFiles.length} archivo(s) válido(s)`,
      validFiles
    };
  }
}

export default FileValidator;