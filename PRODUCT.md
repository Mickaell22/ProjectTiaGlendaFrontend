# Product

## Register

product

## Users

Personal del Centro Tia Glenda: administradores, terapeutas y pedagogos. Usan la app a diario en el centro (escritorio principalmente, a veces tablet/movil) para gestionar pacientes, sesiones terapeuticas y pedagogicas, asistencias, personal y usuarios. Contexto multi-centro: cada usuario trabaja sobre una sucursal seleccionada (Norte/Sur) con RBAC por centro.

## Product Purpose

Panel de administracion del centro de acompanamiento pedagogico y terapeutico. Centraliza el CRUD de pacientes/tutores/personal, la planificacion y registro de sesiones, cronogramas, asistencias, chat interno, notificaciones y reportes. Exito = el personal completa sus flujos diarios (registrar sesion, tomar asistencia, consultar paciente) rapido y sin errores.

## Brand Personality

Calido, confiable, profesional. La identidad visual gira alrededor del logo arcoiris del centro: los "rainbow borders" por modulo (documentados en DESIGN_GUIDE.md) son el acento de marca, cada modulo con su propio degradado. El tono es cercano y humano (trabajan con ninos y familias) pero la interfaz es una herramienta seria de gestion clinica/educativa.

## Anti-references

- SaaS generico oscuro/frio: esto no es un dashboard de metricas tech.
- Estetica infantil literal (colores primarios chillones, tipografia juguetona): los usuarios son profesionales, no ninos.
- Template Modernize sin personalizar: quedan restos del template que deben desaparecer, no definir la identidad.

## Design Principles

- La marca vive en los acentos (rainbow por modulo, logo), no en el ruido: superficies limpias, color con proposito.
- Cada modulo se reconoce por su color (moduleThemes), consistente en header, tabs y estados.
- Flujos diarios primero: menos clics y menos ambiguedad en registrar sesion, asistencia y consulta de paciente.
- Estados honestos: vacio, cargando y error siempre disenados, nunca un spinner generico o un error crudo de Axios.
- Dark mode es un ciudadano de primera: todo lo que existe en claro existe en oscuro.

## Accessibility & Inclusion

- Objetivo WCAG AA: contraste >= 4.5:1 en texto, foco visible, navegacion por teclado completa.
- Labels y roles ARIA en formularios, tablas de acciones (iconos con aria-label + tooltip) y dialogos.
- Respetar prefers-reduced-motion en animaciones (framer-motion y transiciones MUI).
