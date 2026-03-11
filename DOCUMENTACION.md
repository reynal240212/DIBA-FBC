# 📖 Documentación del Proyecto - DIBA FBC ⚽

Esta documentación detalla el funcionamiento técnico, las reglas de negocio y las últimas actualizaciones implementadas en la plataforma de gestión de **DIBA FBC**.

---

## 🏗️ Arquitectura del Sistema

### Core Tecnológico
- **Frontend:** Vanilla JS, HTML5, Tailwind CSS.
- **Backend/DB:** Supabase (PostgreSQL, Auth, Storage).
- **Despliegue:** Vercel.

### Componentes Clave
- **`public/scripts/loadComponents.js`**: El motor que inyecta el Navbar, Footer y gestiona la visualización dinámica de la plantilla de jugadores.
- **`public/scripts/supabaseClient.js`**: Cliente centralizado para interactuar con la base de datos y manejar la autenticación.

---

## 👥 Gestión de Jugadores y Categorización

### Reglas de Categorización por Año
El sistema organiza a los jugadores en categorías basadas en su año de nacimiento para facilitar la gestión deportiva.

| Año de Nacimiento | Categoría Asignada |
|-------------------|-------------------|
| 2012              | 2012              |
| 2013              | 2013              |
| 2014, 2015, 2016  | 2014/2015/2016    |
| Otros             | General           |

### Lógica de Sincronización (Implementada Mar-2026)
Para evitar que los jugadores queden atrapados en la categoría "General" por falta de asignación manual:
1.  **En Base de Datos:** Se ejecutó un proceso de limpieza que actualizó el campo `categoria` basándose en el año extraído de `fecha_nacimiento`.
2.  **En Frontend (`loadComponents.js`):** Se implementó una lógica de "Hot-Categorization". Si la base de datos devuelve un jugador con categoría "General" o nula, el navegador calcula su categoría en tiempo real usando el año de nacimiento antes de renderizarlo.

---

## 🛠️ Últimas Actualizaciones (Marzo 2026)

### 1. Corrección de Categorías
- **Problema:** Jugadores con fecha de nacimiento aparecían en "General".
- **Solución:** Actualización masiva en Supabase y lógica de respaldo en el frontend.
- **Impacto:** Plantilla ahora correctamente segmentada por años (2012, 2013, 2014/15/16).

### 2. Integración de Redes Sociales
- Se actualizó el perfil oficial de Instagram en el Navbar y secciones informativas.
- Mantenimiento del feed dinámico para mostrar las últimas noticias del club.

### 3. Gestión Documental
- Implementación de la subida de documentos obligatorios (TI, Registro Civil, etc.) con validación de estado por parte del administrador.

---

## 🔐 Administración y Seguridad

### Roles (RBAC)
- **Admin:** Acceso total al dashboard, control de asistencia, pagos y gestión documental.
- **Usuario/Jugador:** Visualización de perfil, subida de documentos propios y acceso a noticias.

### Autenticación
- Manejada vía **Google OAuth** vinculada a la tabla `users` de Supabase para control de sesiones persistentes.

---

*Documentación mantenida por el equipo técnico de DIBA FBC.*
