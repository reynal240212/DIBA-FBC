# 🌟 Sitio Web Oficial - DIBA FBC ⚽

Bienvenido al repositorio del sitio web oficial de **DIBA FBC**, un club de fútbol amateur con sede en **Barranquilla, Colombia**.  
Este proyecto es una plataforma integral para **informar, conectar y gestionar** la vida deportiva y administrativa del club.

---

## 🚀 Enlace al sitio
🔗 [https://diba-fbc.vercel.app](https://diba-fbc.vercel.app)

---

## 📑 Índice
1. [Funcionalidades principales](#-funcionalidades-principales)
2. [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
3. [Tecnologías utilizadas](#-tecnologías-utilizadas)
4. [Documentación](#-documentación)
5. [Backlog / Roadmap](#-por-hacer--backlog)
6. [Autor](#-autor)

---

✅ **Panel Administrativo Premium**: Interfaz unificada con diseño oscuro, glassmorphism y Tailwind CSS para la gestión total del club.  
✅ **Autenticación y Perfiles**: Inicio de sesión para administradores y usuarios generales (vía **Google OAuth**) con perfiles dinámicos y roles gestionados desde Supabase.  
✅ **Gestión Documental**: Subida individual de documentos obligatorios (TI, Cédulas, Registro Civil, Consentimiento) para jugadores con seguimiento de estado.
✅ **Historia Inmersiva**: Timeline vertical interactivo con animaciones AOS y Lightbox para visualizar momentos históricos del club.
✅ **Simbología Interactiva**: Página dedicada a la explicación dinámica de los símbolos del escudo institucional.
✅ **Himno Oficial**: Sección multimedia para escuchar el himno oficial y consultar su letra.
✅ **Integración Social**: Feed dinámico de Instagram integrado directamente en la sección de noticias y muro social.
✅ **Gestión Deportiva**: Control de plantillas, asistencia, pagos, partidos y análisis de rendimiento en tiempo real.
✅ **Planilla Pro (PDF)**: Generación de reportes profesionales de asistencia y pagos con formato para impresión a doble cara.
✅ **Esquema Táctico**: Herramienta de entrenamiento con diagramas de cancha de fútbol y cuadrícula técnica integrados en los reportes.
✅ **Registro de Jugadores**: Formulario extendido con recolección completa de datos de identificación (DNI, Nacionalidad, Salud, etc.).

---

## 🏗️ Arquitectura del Proyecto

El sitio utiliza una arquitectura moderna basada en **Componentes Reutilizables** y **Tailwind CSS**:

- **`dashboard.html` & Admin Suite**: Nueva suite administrativa unificada con componentes persistentes (sidebar, topbar).
- **`loadComponents.js`**: Inyección asíncrona de componentes comunes en la parte pública (navbar, footer).
- **`supabaseClient.js`**: Módulo centralizado para la lógica de base de datos, autenticación (Google OAuth) y RBAC.
- **`Animate On Scroll (AOS)` & `Animate.css`**: Utilizados para la interactividad y fluidez visual en las páginas de historia y escudo.

---

## 🛠️ Tecnologías utilizadas

**Frontend**
- **Tailwind CSS** (Framework de diseño principal para sitio público y administrativo)
- HTML5 & JavaScript (ES6 Modules)
- **AOS (Animate On Scroll)** & **Animate.css** (Animaciones e interactividad)
- **Lightbox2** (Galería de imágenes interactiva)
- FontAwesome 6 & Bootstrap 5

**Backend / Infraestructura**
- **Supabase**: Base de datos PostgreSQL, Autenticación (JWT + OAuth), RPC functions y Storage.
- **Vercel**: Hosting y despliegue continuo (CI/CD).

---

## 📄 Documentación

Se ha generado documentación detallada y walkthroughs de las últimas actualizaciones:
1. **[Documentación del Proyecto](DOCUMENTACION.md)**: Guía técnica completa y reglas de categorización.
2. **Unificación Admin UI**: Rediseño integral de la plataforma de gestión.
3. **Manuales Originales**: Disponibles en la carpeta `documentacion pagna diba`.

---

## 🧠 Por hacer / Backlog

- [x] Integración de Google Login en el Navbar e interfaz de usuario.
- [x] Sistema de carga de componentes dinámicos.
- [x] Panel de administración completo y unificado para gestión del club.
- [x] Gestión dinámica de perfiles administrativos.
- [x] Línea de tiempo histórica inmersiva con animaciones.
- [x] Página de himno oficial y simbología del escudo interactiva.
- [x] Integración de feed de Instagram en sección de Noticias.
- [x] Subida individual de documentos (PDF/Imagen) por jugador desde el perfil.
- [x] Automatización con n8n <!-- id: 26 -->
    - [x] Generar JSON del flujo de Aprendizaje en Tiempo Real <!-- id: 27 -->
    - [x] Documentar configuración de Webhooks en Supabase <!-- id: 28 -->
    - [x] Crear flujo de Notificaciones de Partidos <!-- id: 29 -->
- [x] Notificaciones de próximos encuentros vía Web Push (Broadcast manual listo).

---

## 👨‍💻 Autor

**Reinaldo De Jesús Pérez Navas**  
Técnico del club & Desarrollador de software  
📍 Barranquilla, Colombia

---

✨ *“Jugamos con pasión, crecemos con valores.”*

