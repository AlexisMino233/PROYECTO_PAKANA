import { useState } from 'react';
import logo from '../../assets/logo_pakana.jpg';
import { normalizarUrlImagen } from '../../utils/imagenes';

// Imagen de un producto alojada en GitHub.
// Si no hay URL o la imagen no carga, muestra el logo de PAKÁNA.
function ProductoImagen({ src, alt }) {
  const url = normalizarUrlImagen(src);
  const [urlFallida, setUrlFallida] = useState(null);

  const usarRespaldo = !url || urlFallida === url;

  return (
    <img
      src={usarRespaldo ? logo : url}
      alt={alt}
      loading="lazy"
      onError={() => {
        if (!usarRespaldo) setUrlFallida(url);
      }}
    />
  );
}

export default ProductoImagen;
