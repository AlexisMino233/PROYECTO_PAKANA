import { useState } from 'react';
import { useProductos } from '../hooks/useProductos';
import { generarCatalogoPDF } from '../utils/catalogoPDF';
import BuscadorCatalogo from '../components/catalogo/BuscadorCatalogo';
import SeccionProductos from '../components/catalogo/SeccionProductos';

function Catalogo() {
  const { productos, cargando, error } = useProductos();
  const [busqueda, setBusqueda] = useState('');

  const q = busqueda.toLowerCase().trim();
  const filtrados = q
    ? productos.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(q) ||
          p.descripcion?.toLowerCase().includes(q) ||
          p.categoria?.toLowerCase().includes(q)
      )
    : productos;

  const destacados = filtrados.filter((p) => p.destacado);
  const resto = filtrados.filter((p) => !p.destacado);

  const mensajeVacio =
    filtrados.length === 0
      ? 'No se encontraron productos.'
      : 'No hay más productos fuera de destacados.';

  if (cargando) return <main><p className="estado">Cargando catálogo...</p></main>;
  if (error) return <main><p className="estado">Error: {error}</p></main>;

  return (
    <main>
      <section className="catalogo-header">
        <h1>Nuestro Catálogo</h1>
        <p>
          Descubre nuestra variedad de condimentos molidos, seleccionados para
          acompañar y realzar el sabor de tus comidas.
        </p>
      </section>

      <BuscadorCatalogo
        valor={busqueda}
        onCambiar={setBusqueda}
        onDescargarPDF={() => generarCatalogoPDF(filtrados)}
      />

      <SeccionProductos
        titulo="Productos destacados"
        productos={destacados}
        className="catalogo-destacados"
      />

      <SeccionProductos
        titulo="Todos los productos"
        productos={resto}
        mensajeVacio={mensajeVacio}
      />
    </main>
  );
}

export default Catalogo;
