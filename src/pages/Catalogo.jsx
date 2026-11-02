import { useEffect, useState } from 'react';

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/productos')
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar productos');
        return res.json();
      })
      .then((data) => {
        setProductos(data);
        setCargando(false);
      })
      .catch((err) => {
        setError(err.message);
        setCargando(false);
      });
  }, []);

  if (cargando) return <p>Cargando catálogo...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main>
      <section className="catalogo-header">
        <h1>Nuestro Catálogo</h1>
        <p>
          Descubre nuestra variedad de condimentos molidos, seleccionados para
          acompañar y realzar el sabor de tus comidas.
        </p>
      </section>

      <section className="catalogo-lista">
        {productos.length === 0 ? (
          <p>No hay productos todavía.</p>
        ) : (
          productos.map((p) => (
            <article key={p._id} className="producto-card">
              {p.imagen && <img src={p.imagen} alt={p.nombre} />}
              <h3>{p.nombre}</h3>
              <p>{p.descripcion}</p>
              <p className="precio">${p.precio}</p>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

export default Catalogo;