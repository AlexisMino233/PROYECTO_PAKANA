import { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const API = 'http://localhost:5000';

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/productos`)
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

  const filtrados = productos.filter((p) => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    return (
      p.nombre?.toLowerCase().includes(q) ||
      p.descripcion?.toLowerCase().includes(q) ||
      p.categoria?.toLowerCase().includes(q)
    );
  });

  const descargarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Catálogo Pakána', 14, 20);

    const filas = filtrados.map((p) => [
      p.nombre || '',
      p.precios?.g100 != null ? `$${p.precios.g100}` : '-',
      p.precios?.lb1 != null ? `$${p.precios.lb1}` : '-',
      p.precios?.kg1 != null ? `$${p.precios.kg1}` : '-',
      p.precios?.lb25 != null ? `$${p.precios.lb25}` : '-',
      p.precios?.qq1 != null ? `$${p.precios.qq1}` : '-',
    ]);

    autoTable(doc, {
      startY: 28,
      head: [['Producto', '100 g', '1 lb', '1 kg', '25 lb', '1 qq']],
      body: filas,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [40, 40, 40] },
    });

    doc.save('catalogo-pakana.pdf');
  };

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

      <div className="catalogo-buscador">
        <input
          type="search"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button type="button" onClick={descargarPDF}>
          Descargar PDF
        </button>
      </div>

      <section className="catalogo-lista">
        {filtrados.length === 0 ? (
          <p>No se encontraron productos.</p>
        ) : (
          filtrados.map((p) => (
            <article key={p._id} className="producto-card">
              {p.imagen && <img src={p.imagen} alt={p.nombre} />}
              <h3>{p.nombre}</h3>
              {p.descripcion && <p>{p.descripcion}</p>}
              <ul className="precios">
                {p.precios?.g100 != null && <li>100 g: ${p.precios.g100}</li>}
                {p.precios?.lb1 != null && <li>1 lb: ${p.precios.lb1}</li>}
                {p.precios?.kg1 != null && <li>1 kg: ${p.precios.kg1}</li>}
                {p.precios?.lb25 != null && <li>25 lb: ${p.precios.lb25}</li>}
                {p.precios?.qq1 != null && (
                  <li>1 qq (100 lb): ${p.precios.qq1}</li>
                )}
              </ul>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

export default Catalogo;