import express from 'express';
import Producto from '../models/Producto.js';
import { proteger } from '../middleware/auth.js';

const router = express.Router();

// Público
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find().sort({ createdAt: -1 });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).json({ message: 'No encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Protegidas (solo admin)
router.post('/', proteger, async (req, res) => {
  try {
    const producto = await Producto.create(req.body);
    res.status(201).json(producto);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', proteger, async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!producto) return res.status(404).json({ message: 'No encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', proteger, async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).json({ message: 'No encontrado' });
    res.json({ message: 'Eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;