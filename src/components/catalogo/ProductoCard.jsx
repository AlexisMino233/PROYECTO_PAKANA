import ProductoImagen from './ProductoImagen';
import ListaPrecios from './ListaPrecios';

// Tarjeta de un producto del catálogo.
// Props:
//  - producto: un documento de la colección `productos` de MongoDB
//  - children (opcional): contenido extra al final de la tarjeta.
//    El catálogo no lo usa; el Panel Admin lo usa para los botones Editar / Eliminar.
function ProductoCard({ producto, children }) {
  const { nombre, descripcion, imagen, precios } = producto;

  return (
    <article className="producto-card">
      <ProductoImagen src={imagen} alt={nombre} />
      <h3>{nombre}</h3>
      {descripcion && <p>{descripcion}</p>}
      <ListaPrecios precios={precios} />
      {children && (
        <div
          className="producto-acciones"
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', padding: '0 1.25rem 1.25rem' }}
        >
          {children}
        </div>
      )}
    </article>
  );
}

export default ProductoCard;
