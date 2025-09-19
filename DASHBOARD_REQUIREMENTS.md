# 📊 Dashboard Requirements - Centro Tía Glenda

## 🎯 Objetivo
Crear dashboards funcionales para cada rol (Admin, Terapeuta, Pedagogo) que muestren datos reales e interesantes del sistema.

## ⚠️ Problemas Actuales
- **Todos los valores aparecen en 0**
- Los endpoints existentes no funcionan correctamente
- Los métodos de servicios no existen o están mal nombrados
- Las APIs no devuelven datos en el formato esperado

## 🔍 Endpoints Necesarios para el Backend

### 1. **Dashboard Administrativo** (`/api/dashboard/admin`)
```json
GET /api/dashboard/admin
Authorization: Bearer {token}

Response:
{
  "status": "success",
  "data": {
    "usuarios": {
      "total": 25,
      "activos": 23,
      "inactivos": 2,
      "nuevos_este_mes": 3
    },
    "pacientes": {
      "total": 120,
      "activos": 115,
      "nuevos_este_mes": 8,
      "por_edad": {
        "0-5": 30,
        "6-12": 45,
        "13-18": 25,
        "18+": 20
      }
    },
    "personal": {
      "total": 15,
      "terapeutas": 8,
      "pedagogos": 6,
      "administrativos": 1
    },
    "especialidades": {
      "total": 12,
      "terapeuticas": 7,
      "pedagogicas": 5
    },
    "sesiones": {
      "hoy": 18,
      "esta_semana": 85,
      "completadas_mes": 340,
      "canceladas_mes": 12
    },
    "estadisticas": {
      "asistencia_promedio": 88,
      "satisfaccion_promedio": 4.2,
      "utilizacion_salas": 75
    }
  }
}
```

### 2. **Dashboard Terapeuta** (`/api/dashboard/therapist`)
```json
GET /api/dashboard/therapist
Authorization: Bearer {token}

Response:
{
  "status": "success",
  "data": {
    "mis_pacientes": {
      "total": 12,
      "activos": 11,
      "dados_alta": 3,
      "nuevos_este_mes": 2
    },
    "sesiones": {
      "hoy": 6,
      "esta_semana": 28,
      "completadas_mes": 110,
      "pendientes": 4
    },
    "agenda_hoy": [
      {
        "id": 1,
        "paciente": "Ana María García",
        "hora": "09:00",
        "tipo_terapia": "Lenguaje",
        "duracion": 45,
        "estado": "confirmada",
        "sala": "Terapia 1"
      },
      {
        "id": 2,
        "paciente": "Carlos Rodríguez",
        "hora": "10:30",
        "tipo_terapia": "Física",
        "duracion": 60,
        "estado": "en_curso",
        "sala": "Terapia 2"
      }
    ],
    "estadisticas": {
      "asistencia_promedio": 92,
      "horas_trabajadas_mes": 85,
      "evaluaciones_pendientes": 3,
      "objetivos_cumplidos": 78
    }
  }
}
```

### 3. **Dashboard Pedagogo** (`/api/dashboard/pedagogue`)
```json
GET /api/dashboard/pedagogue
Authorization: Bearer {token}

Response:
{
  "status": "success",
  "data": {
    "mis_estudiantes": {
      "total": 18,
      "activos": 17,
      "graduados": 4,
      "nuevos_este_mes": 2
    },
    "clases": {
      "hoy": 4,
      "esta_semana": 20,
      "completadas_mes": 80,
      "canceladas_mes": 3
    },
    "horario_hoy": [
      {
        "id": 1,
        "clase": "Matemáticas Básicas",
        "hora": "08:30",
        "duracion": 60,
        "estudiantes": 8,
        "aula": "Aula 101",
        "estado": "programada"
      },
      {
        "id": 2,
        "clase": "Lectoescritura",
        "hora": "10:00",
        "duracion": 45,
        "estudiantes": 6,
        "aula": "Aula 102",
        "estado": "en_curso"
      }
    ],
    "estadisticas": {
      "asistencia_promedio": 89,
      "horas_clase_mes": 92,
      "evaluaciones_pendientes": 5,
      "rendimiento_promedio": 85
    }
  }
}
```

## 🔧 Endpoints Auxiliares Necesarios

### 4. **Estadísticas Generales** (`/api/stats/general`)
```json
GET /api/stats/general
Authorization: Bearer {token}

Response:
{
  "status": "success",
  "data": {
    "resumen": {
      "total_usuarios": 25,
      "total_pacientes": 120,
      "total_personal": 15,
      "sesiones_activas": 85
    },
    "actividad_reciente": [
      {
        "tipo": "sesion_completada",
        "usuario": "Dr. González",
        "descripcion": "Completó sesión de terapia",
        "timestamp": "2025-01-19T14:30:00Z"
      },
      {
        "tipo": "paciente_nuevo",
        "usuario": "Sistema",
        "descripcion": "Nuevo paciente registrado",
        "timestamp": "2025-01-19T12:15:00Z"
      }
    ],
    "alertas": [
      {
        "tipo": "info",
        "mensaje": "18 sesiones programadas para hoy",
        "prioridad": "normal"
      },
      {
        "tipo": "warning",
        "mensaje": "3 evaluaciones pendientes de revisión",
        "prioridad": "alta"
      }
    ]
  }
}
```

### 5. **Mi Agenda Personal** (`/api/agenda/personal`)
```json
GET /api/agenda/personal?fecha=2025-01-19
Authorization: Bearer {token}

Response:
{
  "status": "success",
  "data": {
    "fecha": "2025-01-19",
    "total_actividades": 6,
    "actividades": [
      {
        "id": 1,
        "tipo": "sesion_terapia", // o "clase_pedagogica"
        "titulo": "Terapia de Lenguaje - Ana García",
        "hora_inicio": "09:00",
        "hora_fin": "09:45",
        "estado": "confirmada", // confirmada, en_curso, completada, cancelada
        "paciente_estudiante": "Ana María García",
        "ubicacion": "Sala Terapia 1",
        "notas": "Evaluación mensual programada"
      }
    ]
  }
}
```

## 🛠️ Verificaciones Backend Necesarias

### 1. **Servicios Existentes a Revisar:**
- ✅ `UsuarioService.getAll()` - Verificar que funciona
- ✅ `PacienteService.getAll()` - Verificar que funciona
- ✅ `PersonalService.getAll()` - Verificar que funciona
- ✅ `EspecialidadService.getAll()` - Verificar que funciona
- ❌ `SesionTerapiaService.getSesiones()` - Verificar método correcto
- ❌ `SesionPedagogicaService.getSesiones()` - Verificar método correcto

### 2. **Endpoints Base a Verificar:**
```
GET /api/usuarios          - ✅ Funciona
GET /api/pacientes         - ✅ Funciona
GET /api/personal          - ✅ Funciona
GET /api/especialidades    - ✅ Funciona
GET /api/sesiones-terapia  - ❓ Verificar funcionamiento
GET /api/sesiones-pedagogicas - ❓ Verificar funcionamiento
```

### 3. **Nuevos Endpoints a Crear:**
```
GET /api/dashboard/admin      - 🆕 Crear
GET /api/dashboard/therapist  - 🆕 Crear
GET /api/dashboard/pedagogue  - 🆕 Crear
GET /api/stats/general        - 🆕 Crear
GET /api/agenda/personal      - 🆕 Crear
```

## 📋 Estructura de Base de Datos a Revisar

### Tablas Principales:
- `usuarios` - Verificar campos activo/estado
- `pacientes` - Verificar campos activo/estado
- `personal` - Verificar relación con especialidades
- `especialidades` - Verificar campo área (terapéutica/pedagógica)
- `sesion_terapia` - Verificar estructura y datos
- `sesion_pedagogica` - Verificar estructura y datos
- `cronograma_sesiones` - Para sesiones terapéuticas
- `cronograma_clases` - Para sesiones pedagógicas
- `asistencia_sesiones` - Para tracking de asistencia terapéutica
- `asistencia_clases` - Para tracking de asistencia pedagógica

### Queries de Ejemplo Necesarios:
```sql
-- Contar usuarios activos
SELECT COUNT(*) as total, COUNT(CASE WHEN activo = true THEN 1 END) as activos
FROM usuarios;

-- Contar pacientes por rango de edad
SELECT
  CASE
    WHEN EXTRACT(YEAR FROM AGE(fecha_nacimiento)) < 6 THEN '0-5'
    WHEN EXTRACT(YEAR FROM AGE(fecha_nacimiento)) < 13 THEN '6-12'
    WHEN EXTRACT(YEAR FROM AGE(fecha_nacimiento)) < 19 THEN '13-18'
    ELSE '18+'
  END as rango_edad,
  COUNT(*) as cantidad
FROM pacientes
WHERE activo = true
GROUP BY rango_edad;

-- Sesiones de hoy para un terapeuta
SELECT s.*, p.nombre as paciente_nombre, esp.nombre as especialidad
FROM sesion_terapia s
JOIN sesion_paciente sp ON s.id = sp.sesion_id
JOIN pacientes p ON sp.paciente_id = p.id
JOIN personal per ON s.terapeuta_id = per.id
JOIN especialidades esp ON s.especialidad_id = esp.id
WHERE per.usuario_id = ?
  AND DATE(s.fecha_programada) = CURRENT_DATE;
```

## 🎯 Plan de Implementación

### Fase 1: Verificación (Backend)
1. Verificar todos los endpoints existentes
2. Revisar estructura de base de datos
3. Confirmar que los servicios devuelven datos correctos

### Fase 2: Nuevos Endpoints (Backend)
1. Crear `/api/dashboard/admin`
2. Crear `/api/dashboard/therapist`
3. Crear `/api/dashboard/pedagogue`
4. Crear `/api/stats/general`
5. Crear `/api/agenda/personal`

### Fase 3: Integración (Frontend)
1. Actualizar servicios frontend para usar nuevos endpoints
2. Modificar dashboards para consumir datos reales
3. Agregar manejo de errores y estados de carga
4. Testing con diferentes usuarios/roles

## 🧪 Testing

### Datos de Prueba Requeridos:
- Al menos 20+ usuarios de diferentes roles
- 100+ pacientes activos
- 10+ personal (terapeutas y pedagogos)
- 50+ sesiones programadas/completadas
- Datos de asistencia realistas

### Casos de Prueba:
1. Dashboard admin con datos completos
2. Dashboard terapeuta con sesiones del día
3. Dashboard pedagogo con clases programadas
4. Manejo de casos sin datos (nuevos usuarios)
5. Performance con grandes volúmenes de datos

---

**Prioridad Alta:** Crear los nuevos endpoints del dashboard primero, luego verificar/arreglar los existentes.

**Resultado Esperado:** Dashboards que muestren datos reales y útiles, no valores en 0.