import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import productosRoutes from './routes/productos.js';
import authRoutes from './routes/auth.js';
import mensajesRoutes from './routes/mensajes.js';
import chatRoutes from './routes/chat.js';
import imagenesRoutes from './routes/imagenes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS: quién puede usar la API ───────────────────────────────────────────
// En producción se define FRONTEND_URL (ej. https://proyecto-pakana.vercel.app):
// solo ese sitio y tu computadora (localhost:5173) pueden llamar a la API.
// Si FRONTEND_URL no existe, se permite cualquier origen (útil al empezar).
const origenesPermitidos = [process.env.FRONTEND_URL, 'http://localhost:5173']
  .filter(Boolean)
  .map((url) => url.replace(/\/+$/, ''));

app.use(cors(process.env.FRONTEND_URL ? { origin: origenesPermitidos } : undefined));
app.use(express.json());

// ─── Conexión a MongoDB reutilizable ─────────────────────────────────────────
// En Vercel la API "despierta" con cada petición: se conecta la primera vez y
// las siguientes peticiones reutilizan la misma conexión.
let conexionPendiente = null;

function conectarDB() {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (!conexionPendiente) {
    conexionPendiente = mongoose.connect(process.env.MONGODB_URI).catch((error) => {
      conexionPendiente = null; // permite reintentar en la próxima petición
      throw error;
    });
  }
  return conexionPendiente;
}

app.get('/', (req, res) => {
  res.json({ message: 'API Pakána funcionando' });
});

// Toda ruta /api espera a que la base de datos esté conectada
app.use('/api', async (req, res, next) => {
  try {
    await conectarDB();
    next();
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
    res.status(503).json({ message: 'Base de datos no disponible. Intenta de nuevo.' });
  }
});

app.use('/api/chat', chatRoutes);
app.use('/api/mensajes', mensajesRoutes);
app.use('/api/imagenes', imagenesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);

// ─── Arranque ─────────────────────────────────────────────────────────────────
// En tu computadora (npm run dev) se levanta el servidor como siempre.
// En Vercel (variable VERCEL definida automáticamente) NO se usa app.listen:
// Vercel usa la app exportada abajo.
if (!process.env.VERCEL) {
  conectarDB()
    .then(() => {
      console.log('Conectado a MongoDB');
      app.listen(PORT, () => {
        console.log(`Servidor en http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error('Error conectando a MongoDB:', error.message);
    });
}

export default app;
