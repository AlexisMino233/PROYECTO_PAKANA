# Catálogo de productos: componentes reutilizables

> Parte del manual del proyecto PAKÁNA. Explica cómo está construida la página **Catálogo** (`/catalogo`).

## 1. ¿De dónde vienen los datos?

| Dato | Origen |
|---|---|
| Productos | Base de datos **MongoDB**, colección `productos`. El frontend los pide a la API con `GET http://localhost:5000/api/productos`. |
| Imágenes | Alojadas en **GitHub**. Cada producto guarda en el campo `imagen` una URL de `raw.githubusercontent.com`. |

Estructura de un producto (modelo `pakana-api/models/Producto.js`):

```js
{
  nombre: String,          // obligatorio
  descripcion: String,
  imagen: String,          // URL de la imagen en GitHub
  categoria: String,       // por defecto "condimento"
  destacado: Boolean,      // si es true aparece en "Productos destacados"
  precios: {
    g100: Number,          // 100 g   (opcional)
    lb1:  Number,          // 1 lb    (obligatorio)
    kg1:  Number,          // 1 kg    (opcional)
    lb25: Number,          // 25 lb   (opcional)
    qq1:  Number,          // 1 qq = 100 lb (obligatorio)
  }
}
```

## 2. Estructura de archivos

```
src/
├── pages/
│   └── Catalogo.jsx              ← página: une todas las piezas
├── components/
│   └── catalogo/
│       ├── BuscadorCatalogo.jsx  ← búsqueda + botón PDF
│       ├── SeccionProductos.jsx  ← título + cuadrícula de tarjetas
│       ├── ProductoCard.jsx      ← tarjeta de un producto
│       ├── ProductoImagen.jsx    ← imagen con respaldo (logo)
│       └── ListaPrecios.jsx      ← lista de precios
├── hooks/
│   └── useProductos.js           ← carga los productos desde la API
└── utils/
    ├── precios.js                ← lista de presentaciones (100 g, 1 lb…)
    ├── imagenes.js               ← corrige enlaces de GitHub
    └── catalogoPDF.js            ← genera el PDF del catálogo
```

## 3. Cómo se relacionan los componentes

```
Catalogo
 ├── useProductos()                      → { productos, cargando, error }
 ├── <BuscadorCatalogo valor onCambiar onDescargarPDF />
 ├── <SeccionProductos titulo="Productos destacados" productos={destacados} />
 │     └── <ProductoCard producto />  (una por producto)
 │           ├── <ProductoImagen src alt />
 │           └── <ListaPrecios precios />
 └── <SeccionProductos titulo="Todos los productos" productos={resto} mensajeVacio />
```

Los datos **bajan** de padre a hijo a través de **props**. Cuando un hijo necesita avisar algo al padre (por ejemplo, que el usuario escribió en el buscador), el padre le pasa una **función** como prop (`onCambiar`).

## 4. Referencia de componentes

### `ProductoCard`
Tarjeta de un producto.

| Prop | Tipo | Descripción |
|---|---|---|
| `producto` | objeto | Un documento de la colección `productos` |
| `children` | contenido JSX (opcional) | Lo que se escribe **entre** las etiquetas de apertura y cierre. Se muestra al final de la tarjeta. |

```jsx
// En el catálogo:
<ProductoCard producto={p} />

// En el Panel Admin, con botones dentro de la tarjeta:
<ProductoCard producto={p}>
  <button onClick={() => editar(p)}>Editar</button>
  <button onClick={() => eliminar(p._id)}>Eliminar</button>
</ProductoCard>
```

`children` es un prop especial de React: no se escribe como `children={...}`, sino que es todo lo que va entre `<ProductoCard>` y `</ProductoCard>`. Así **el mismo componente** sirve en el catálogo (sin botones) y en el Admin (con botones).

### `ProductoImagen`
Muestra la imagen del producto desde GitHub.
- Usa `loading="lazy"`: la imagen se descarga solo cuando está por aparecer en pantalla.
- Si la URL está vacía o la imagen no carga, muestra el **logo de PAKÁNA**.
- Si la URL es un enlace normal de GitHub (`github.com/.../blob/...`), lo convierte automáticamente a `raw.githubusercontent.com/...`.

| Prop | Tipo | Descripción |
|---|---|---|
| `src` | string | URL de la imagen |
| `alt` | string | Texto alternativo (accesibilidad) |

### `ListaPrecios`
Muestra solo las presentaciones que tienen precio.

| Prop | Tipo | Descripción |
|---|---|---|
| `precios` | objeto | El campo `precios` del producto |

### `SeccionProductos`
Una sección con título y cuadrícula de tarjetas. Se usa dos veces: destacados y resto.

| Prop | Tipo | Descripción |
|---|---|---|
| `titulo` | string | Encabezado de la sección |
| `productos` | arreglo | Productos a mostrar |
| `mensajeVacio` | string (opcional) | Texto si no hay productos. Si no se pasa y la lista está vacía, la sección no se muestra |
| `className` | string (opcional) | Clase CSS extra |

### `BuscadorCatalogo`

| Prop | Tipo | Descripción |
|---|---|---|
| `valor` | string | Texto actual de la búsqueda |
| `onCambiar` | función | Recibe el nuevo texto cada vez que el usuario escribe |
| `onDescargarPDF` | función | Se ejecuta al pulsar "Descargar PDF" |

## 5. Hook y utilidades

| Archivo | Qué exporta | Uso |
|---|---|---|
| `hooks/useProductos.js` | `useProductos()` | Devuelve `{ productos, cargando, error, recargar }`. Lo usan el **Catálogo** y el **Panel Admin**. `recargar()` vuelve a pedir los productos; el Admin la llama después de crear, editar o eliminar. |
| `utils/precios.js` | `PRESENTACIONES`, `formatearPrecio()` | Lista única de presentaciones. Si se agrega una nueva (por ejemplo, 5 lb), se agrega **solo aquí** y aparece en tarjetas y PDF. |
| `utils/imagenes.js` | `normalizarUrlImagen()` | Convierte enlaces `github.com/.../blob/...` al formato `raw`. |
| `utils/catalogoPDF.js` | `generarCatalogoPDF(productos)` | Crea el PDF con jsPDF + jspdf-autotable. Exporta los productos **filtrados** por la búsqueda. |

## 6. ¿Función común o componente con props?

Antes las tarjetas se dibujaban con una función interna, `renderProducto(p)`. Funcionaba, pero **no era un componente**:

| | `renderProducto(p)` (antes) | `<ProductoCard producto={p} />` (ahora) |
|---|---|---|
| Qué es | Función común de JavaScript | Componente de React |
| Qué recibe | Un argumento | Un objeto `props` |
| Puede usar hooks | No | Sí |
| Aparece en React DevTools | No | Sí |
| Reutilizable en otras páginas | No | Sí (se importa) |

## 7. Cómo subir una imagen de producto (GitHub)

Desde el 2026-11-19 la imagen se sube **directamente desde el Panel Admin**, eligiendo un archivo. Ver el capítulo [imagenes-github.md](imagenes-github.md).

Sigue existiendo la opción de pegar una URL a mano. Sirve tanto el enlace normal de GitHub (`github.com/.../blob/...`) como el **Raw** (`raw.githubusercontent.com/...`), porque `ProductoImagen` lo corrige automáticamente.

## 8. Historial de cambios

| Fecha | Cambio |
|---|---|
| 2026-11-19 | Se dividió `Catalogo.jsx` en componentes reutilizables con props, hook `useProductos` y utilidades. Se agregó imagen de respaldo y corrección automática de enlaces de GitHub. |
| 2026-11-19 | El **Panel Admin** reutiliza `ProductoCard` (con botones vía `children`) y `useProductos` (con `recargar`). La lista del Admin pasa a ser una cuadrícula de tarjetas igual a la del catálogo. |

## 9. Dónde se reutilizan los componentes

| Pieza | Catálogo (`/catalogo`) | Panel Admin (`/admin`) |
|---|---|---|
| `useProductos` | ✔ | ✔ (usa además `recargar`) |
| `ProductoCard` | ✔ (sin `children`) | ✔ (con botones Editar / Eliminar) |
| `ProductoImagen`, `ListaPrecios` | ✔ (dentro de la tarjeta) | ✔ (dentro de la tarjeta) |
| `SeccionProductos`, `BuscadorCatalogo` | ✔ | — |
