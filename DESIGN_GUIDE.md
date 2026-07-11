# 🎨 Guía de Estilos y Diseño - Centro Tía Glenda

## 📋 Introducción

Esta guía establece los estándares de diseño, patrones de código y mejores prácticas para mantener consistencia visual y técnica en el sistema.

---

## 🎯 Sistema de Colores por Módulo

### 🌈 Rainbow Borders (Implementado)
Cada módulo principal tiene un sistema de rainbow borders consistente usando gradientes de 270°:

```jsx
// Patrón estándar para headers de módulos
backgroundImage: theme.palette.mode === 'dark'
  ? 'none'
  : `linear-gradient(${theme.palette.background.paper}, ${theme.palette.background.paper}), linear-gradient(270deg, [colores específicos del módulo])`,
```

### 📚 Colores por Módulo:
La fuente de verdad es `src/config/moduleThemes.js` (`getModuleTheme('<modulo>').colors`).
Los headers de cada vista Main (`PersonaMain`, `PacienteMain`, `UsuarioMain`, `TutorMain`,
`PersonalMain`, `EspecialidadMain`, `TerapeuticoMain`, `PedagogicoMain`) construyen su
rainbow border con esos colores; no hardcodear listas de colores en las vistas.

---

## 🎨 Sistema de Theming

### ✅ **HACER:**
```jsx
// ✅ Usar palette del tema
bgcolor: 'primary.main'
bgcolor: 'success.main'
backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100'

// ✅ Gradientes theme-responsive
background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`

// ✅ Colores semánticos
borderColor: 'divider'
backgroundColor: 'background.paper'
color: 'text.primary'
```

### ❌ **NO HACER:**
```jsx
// ❌ Colores hardcodeados
bgcolor: '#4caf50'
backgroundColor: '#ffffff'
borderColor: '#e0e0e0'

// ❌ Gradientes hardcodeados
background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
```

---

## 🔘 Sistema de Botones

### 📏 **Tamaños Estándar:**
```jsx
// Botones principales
sx={{ height: 40, px: 2 }}

// Botones pequeños en tablas
size="small"

// Botones de acción
variant="contained"
```

### 🎨 **Colores por Contexto:**
```jsx
// Acciones de éxito (guardar, crear)
sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}

// Acciones primarias
color="primary"

// Acciones de error (eliminar)
color="error"

// Acciones de información (ver)
color="info"
```

---

## 🃏 Sistema de Cards

### 📦 **Patrón Estándar:**
```jsx
// ✅ Patrón correcto
<Card elevation={3}>
  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
    {/* Contenido */}
  </CardContent>
</Card>

// ❌ Patrón incorrecto
<Card elevation={3} sx={{ padding: 2 }}>
  <CardContent>{/* Doble padding */}</CardContent>
</Card>
```

### 🎭 **Elevaciones:**
- **Nivel 1:** `elevation={1}` - Elementos sutiles
- **Nivel 3:** `elevation={3}` - Cards principales (estándar)
- **Nivel 8:** `elevation={8}` - Modales y overlays

---

## 📱 Responsive Design

### 📏 **Breakpoints MUI:**
```jsx
// Uso estándar de breakpoints
sx={{
  p: { xs: 2, md: 3 },
  width: { xs: '100%', sm: 600, md: 800 },
  display: { xs: 'block', md: 'flex' }
}}
```

### 📊 **Tablas Responsive:**
```jsx
// ✅ Patrón para tablas
<Box sx={{
  width: '100%',
  overflowX: 'auto',
  '&::-webkit-scrollbar': {
    height: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '4px',
  },
}}>
  <Table sx={{ minWidth: 650 }}>
    {/* Contenido tabla */}
  </Table>
</Box>
```

### 📱 **Modales Responsive:**
```jsx
// ✅ Ancho responsive
sx={{
  width: { xs: '90vw', sm: 350, md: 400 },
  maxWidth: 400,
}}

// ❌ Ancho fijo
sx={{ width: 300 }}
```

---

## 🔄 Estados de Loading

### 💫 **Componente Estándar:**
```jsx
import LoadingSpinner from 'src/components/shared/LoadingSpinner';

// Uso básico
<LoadingSpinner message="Cargando datos..." />

// Loading de página completa
<LoadingSpinner fullHeight={true} />

// Loading pequeño sin mensaje
<LoadingSpinner size={24} showMessage={false} />
```

### 🚫 **Evitar:**
```jsx
// ❌ CircularProgress directo para loading principal
<CircularProgress size={24} />
```

---

## 📐 Espaciado y Layout

### 📏 **Sistema de Spacing:**
```jsx
// ✅ Usar theme.spacing() o valores MUI
p: { xs: 2, md: 3 }
m: 2
gap: 2

// ❌ Valores hardcodeados
padding: '16px'
margin: '8px'
```

### 🏗️ **Grid System:**
```jsx
// ✅ Grid responsive estándar
<Grid container spacing={3}>
  <Grid item xs={12} md={6}>
    {/* Contenido */}
  </Grid>
</Grid>
```

---

## 🎨 Gradientes Estándar

### 📐 **Dirección Consistente:**
```jsx
// ✅ Usar 135deg como estándar
linear-gradient(135deg, ${color1} 0%, ${color2} 100%)

// ✅ Para rainbow borders usar 270deg
linear-gradient(270deg, #color1, #color2, #color3, #color4)
```

---

## 🔧 Componentes Reutilizables

### 📚 **Componentes Disponibles:**
- `LoadingSpinner` - Estados de carga estandarizados
- `ModernTable` - Tablas con responsive design y scroll indicators
- `ParentCard` - Cards con padding correcto
- `FotoPerfilConAutorizacion` - Avatares con manejo de fotos

### 🎯 **Cuándo Crear Nuevos Componentes:**
1. **Reutilización:** Si el patrón se repite 3+ veces
2. **Complejidad:** Si tiene lógica específica reutilizable
3. **Mantenimiento:** Si requiere actualizaciones centralizadas

---

## 🚀 Performance y Optimización

### ⚡ **Patrones Eficientes:**
```jsx
// ✅ SX objects como funciones para usar theme
const getCardStyles = (theme) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: 2,
})

// ✅ Usar componentes theme-aware
sx={{ bgcolor: 'primary.main' }}
```

### 🚫 **Antipatrones:**
```jsx
// ❌ SX objects estáticos con theme
const cardStyles = {
  backgroundColor: theme.palette.background.paper, // Error: theme no está disponible
}

// ❌ Recrear objetos en cada render
sx={{ backgroundColor: someCondition ? '#fff' : '#000' }} // Usar theme palette
```

---

## 🎯 Accesibilidad

### 🔍 **Contraste:**
```jsx
// ✅ Usar semantic colors
color: 'text.primary'
color: 'text.secondary'

// ✅ Estados hover visibles
'&:hover': {
  backgroundColor: 'primary.light',
  color: 'primary.main'
}
```

### ⌨️ **Navegación:**
```jsx
// ✅ Tooltips en iconos
<Tooltip title="Descripción clara">
  <IconButton>
    <Icon />
  </IconButton>
</Tooltip>
```

---

## 🔄 Workflow de Desarrollo

### 1️⃣ **Antes de Codificar:**
- [ ] Revisar componentes existentes para reutilización
- [ ] Verificar si el patrón ya existe en el sistema
- [ ] Planificar responsive design desde el inicio

### 2️⃣ **Durante Desarrollo:**
- [ ] Usar theme palette en lugar de colores hardcodeados
- [ ] Implementar responsive design en todos los componentes
- [ ] Seguir patrones de nomenclatura establecidos

### 3️⃣ **Antes de Commit:**
- [ ] Verificar que funciona en modo claro y oscuro
- [ ] Probar responsive design en móviles
- [ ] Verificar accesibilidad básica

---

## 🧪 Testing Visual

### 📋 **Checklist de Pruebas:**
- [ ] **Theming:** Funciona en modo claro y oscuro
- [ ] **Responsive:** Se ve bien en xs, sm, md, lg, xl
- [ ] **Estados:** Loading, error, vacío se muestran correctamente
- [ ] **Interacción:** Hover, focus, active states funcionan
- [ ] **Contraste:** Texto legible en todos los fondos

### 🔧 **Herramientas:**
- Chrome DevTools para responsive testing
- Lighthouse para accesibilidad
- React DevTools para performance

---

## 📚 Ejemplos de Implementación

### 🎯 **Formulario Bien Implementado:**
```jsx
const MyForm = () => {
  const theme = useTheme();

  return (
    <Card elevation={3}>
      <Box sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        p: 3,
      }}>
        <Typography variant="h6">Título del Formulario</Typography>
      </Box>

      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Campo"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            sx={{
              bgcolor: 'success.main',
              '&:hover': { bgcolor: 'success.dark' }
            }}
          >
            Guardar
          </Button>
          <Button variant="outlined">
            Cancelar
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
```

---

## 🔄 Versionado de Guía

**Versión:** 1.0
**Fecha:** 16/01/2025
**Estado:** Implementado tras correcciones Prioridad 1-3

### 📈 Próximas Mejoras:
- Agregar guía de animaciones
- Definir sistema de iconografía
- Establecer guidelines de micro-interacciones

---

## 🤝 Contribución

Para proponer cambios a esta guía:
1. Documenta el caso de uso
2. Proporciona ejemplos de código
3. Considera impacto en componentes existentes
4. Actualiza esta documentación

---

**📧 Contacto:** Para dudas sobre implementación, revisar con el equipo de desarrollo antes de crear nuevos patrones.