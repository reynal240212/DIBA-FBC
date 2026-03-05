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

## 📌 Funcionalidades principales

✅ **Autenticación Híbrida**: Inicio de sesión para administradores y para usuarios generales mediante **Google OAuth**.  
✅ **Navbar Dinámico**: Menú que cambia según el estado de la sesión, mostrando la foto de perfil del usuario.  
✅ **Gestión Deportiva**: Fichas técnicas, estadísticas de partidos, tablas de posiciones y análisis de rendimiento.  
✅ **Noticias y Actualidad**: Sistema de anuncios con carrusel dinámico en la página de inicio.  
✅ **Diseño Moderno**: Interfaz responsive y estética premium utilizando **Tailwind CSS**.  
✅ **Buscador Global**: Acceso rápido a cualquier sección o contenido del sitio.

---

## 🏗️ Arquitectura del Proyecto

El sitio utiliza una arquitectura basada en **Componentes Reutilizables** para facilitar el mantenimiento:

- **`loadComponents.js`**: Motor de inyección que carga el `navbar`, `hero` y `footer` de forma asíncrona en todas las páginas.
- **`auth.js`**: Módulo centralizado para el manejo de sesiones con Supabase y Google.
- **`config.js`**: Generado automáticamente durante el despliegue para gestionar credenciales de forma segura.

---

## 🛠️ Tecnologías utilizadas

**Frontend**
- HTML5 & JavaScript (ES6 Modules)
- **Tailwind CSS** (Styling principal)
- Bootstrap 5 (Soporte técnico y componentes base)

**Backend / Infraestructura**
- **Supabase**: Base de datos PostgreSQL, Autenticación (JWT + OAuth) y Storage.
- **Vercel**: Hosting y despliegue continuo (CI/CD).

**Herramientas**
- Git & GitHub
- Google Fonts & FontAwesome 6

---

## 📄 Documentación

Se ha generado documentación detallada del proyecto disponible en la carpeta `documentacion pagna diba`:
1. **Requisitos Funcionales/No Funcionales**: Descripción técnica del alcance.
2. **Manual de Usuario**: Guía paso a paso para padres y seguidores.
3. **Manual del Software**: Detalle de la arquitectura y mantenimiento para desarrolladores.

---

## 🧠 Por hacer / Backlog

- [x] Integración de Google Login en el Navbar.
- [x] Sistema de carga de componentes dinámicos.
- [ ] Subida de documentos (PDF) por jugador desde el perfil.
- [ ] Panel de administración completo para edición de partidos.
- [ ] Notificaciones de próximos encuentros vía Web Push.
- [ ] Galería de fotos por categorías y temporadas.

---

## 👨‍💻 Autor

**Reinaldo De Jesús Pérez Navas**  
Técnico del club & Desarrollador de software  
📍 Barranquilla, Colombia

---

✨ *“Jugamos con pasión, crecemos con valores.”*
