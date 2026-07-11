# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm run dev` - Start Vite development server with HMR
- `npm run build` - Build for production  
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint on all JS/JSX files

### Testing
Currently no test framework is configured. Standalone test files were mentioned but are not present in the current codebase structure.

## Invariantes y gotchas (mantener)

- **MUI v7 / Grid v2 unicamente**: los props `item`/`xs`/`sm`/`md`/`lg`/`xl` de Grid v1
  NO existen (se ignoran en silencio y el layout cae a bloque). Usar
  `<Grid size={{ xs: 12, md: 6 }}>`. Todo `src` ya esta migrado; no reintroducir Grid v1.
- **Estados de sesion**: el label y color de los chips de estado salen de
  `src/utils/estadoLabels.js` (`estadoSesionInfo`). No renderizar el enum crudo
  (`en_curso`) ni duplicar mapeos de color en las vistas.
- **Colores por modulo**: los rainbow borders de los headers salen de
  `src/config/moduleThemes.js`; en dark mode el gradiente se apaga (`'none'`).
  Nunca `linear-gradient(white, white)` hardcodeado: usar `theme.palette.background.paper`.
- **401 en apiService**: si `window.location.pathname` empieza con `/auth`, el
  interceptor NO redirige (deja que Login/SelectorCentro muestren el mensaje del
  backend, ej. "Credenciales invalidas"). Fuera de /auth, limpia `jwt_token` + `user`
  y redirige a login. En 403 se prefiere el `message` del backend (ej. "Usuario sin
  centro asignado" del flujo de dos pasos).
- **Login en dos pasos**: POST /api/login devuelve token SIN centro; hasta llamar
  POST /api/seleccionar-centro y reemplazar el token, los endpoints por centro dan 403.
  `isAuthenticated` solo es true con token + `id_centro`.
- **DialogTitle ya es `<h2>`**: no meter `Typography variant="h5"` sin `component`
  dentro (DOM nesting invalido). Ver `SelectorCentro.jsx` como patron correcto.
- **Dashboards con datos reales**: `dashboardService.js` consume los endpoints por
  rol del backend (`/api/dashboard/admin|therapist|pedagogue`), que devuelven la
  estructura exacta que esperan las vistas. NUNCA volver a fabricar KPIs en el
  frontend (dividir totales, hardcodear inactivos=0, etc.).
- **Lint en cero**: `npm run lint` corre sin errores ni warnings. Los efectos
  mount-only intencionales llevan `eslint-disable-next-line react-hooks/exhaustive-deps`
  con nota; `react-refresh/only-export-components` esta apagado a proposito
  (patron withRole + hooks en contexts). Mantenerlo asi: no reintroducir
  imports/variables muertos.

## Project Architecture

### Tech Stack
- **Frontend**: React 19 with Vite build tool
- **State Management**: Redux Toolkit with React-Redux
- **UI Library**: Material-UI v7 with Emotion styling
- **Routing**: React Router DOM v7
- **Forms**: Formik with Yup validation  
- **HTTP Client**: Axios with centralized API service
- **PDF Generation**: jsPDF with autoTable
- **Development**: ESLint with modern config and React hooks/refresh plugins
- **Date Handling**: date-fns and dayjs for date utilities
- **Animation**: Framer Motion for UI animations

### Core Architecture Patterns

#### 1. Authentication System
- Context-based authentication with `AuthContext.jsx`
- JWT tokens stored in localStorage
- Centralized auth state management with reducer pattern
- Protected routes using `ProtectedRoute.jsx`
- Inactivity timeout with `InactivityWrapper.jsx`

#### 2. API Service Layer
- Centralized `ApiService.js` with Axios interceptors
- Configuration in `src/config/api.js` with all endpoints
- Automatic token attachment and error handling
- Retry logic for network failures
- Response/request interceptors for global error handling

#### 3. Layout System
- `FullLayout.jsx` - Main application layout with sidebar
- `BlankLayout.jsx` - Minimal layout for auth pages
- Vertical sidebar navigation with collapsible menu groups
- Theme customization with `ThemeSettings.js`
- RTL support available

#### 4. Module-Based Organization
The application is organized into functional modules:

**Core Modules:**
- `/dashboard` - Main dashboard
- `/gestion/persona` - Person management
- `/gestion/usuario` - User management  
- `/gestion/paciente` - Patient management
- `/gestion/personal` - Staff management
- `/gestion/especialidad` - Specialty management
- `/gestion/tutor` - Guardian/tutor management

**Clinical & Educational:**
- `/terapeutico` - Therapeutic area with sessions and statistics
- `/pedagogico/sesiones` - Educational sessions
- `/pedagogico/cronogramas` - Class schedules
- `/pedagogico/asistencia` - Student attendance
- `/pedagogico/evaluaciones` - Evaluations and grades

**Reports & Queries:**
- `/consultas` - Specialized queries for availability
- `/reportes` - Reports and statistics with PDF export

#### 5. Component Architecture
- **Shared Components**: Reusable UI components in `/components/shared/`
- **Service Layer**: Individual service files for each domain (pacienteService, usuarioService, etc.)
- **Custom Hooks**: Domain-specific hooks like `useAuth.js`, `useSnackbar.js`
- **Module Themes**: Configurable themes per module in `moduleThemes.js`

#### 6. Data Management Patterns
- **Services**: Each entity has its own service file (e.g., `pacienteService.js`)
- **Form Handling**: Formik + Yup for complex forms with validation
- **Tables**: `ModernTable.jsx` for consistent table UI
- **Search & Filtering**: `SearchAndFilters.jsx` for unified filtering
- **Status Management**: `StatusChip.jsx` for consistent status displays

#### 7. File Upload & Profile System
- Profile photo management with `FotoPerfilService.js`
- Document management for staff with `documentosPersonalService.js`
- Authorization-based photo access with `FotoPerfilConAutorizacion.jsx`

### Key Configuration Files
- **Environment**: `.env` with `VITE_API_URL=http://localhost:5000` and `VITE_NODE_ENV=development`
- **Build**: `vite.config.js` with path aliases (`src` alias configured)
- **Linting**: `eslint.config.js` with React hooks and refresh plugins, unused vars pattern matching
- **Routing**: Centralized route configuration in `src/config/routes.js` with protected/public route validation
- **API**: All endpoints configured in `src/config/api.js`

### Development Notes
- Uses Redux store in `Store.js` with customizer slice for theme management
- Theme system supports dark/light modes and RTL with `ThemeSettings.js`
- Error boundaries implemented for graceful error handling
- Loading states and spinners for async operations
- Snackbar notifications system for user feedback with `useSnackbar.js` hook
- All API calls go through centralized error handling in `ApiService.js`
- Inactivity timeout wrapper for automatic logout
- Role-based dashboard components and navigation
- Notification system with chat components and user search functionality

### Important Services Structure
- Each domain entity has its own service file (e.g., `pacienteService.js`, `usuarioService.js`)
- Centralized notification handling with `notificationService.js`
- Session management for both therapeutic and pedagogical areas
- Report generation services with PDF export capabilities