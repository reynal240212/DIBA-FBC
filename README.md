# 🌟 Sitio Web Oficial — DIBA FBC ⚽

Bienvenido al repositorio del sitio web oficial de **DIBA FBC**, club de fútbol amateur con sede en **Barranquilla, Colombia**.  
Una plataforma integral para **informar, conectar y gestionar** la vida deportiva y administrativa del club.

🔗 **[https://diba-fbc.vercel.app](https://diba-fbc.vercel.app)**

---

## 📑 Índice
1. [Funcionalidades](#-funcionalidades)
2. [Arquitectura](#-arquitectura-del-proyecto)
3. [Tecnologías](#-tecnologías-utilizadas)
4. [Desarrollo local](#-desarrollo-local)
5. [Autor](#-autor)

---

## ✅ Funcionalidades

- 🏟️ **Panel Administrativo Premium** — Interfaz oscura con glassmorphism y Tailwind CSS.
- 🔐 **Autenticación** — Google OAuth + roles (admin/jugador/padre) gestionados desde Supabase.
- 📄 **Gestión Documental** — Subida de TI, Cédulas, Registro Civil y Consentimiento por jugador.
- 🤖 **Asistencia por IA** — Reconocimiento facial con face-api.js para toma automática de asistencia.
- 📋 **Planilla Pro** — Generación de planillas PDF a doble cara + exportación Excel.
- 📣 **Convocatorias** — Sistema con notificaciones push a dispositivos vinculados.
- 📸 **Feed de Instagram** — Integración dinámica de noticias del club.
- ⚽ **Gestión Deportiva** — Partidos, entrenamientos, asistencias, pagos y estadísticas.

---

## 🏗️ Arquitectura del Proyecto

```
DIBA-FBC/
├── public/
│   ├── admin/              # Páginas del panel administrativo (HTML puro)
│   ├── src/
│   │   ├── core/           # utils.js, loader.js, aiWidget.js
│   │   ├── components/     # layout/admin-layout.js
│   │   └── features/
│   │       ├── matches/    # banner.js, manager.js
│   │       ├── players/    # public.js, admin.js
│   │       └── stats/      # counter.js
│   ├── scripts/            # Un .js por página (planilla, chat, perfil, asistencia…)
│   ├── styles/             # CSS global
│   ├── layout/             # Componentes HTML inyectables (navbar, footer, etc.)
│   └── images/
├── api/                    # Serverless Functions (Vercel)
├── supabase/               # Edge Functions
├── vercel.json             # Hosting, redireccionamientos y caché
└── package.json
```

**Principios clave:**
- **Sin JS inline**: todo el JavaScript está en `/scripts/*.js` o `/src/**/*.js`.
- **Queries optimizadas**: `.select('col1, col2')` específico + `.limit()` — no `select('*')`.
- **Caché diferenciada**: 7 días para `/scripts/` e `/images/`, sin caché solo para HTMLs y `config.js`.

---

## 🛠️ Tecnologías utilizadas

| Capa | Herramienta |
|---|---|
| UI | Tailwind CSS (CDN), FontAwesome 6, AOS, Animate.css |
| JS | ES6 Modules, face-api.js, jsPDF, XLSX.js |
| Backend | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Hosting | Vercel (CI/CD + Serverless) |

---

## 💻 Desarrollo local

```bash
# Clonar y configurar
cp .env.example .env          # Rellenar SUPABASE_URL y SUPABASE_ANON_KEY
npm run config                # Genera public/scripts/config.js

# Servir localmente
npm run dev                   # http://localhost:3000
```

---

## 👨‍💻 Autor

**Reinaldo De Jesús Pérez Navas**  
Técnico del club & Desarrollador de software — 📍 Barranquilla, Colombia

---

✨ *"Jugamos con pasión, crecemos con valores."*
