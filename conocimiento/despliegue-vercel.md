# Despliegue en producción (Vercel)

> Parte del manual del proyecto PAKÁNA. Explica cómo se publican el frontend y el backend en Vercel.

## 1. Arquitectura en producción

El repositorio `PROYECTO_PAKANA` contiene **dos aplicaciones**, y cada una es un **proyecto distinto en Vercel**:

| Proyecto en Vercel | Carpeta del repo (Root Directory) | URL | Qué es |
|---|---|---|---|
| Frontend | `./` (raíz) | `https://proyecto-pakana.vercel.app` | La página (React + Vite) |
| Backend | `pakana-api` | `https://<nombre-api>.vercel.app` | La API (Express) |

```
Visitante ──► proyecto-pakana.vercel.app (React)
                    │  usa VITE_API_URL
                    ▼
              <api>.vercel.app (Express) ──► MongoDB Atlas
                    │                    ──► Anthropic (chatbot)
                    │                    ──► GitHub (imágenes)
```

Cada `git push` a `main` vuelve a publicar **ambos** proyectos automáticamente.

## 2. Cómo está preparado el código

### Backend (`pakana-api/server.js`)

| Qué | Por qué |
|---|---|
| `export default app` | Vercel no mantiene un servidor siempre encendido: ejecuta la app exportada con cada petición. |
| `app.listen` solo si **no** existe la variable `VERCEL` | En tu computadora (`npm run dev`) todo funciona como siempre. Vercel define `VERCEL` automáticamente. |
| `conectarDB()` con conexión reutilizable | Se conecta a MongoDB con la primera petición y las siguientes reutilizan la conexión. Si falla, responde `503` y reintenta en la próxima. |
| CORS con `FRONTEND_URL` | Solo tu frontend y `localhost:5173` pueden usar la API. Si `FRONTEND_URL` no está definida, se permite cualquier origen. |

### Frontend

| Archivo | Para qué |
|---|---|
| `src/config.js` | Define la URL de la API **en un solo lugar**: usa `VITE_API_URL` y, si no existe, `http://localhost:5000`. La usan `ChatBot`, `useProductos`, `Admin`, `Contacto` y `Login`. |
| `vercel.json` (raíz) | Envía todas las rutas a `index.html`. Sin esto, recargar la página en `/catalogo` o `/admin` da **404**, porque esas rutas las maneja React, no existen como archivos. |

> Las variables `VITE_...` se **incrustan al construir** el frontend. Si se cambia `VITE_API_URL` en Vercel, hay que volver a desplegar (**Redeploy**) para que tome efecto.

## 3. Paso a paso

### 3.1 MongoDB Atlas: permitir conexiones desde Vercel
1. Entrar a **cloud.mongodb.com** y abrir tu proyecto.
2. Ir a **Network Access** → **Add IP Address** → **Allow access from anywhere** (`0.0.0.0/0`) → **Confirm**.

Vercel cambia de IP constantemente. La base sigue protegida por usuario y contraseña.

### 3.2 Crear el proyecto del backend
1. En **vercel.com**: **Add New…** → **Project** → `PROYECTO_PAKANA` → **Import**.
2. **Project Name:** por ejemplo `pakana-api`.
3. **Root Directory:** **Edit** → `pakana-api` (obligatorio).
4. **Framework Preset:** `Express` (u `Other` si no aparece).
5. **Environment Variables** (copiar los valores del `.env`):

| Variable | Valor |
|---|---|
| `MONGODB_URI` | cadena de conexión de Atlas |
| `JWT_SECRET` | clave secreta larga |
| `ANTHROPIC_API_KEY` | clave de Anthropic |
| `GITHUB_TOKEN` | token de `pakana-imagenes` |
| `GITHUB_OWNER` | `AlexisMino233` |
| `GITHUB_REPO` | `pakana-imagenes` |
| `GITHUB_BRANCH` | `main` |
| `GITHUB_CARPETA` | `productos` |
| `FRONTEND_URL` | `https://proyecto-pakana.vercel.app` |

6. **Deploy**. Abrir la URL resultante: debe mostrar `{"message":"API Pakána funcionando"}`.

### 3.3 Conectar el frontend con el backend
1. Proyecto del **frontend** → **Settings** → **Environment Variables**.
2. Agregar `VITE_API_URL` = URL del backend (sin `/` al final).
3. **Deployments** → último despliegue → **⋯** → **Redeploy**.

### 3.4 Verificar
- [ ] `/catalogo` muestra los productos.
- [ ] El chatbot responde.
- [ ] `/login` → Admin → crear producto con imagen → aparece en el catálogo.
- [ ] Recargar estando en `/catalogo` **no** da 404.

## 4. Errores comunes

| Síntoma | Causa / solución |
|---|---|
| Catálogo: "Failed to fetch" | Falta `VITE_API_URL` en el frontend, o no se hizo **Redeploy** después de agregarla. |
| Error de CORS en la consola del navegador (F12) | `FRONTEND_URL` del backend no coincide **exactamente** con la URL del frontend (revisar `https://`). Redeploy del backend tras corregir. |
| API responde `503 Base de datos no disponible` | Falta `0.0.0.0/0` en Atlas → Network Access, o `MONGODB_URI` está mal escrita. |
| Chatbot: "El asistente no está disponible" | Falta o es inválida `ANTHROPIC_API_KEY` en el backend. |
| Subir imagen falla | Faltan variables `GITHUB_*` o el token venció. |
| 404 al recargar en `/catalogo` | Falta `vercel.json` en la raíz del frontend. |

Los errores del backend se ven en Vercel → proyecto de la API → **Logs**.

## 5. Historial de cambios

| Fecha | Cambio |
|---|---|
| 2026-11-20 | Backend preparado para Vercel (`export default app`, conexión reutilizable, CORS con `FRONTEND_URL`). Frontend con `src/config.js` (`VITE_API_URL`) y `vercel.json`. Probado localmente en modo Vercel y en modo local. |
