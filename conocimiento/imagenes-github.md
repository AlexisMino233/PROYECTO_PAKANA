# Imágenes de productos: subida automática a GitHub

> Parte del manual del proyecto PAKÁNA. Explica cómo se suben las imágenes de los productos desde el Panel Admin y dónde quedan guardadas.

## 1. Resumen

Desde el formulario del **Panel Admin** se elige una imagen de la computadora. El sistema:

1. La envía a la API (`pakana-api`).
2. La API la sube a un **repositorio público de GitHub** (`pakana-imagenes`).
3. GitHub devuelve la ubicación del archivo y la API arma el enlace directo (`raw.githubusercontent.com`).
4. Ese enlace se guarda en **MongoDB**, en el campo `imagen` del producto.

El catálogo no cambia: sigue leyendo `producto.imagen` como siempre.

```
Panel Admin ──(archivo)──► API /api/imagenes ──(token)──► GitHub (repo pakana-imagenes)
     ▲                            │                               │
     │                            ◄────────── url + ruta ─────────┘
     └──── guarda el producto ──► API /api/productos ──► MongoDB (campo "imagen")
```

## 2. Cómo queda un producto en MongoDB

```js
{
  nombre: 'Cúrcuma molida',
  imagen: 'https://raw.githubusercontent.com/USUARIO/pakana-imagenes/main/productos/curcuma-molida-1732012345678.jpg',
  imagenRuta: 'productos/curcuma-molida-1732012345678.jpg',
  // ...resto de campos (descripcion, categoria, destacado, precios)
}
```

| Campo | Para qué sirve |
|---|---|
| `imagen` | Enlace que usa el catálogo para mostrar la imagen. |
| `imagenRuta` | Ubicación del archivo dentro del repo. Permite **borrarlo** de GitHub. Queda vacío si la URL se pegó a mano. |

El nombre del archivo es **nombre del producto + número de fecha**. Así dos imágenes nunca se pisan, y GitHub no muestra una versión vieja guardada en caché.

## 3. Configuración inicial (se hace una sola vez)

### 3.1 Crear el repositorio de imágenes

1. En GitHub: **New repository**.
2. Nombre: `pakana-imagenes`.
3. Visibilidad: **Public**. Es obligatorio: si el repo es privado, los enlaces `raw` no funcionan en la página.
4. Marcar **Add a README file**, para que exista la rama `main`.
5. **Create repository**.

### 3.2 Crear el token (llave de acceso)

1. GitHub → foto de perfil → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
2. **Token name:** `pakana-api-imagenes`.
3. **Expiration:** la que prefieras. Al vencer, hay que generar uno nuevo y reemplazarlo en el `.env`.
4. **Repository access:** *Only select repositories* → `pakana-imagenes`.
5. **Permissions** → **Repository permissions** → **Contents:** *Read and write*.
6. **Generate token** y copiarlo. GitHub lo muestra **una sola vez**.

> El token solo puede tocar el repositorio de imágenes. No tiene acceso a tu proyecto principal ni a otros repositorios.

### 3.3 Agregar las variables al `.env` de `pakana-api`

```
GITHUB_TOKEN=github_pat_xxxxxxxxxxxx
GITHUB_OWNER=tu-usuario-de-github
GITHUB_REPO=pakana-imagenes
GITHUB_BRANCH=main
GITHUB_CARPETA=productos
```

Luego hay que **reiniciar** la API (`npm run dev`).

> El `.env` está en `.gitignore`: **nunca** se sube a GitHub. El token vive solo en el servidor; el navegador nunca lo ve.

## 4. Uso desde el Panel Admin

1. Entrar a `/login` → Panel Admin → pestaña **Productos**.
2. En **Imagen**, pulsar *Elegir archivo* y seleccionar una imagen **JPG, PNG o WEBP** de hasta **2 MB**.
3. Aparece una **vista previa**.
4. Completar el resto de los datos y pulsar **Crear** (o **Actualizar**).
5. Se muestran los mensajes "Subiendo imagen..." y luego "Guardando producto...".

**Alternativa:** también se puede pegar una URL de imagen en el campo de texto, como antes.

### Qué pasa en cada caso

| Acción | Qué hace el sistema con GitHub |
|---|---|
| Crear producto con imagen | Sube la imagen (crea 1 commit en `pakana-imagenes`). |
| Editar y elegir otra imagen | Sube la nueva y **borra la anterior**. |
| Editar y pegar una URL a mano | **Borra** la imagen anterior subida por el sistema. |
| Editar sin tocar la imagen | Nada. |
| Eliminar producto | **Borra** su imagen. |
| La imagen se sube pero el producto falla al guardarse | **Borra** la imagen recién subida, para no dejar archivos huérfanos. |
| Imagen pegada a mano (URL externa) | Nunca se borra, porque no pertenece al sistema. |

## 5. Archivos involucrados

| Archivo | Rol |
|---|---|
| `pakana-api/utils/github.js` | Habla con la API de GitHub: `subirImagenGitHub()`, `eliminarImagenGitHub()`. |
| `pakana-api/routes/imagenes.js` | Rutas protegidas `POST /api/imagenes` (subir) y `DELETE /api/imagenes` (borrar). Usa **multer** para recibir el archivo y validar tipo y tamaño. |
| `pakana-api/routes/productos.js` | Al actualizar o eliminar un producto, borra la imagen vieja. |
| `pakana-api/models/Producto.js` | Campo nuevo `imagenRuta`. |
| `src/pages/Admin.jsx` | Selector de archivo, vista previa y flujo "subir imagen → guardar producto". |

## 6. Seguridad

- **Rutas protegidas:** solo el admin con sesión iniciada (token JWT) puede subir o borrar imágenes.
- **Validaciones:** solo se aceptan imágenes JPG, PNG o WEBP de hasta 2 MB. Se valida en el navegador **y** en el servidor.
- **Borrado limitado:** la API solo puede borrar archivos dentro de la carpeta `productos/` del repo de imágenes.
- **Permisos mínimos:** el token de GitHub solo tiene permiso sobre el contenido de `pakana-imagenes`.

## 7. Errores comunes

| Mensaje | Causa / solución |
|---|---|
| `Faltan GITHUB_TOKEN, GITHUB_OWNER o GITHUB_REPO en el archivo .env` | Falta configurar el `.env` (sección 3.3) o reiniciar la API. |
| `GitHub rechazó la subida (401)` | Token incorrecto o vencido. Generar uno nuevo. |
| `GitHub rechazó la subida (403)` | El token no tiene permiso *Contents: Read and write* sobre el repo. |
| `GitHub rechazó la subida (404)` | `GITHUB_OWNER` o `GITHUB_REPO` mal escritos, o el token no incluye ese repo. |
| `La imagen supera el máximo de 2 MB` | Comprimir la imagen (por ejemplo, con squoosh.app) y volver a intentar. |
| La imagen no se ve en el catálogo | Verificar que el repo sea **público**. |

## 8. Historial de cambios

| Fecha | Cambio |
|---|---|
| 2026-11-19 | Se implementa la subida de imágenes desde el Admin a GitHub, con borrado automático y validaciones. Se agrega la dependencia `multer` en `pakana-api`. |
| 2026-11-19 | Prueba real exitosa en `pakana-imagenes`: subida, enlace raw accesible (200 `image/png`), borrado verificado y bloqueo de rutas fuera de `productos/`. |
