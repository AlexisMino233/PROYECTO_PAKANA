import ProductoCard from './ProductoCard';

// Sección del catálogo: un título y una cuadrícula de tarjetas.
// Props:
//  - titulo: texto del encabezado
//  - productos: arreglo de productos a mostrar
//  - mensajeVacio: texto si no hay productos (si no se pasa, la sección no se muestra)
//  - className: clase extra para la sección (opcional)
function SeccionProductos({ titulo, productos, mensajeVacio, className = '' }) {
  if (productos.length === 0 && !mensajeVacio) return null;

  return (
    <section className={`catalogo-lista ${className}`.trim()}>
      <h2>{titulo}</h2>
      {productos.length === 0 ? (
        <p>{mensajeVacio}</p>
      ) : (
        productos.map((p) => <ProductoCard key={p._id} producto={p} />)
      )}
    </section>
  );
}

export default SeccionProductos;
