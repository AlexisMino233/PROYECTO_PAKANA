import { PRESENTACIONES, formatearPrecio } from '../../utils/precios';

// Lista de precios de un producto. Solo muestra las presentaciones que tienen precio.
function ListaPrecios({ precios }) {
  const disponibles = PRESENTACIONES.filter(({ clave }) => precios?.[clave] != null);
  if (disponibles.length === 0) return null;

  return (
    <ul className="precios">
      {disponibles.map(({ clave, etiqueta }) => (
        <li key={clave}>
          {etiqueta}: {formatearPrecio(precios[clave])}
        </li>
      ))}
    </ul>
  );
}

export default ListaPrecios;
