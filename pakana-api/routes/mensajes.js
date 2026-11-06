import express from 'express';
import Mensaje from '../models/Mensaje.js';
import { proteger } from '../middleware/auth.js';

const router = express.Router();

// Público: enviar formulario
router.post('/', async (req, res) => {
  try {
    const { nombre, email, telefono, mensaje } = req.body;

    if (!nombre || !email || !telefono || !mensaje) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const nuevo = await Mensaje.create({ nombre, email, telefono, mensaje });
    res.status(201).json({ message: 'Mensaje enviado', id: nuevo._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: listar (más recientes primero)
router.get('/', proteger, async (req, res) => {
  try {
    const mensajes = await Mensaje.find().sort({ createdAt: -1 });
    res.json(mensajes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: marcar como leído
router.patch('/:id/leido', proteger, async (req, res) => {
  try {
    const msg = await Mensaje.findByIdAndUpdate(
      req.params.id,
      { leido: true },
      { new: true }
    );
    if (!msg) return res.status(404).json({ message: 'No encontrado' });
    res.json(msg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: eliminar
router.delete('/:id', proteger, async (req, res) => {
  try {
    const msg = await Mensaje.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ message: 'No encontrado' });
    res.json({ message: 'Eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;