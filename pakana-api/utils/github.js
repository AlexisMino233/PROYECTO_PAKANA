// Sube y elimina imágenes de productos en un repositorio público de GitHub,
// usando la API REST de GitHub (endpoint "contents").
// Configuración en .env: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO,
// GITHUB_BRANCH (por defecto "main"), GITHUB_CARPETA (por defecto "productos").

const GITHUB_API = 'https://api.github.com';

const EXTENSIONES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const TIPOS_PERMITIDOS = Object.keys(EXTENSIONES);

function config() {
  const {
    GITHUB_TOKEN,
    GITHUB_OWNER,
    GITHUB_REPO,
    GITHUB_BRANCH = 'main',
    GITHUB_CARPETA = 'productos',
  } = process.env;

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    throw new Error('Faltan GITHUB_TOKEN, GITHUB_OWNER o GITHUB_REPO en el archivo .env');
  }

  return {
    token: GITHUB_TOKEN,
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    branch: GITHUB_BRANCH,
    carpeta: GITHUB_CARPETA,
  };
}

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'pakana-api',
  };
}

// "Cúrcuma Molida" -> "curcuma-molida"
function slug(texto) {
  return (
    (texto || 'producto')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'producto'
  );
}

function urlContenido({ owner, repo }, ruta) {
  const rutaCodificada = ruta.split('/').map(encodeURIComponent).join('/');
  return `${GITHUB_API}/repos/${owner}/${repo}/contents/${rutaCodificada}`;
}

// Sube un archivo recibido por multer. Devuelve { url, ruta }.
//  - url:  enlace raw.githubusercontent.com que se guarda en MongoDB (campo "imagen")
//  - ruta: ruta del archivo dentro del repo (campo "imagenRuta"), necesaria para borrarlo
export async function subirImagenGitHub(archivo, nombreProducto) {
  const cfg = config();
  const extension = EXTENSIONES[archivo.mimetype];
  if (!extension) throw new Error('Tipo de imagen no permitido');

  // Nombre único: evita pisar imágenes y que GitHub muestre una versión vieja en caché
  const ruta = `${cfg.carpeta}/${slug(nombreProducto)}-${Date.now()}.${extension}`;

  const res = await fetch(urlContenido(cfg, ruta), {
    method: 'PUT',
    headers: headers(cfg.token),
    body: JSON.stringify({
      message: `Agregar imagen ${ruta}`,
      content: archivo.buffer.toString('base64'),
      branch: cfg.branch,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`GitHub rechazó la subida (${res.status}): ${data.message || 'error desconocido'}`);
  }

  return {
    url: `https://raw.githubusercontent.com/${cfg.owner}/${cfg.repo}/${cfg.branch}/${ruta}`,
    ruta,
  };
}

// Elimina una imagen del repo. Solo borra archivos dentro de la carpeta configurada.
// Si el archivo ya no existe, no hace nada.
export async function eliminarImagenGitHub(ruta) {
  if (!ruta) return;
  const cfg = config();

  if (!ruta.startsWith(`${cfg.carpeta}/`) || ruta.includes('..')) {
    throw new Error('Ruta de imagen no válida');
  }

  // GitHub exige el "sha" (identificador) del archivo para poder borrarlo
  const info = await fetch(`${urlContenido(cfg, ruta)}?ref=${cfg.branch}`, {
    headers: headers(cfg.token),
  });
  if (info.status === 404) return;
  if (!info.ok) throw new Error(`No se pudo consultar la imagen en GitHub (${info.status})`);
  const { sha } = await info.json();

  const res = await fetch(urlContenido(cfg, ruta), {
    method: 'DELETE',
    headers: headers(cfg.token),
    body: JSON.stringify({
      message: `Eliminar imagen ${ruta}`,
      sha,
      branch: cfg.branch,
    }),
  });

  if (!res.ok && res.status !== 404) {
    throw new Error(`No se pudo eliminar la imagen en GitHub (${res.status})`);
  }
}

// Versión "segura" para usar al borrar/actualizar productos:
// si falla, solo lo registra en consola y no interrumpe la operación principal.
export async function eliminarImagenSilencioso(ruta) {
  try {
    await eliminarImagenGitHub(ruta);
  } catch (error) {
    console.error('Aviso: no se pudo eliminar la imagen de GitHub:', error.message);
  }
}
