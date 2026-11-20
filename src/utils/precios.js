// Presentaciones de venta de un producto.
// `clave` coincide con los campos de `precios` en el modelo Producto (MongoDB).
// Se usa en las tarjetas del catálogo y en el PDF, así solo se define una vez.
export const PRESENTACIONES = [
  { clave: 'g100', etiqueta: '100 g', etiquetaCorta: '100 g' },
  { clave: 'lb1', etiqueta: '1 lb', etiquetaCorta: '1 lb' },
  { clave: 'kg1', etiqueta: '1 kg', etiquetaCorta: '1 kg' },
  { clave: 'lb25', etiqueta: '25 lb', etiquetaCorta: '25 lb' },
  { clave: 'qq1', etiqueta: '1 qq (100 lb)', etiquetaCorta: '1 qq' },
];

// Devuelve el precio como texto "$X" o null si esa presentación no existe.
export function formatearPrecio(valor) {
  return valor != null ? `$${valor}` : null;
}
