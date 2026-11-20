// Las imágenes de los productos se alojan en GitHub.
// Un enlace "normal" de GitHub (github.com/usuario/repo/blob/rama/ruta.jpg)
// abre una página web, no la imagen. Esta función lo convierte al formato
// directo: raw.githubusercontent.com/usuario/repo/rama/ruta.jpg
export function normalizarUrlImagen(url) {
  if (!url) return '';
  const limpia = url.trim();

  const coincidencia = limpia.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:blob|raw)\/(.+?)(\?.*)?$/
  );
  if (coincidencia) {
    const [, usuario, repo, resto] = coincidencia;
    return `https://raw.githubusercontent.com/${usuario}/${repo}/${resto}`;
  }

  return limpia;
}
