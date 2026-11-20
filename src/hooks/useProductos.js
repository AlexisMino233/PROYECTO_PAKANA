import { useCallback, useEffect, useState } from 'react';

const API = 'http://localhost:5000';

// Hook reutilizable: carga los productos desde la API (MongoDB).
// Devuelve { productos, cargando, error, recargar }.
//  - recargar(): vuelve a pedir los productos (por ejemplo, después de crear,
//    editar o eliminar uno en el Panel Admin).
export function useProductos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0); // al cambiar, se vuelve a cargar

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let cancelado = false; // evita actualizar estado si el componente se desmonta

    fetch(`${API}/api/productos`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar productos');
        return res.json();
      })
      .then((data) => {
        if (!cancelado) {
          setProductos(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelado) setError(err.message);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [version]);

  return { productos, cargando, error, recargar };
}
