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