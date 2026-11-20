# PAKÁNA

Sitio web de **PAKÁNA**, emprendimiento familiar de condimentos molidos cuyo producto principal es la cúrcuma. Incluye un catálogo de productos con precios, un panel de administración, un formulario de contacto y un asistente con inteligencia artificial que sugiere recetas con especias.

**Sitio en producción:** https://proyecto-pakana.vercel.app

---

## Funcionalidades

| Sección | Ruta | Descripción |
|---|---|---|
| Inicio | `/` | Carrusel de imágenes y presentación de la marca |
| Quiénes somos | `/nosotros` | Historia, esencia y visión de PAKÁNA |
| Catálogo | `/catalogo` | Productos desde MongoDB, destacados, buscador y descarga del catálogo en **PDF** |
| Contacto | `/contacto` | Formulario cuyos mensajes llegan al panel de administración |
| Login | `/login` | Acceso del administrador (JWT) |
| Panel Admin | `/admin` | Crear, editar y eliminar productos; **subir imágenes** directamente a GitHub; leer y gestionar mensajes |
| Chatbot | todas las páginas | Asistente de recetas con **Claude Haiku 5.5** que recomienda productos del catálogo |

## Tecnologías

**Frontend:** React 19, Vite, React Router, jsPDF + jspdf-autotable, Oxlint

**Backend:** Node.js, Express 5, MongoDB Atlas + Mongoose, JWT + bcryptjs, Multer, SDK oficial de Anthropic (`@anthropic-ai/sdk`)

**Servicios externos:** MongoDB Atlas (base de datos), GitHub (almacenamiento de imágenes en el repo `pakana-imagenes`), Anthropic (chatbot), Vercel (hosting)

## Arquitectura

```
Visitante ──► Frontend (React, Vercel)
                  │  VITE_API_URL
                  ▼
             Backend (Express, Vercel) ──► MongoDB Atlas   (productos, mensajes, usuarios)
                                       ──► Anthropic        (chatbot Claude Haiku 5.5)
                                       ──► GitHub           (imágenes de productos)
```

## Estructura del proyecto

```
├── src/                         # Frontend
│   ├── components/
│   │   ├── catalogo/            # Componentes reutilizables con props
│   │   │   ├── ProductoCard.jsx       (tarjeta, también usada en el Admin)
│   │   │   ├── ProductoImagen.jsx     (imagen con respaldo)
│   │   │   ├── ListaPrecios.jsx
│   │   │   ├── SeccionProductos.jsx
│   │   │   └── BuscadorCatalogo.jsx
│   │   ├── ChatBot.jsx, Header.jsx, Footer.jsx, RutaProtegida.jsx
│   ├── hooks/useProductos.js    # Carga de productos (catálogo y admin)
│   ├── pages/                   # Home, Nosotros, Catalogo, Contacto, Login, Admin
│   ├── utils/                   # precios, PDF, normalización de URLs de imágenes
│   └── config.js                # URL de la API (VITE_API_URL)
├── public/                      # Imágenes del carrusel
├── vercel.json                  # Rutas del frontend en Vercel
├── conocimiento/                # Manual del proyecto
└── pakana-api/                  # Backend
    ├── server.js                # App Express (local y Vercel)
    ├── models/                  # Producto, Usuario, Mensaje
    ├── routes/                  # productos, auth, mensajes, imagenes, chat
    ├── middleware/auth.js       # Protección de rutas con JWT
    ├── utils/github.js          # Subida y borrado de imágenes en GitHub
    └── scripts/crearAdmin.js    # Crea el usuario administrador inicial
```

## API

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/productos` | Público | Lista de productos |
| GET | `/api/productos/:id` | Público | Un producto |
| POST / PUT / DELETE | `/api/productos[/:id]` | Admin | Crear, actualizar o eliminar (borra también su imagen en GitHub) |
| POST | `/api/auth/login` | Público | Inicio de sesión, devuelve un token JWT |
| POST | `/api/mensajes` | Público | Enviar formulario de contacto |
| GET / PATCH / DELETE | `/api/mensajes[/:id]` | Admin | Listar, marcar como leído o eliminar mensajes |
| POST / DELETE | `/api/imagenes` | Admin | Subir (JPG, PNG o WEBP, máx. 2 MB) o borrar una imagen en GitHub |
| POST | `/api/chat` | Público | Chatbot (preguntas de máx. 500 caracteres) |

Las rutas de **Admin** requieren el encabezado `Authorization: Bearer <token>`.

## Instalación local

**Requisitos:** Node.js 20 o superior y una base de datos en MongoDB Atlas.

### 1. Backend

```bash
cd pakana-api
npm install
```

Crear `pakana-api/.env` con estas variables (**nunca** subir este archivo a git):

| Variable | Descripción |
|---|---|
| `PORT` | Puerto local (por defecto `5000`) |
| `MONGODB_URI` | Cadena de conexión de MongoDB Atlas |
| `JWT_SECRET` | Clave secreta para firmar los tokens |
| `ANTHROPIC_API_KEY` | Clave de la API de Anthropic (chatbot) |
| `GITHUB_TOKEN` | Token *fine-grained* con permiso *Contents: Read and write* sobre el repo de imágenes |
| `GITHUB_OWNER` | Usuario de GitHub dueño del repo de imágenes |
| `GITHUB_REPO` | Repo público de imágenes (ej. `pakana-imagenes`) |
| `GITHUB_BRANCH` | Rama del repo de imágenes (ej. `main`) |
| `GITHUB_CARPETA` | Carpeta de las imágenes (ej. `productos`) |
| `FRONTEND_URL` | *(solo producción)* URL del frontend permitida por CORS |

Crear el administrador inicial y levantar la API:

```bash
node scripts/crearAdmin.js   # crea el usuario admin; cambia su contraseña de inmediato
npm run dev                  # http://localhost:5000
```

### 2. Frontend

En otra terminal, desde la raíz del proyecto:

```bash
npm install
npm run dev                  # http://localhost:5173
```

Por defecto el frontend usa `http://localhost:5000`. Para otra URL, crear `.env.local` con `VITE_API_URL=...`.

### Scripts

| Dónde | Comando | Acción |
|---|---|---|
| Raíz | `npm run dev` | Frontend en modo desarrollo |
| Raíz | `npm run build` | Compila el frontend en `dist/` |
| Raíz | `npm run lint` | Revisa el código con Oxlint |
| `pakana-api` | `npm run dev` | API con recarga automática (nodemon) |
| `pakana-api` | `npm start` | API en modo normal |

## Despliegue (Vercel)

El repositorio se publica como **dos proyectos de Vercel**:

| Proyecto | Root Directory | Variables de entorno |
|---|---|---|
| Frontend | `./` | `VITE_API_URL` |
| Backend | `pakana-api` | Todas las del `.env` (excepto `PORT`) + `FRONTEND_URL` |

Además, en MongoDB Atlas → **Network Access** debe permitirse `0.0.0.0/0`. Cada `git push` a `main` vuelve a desplegar ambos proyectos. La guía completa está en [conocimiento/despliegue-vercel.md](conocimiento/despliegue-vercel.md).

## Manual del proyecto

La carpeta [`conocimiento/`](conocimiento/) documenta en detalle cada parte del sistema:

| Capítulo | Contenido |
|---|---|
| [catalogo-componentes.md](conocimiento/catalogo-componentes.md) | Componentes reutilizables con props, hook `useProductos` y utilidades |
| [imagenes-github.md](conocimiento/imagenes-github.md) | Subida automática de imágenes a GitHub desde el Admin |
| [chatbot.md](conocimiento/chatbot.md) | Funcionamiento, límites y costos del chatbot con Claude Haiku 5.5 |
| [despliegue-vercel.md](conocimiento/despliegue-vercel.md) | Publicación en producción y solución de errores |

## Seguridad

- Los archivos `.env` están excluidos de git mediante `.gitignore`.
- Las claves (MongoDB, JWT, Anthropic y GitHub) existen solo en el backend; el navegador nunca las ve.
- Las rutas de administración están protegidas con JWT y las contraseñas se guardan cifradas con bcrypt.
- En producción, CORS solo permite peticiones desde el dominio del frontend (`FRONTEND_URL`).
- El token de GitHub tiene acceso únicamente al repositorio de imágenes.
