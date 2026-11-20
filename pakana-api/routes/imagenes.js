import express from 'express';
import multer from 'multer';
import { proteger } from '../middleware/auth.js';
import {
  TIPOS_PERMITIDOS,
  subirImagenGitHub,
  eliminarImagenGitHub,
} from '../utils/github.js';

const router = express.Router();

const TAMANO_MAXIMO = 2 * 1024 * 1024; // 2 MB

// La imagen se guarda en memoria (no en disco) y se envía directo a GitHub
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANO_MAXIMO },
  fileFilter: (req, file, cb) => {
    if (TIPOS_PERMITIDOS.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
  },
});

// Admin: subir imagen. Campo del formulario: "imagen" (archivo) y "nombre" (texto, opcional)
// Responde { url, ruta }
router.post('/', proteger, (req, res) => {
  upload.single('imagen')(req, res, async (err) => {
    if (err) {
      const message =
        err.code === 'LIMIT_FILE_SIZE' ? 'La imagen supera el máximo de 2 MB' : err.message;
      return res.status(400).json({ message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No se recibió ninguna imagen' });
    }

    try {
      const resultado = await subirImagenGitHub(req.file, req.body.nombre);
      res.status(201).json(resultado);
    } catch (error) {
      res.status(502).json({ message: error.message });
    }
  });
});

// Admin: eliminar imagen (se usa si la imagen se subió pero el producto no se pudo guardar)
// Body: { ruta }
router.delete('/', proteger, async (req, res) => {
  try {
    await eliminarImagenGitHub(req.body?.ruta);
    res.json({ message: 'Imagen eliminada' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
