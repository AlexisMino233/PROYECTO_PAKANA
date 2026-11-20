import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PRESENTACIONES, formatearPrecio } from './precios';

// Genera y descarga un PDF con la tabla de precios de los productos recibidos.
export function generarCatalogoPDF(productos) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Catálogo Pakána', 14, 20);

  const filas = productos.map((p) => [
    p.nombre || '',
    ...PRESENTACIONES.map(({ clave }) => formatearPrecio(p.precios?.[clave]) ?? '-'),
  ]);

  autoTable(doc, {
    startY: 28,
    head: [['Producto', ...PRESENTACIONES.map((pr) => pr.etiquetaCorta)]],
    body: filas,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [40, 40, 40] },
  });

  doc.save('catalogo-pakana.pdf');
}
