# Centro Tía Glenda — Frontend

Panel de administración web para centro terapéutico y pedagógico. Dashboards por rol, gestión de pacientes, sesiones de terapia y pedagógicas, cronogramas, asistencias, chat interno y notificaciones.

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Material UI](https://img.shields.io/badge/Material_UI-0081CB?style=for-the-badge&logo=mui&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## Módulos

| Módulo | Descripción |
|--------|-------------|
| **Dashboard** | KPIs diferenciados por rol (admin / terapeuta / pedagogo) |
| **Pacientes** | CRUD, documentos, historial de pausas, múltiples tutores |
| **Personal** | Gestión de terapeutas y pedagogos con documentos |
| **Sesiones terapéuticas** | Crear, listar, asistencias, cronogramas, estadísticas |
| **Sesiones pedagógicas** | Clases con cronograma y asistencias |
| **Especialidades** | Catálogo de especialidades del centro |
| **Usuarios** | Gestión de cuentas con roles y contraseñas |
| **Chat** | Mensajería interna en tiempo real |
| **Notificaciones** | Centro de alertas con configuración |
| **Reportes** | Exportación de datos |
| **Configuración** | General, sesiones, seguridad, notificaciones |
| **Multi-centro** | Selector de sucursal con RBAC por centro |

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | React + Vite |
| UI | Material UI v5 |
| Estado | Redux Toolkit |
| Routing | React Router v6 |
| HTTP | Axios |
| Auth | JWT con refresh automático |

---

## Correr localmente

```bash
git clone https://github.com/Mickaell22/ProjectTiaGlendaFrontend.git
cd ProjectTiaGlendaFrontend
npm install
npm run dev
```

Requiere que [ProjectTiaGlendaBackend](https://github.com/Mickaell22/ProjectTiaGlendaBackend) esté corriendo.
