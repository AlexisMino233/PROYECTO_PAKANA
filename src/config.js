// URL de la API (backend).
// - En producción (Vercel) se toma de la variable de entorno VITE_API_URL.
// - En tu computadora, si no existe, usa http://localhost:5000.
// Se quita la "/" final por si la URL se escribió con ella.
export const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
