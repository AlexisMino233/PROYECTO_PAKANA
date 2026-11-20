// Barra superior del catálogo: campo de búsqueda y botón para descargar el PDF.
// Props:
//  - valor: texto actual de la búsqueda
//  - onCambiar: función que recibe el nuevo texto
//  - onDescargarPDF: función que se ejecuta al pulsar "Descargar PDF"
function BuscadorCatalogo({ valor, onCambiar, onDescargarPDF }) {
  return (
    <div className="catalogo-buscador">
      <input
        type="search"
        placeholder="Buscar producto..."
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
      />
      <button type="button" onClick={onDescargarPDF}>
        Descargar PDF
      </button>
    </div>
  );
}

export default BuscadorCatalogo;
