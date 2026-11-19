import express from 'express';
import Producto from '../models/Producto.js';

const router = express.Router();

const SYSTEM_PROMPT = `Eres el asistente de PAKÁNA, una marca de condimentos y especias (cúrcuma y más).

REGLAS:
- Solo hablas de recetas que usen especias/condimentos y de productos del catálogo de PAKÁNA.
- Si preguntan algo fuera de eso, responde amable y breve que solo puedes ayudar con recetas y productos PAKÁNA.
- Cuando recomiendes, usa preferentemente productos del catálogo que te pasan abajo.
- Sé claro, cercano y en español.
- Respuestas no demasiado largas.

CATÁLOGO ACTUAL (nombre y precios):
`;

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'messages requerido' });
    }

    const productos = await Producto.find().select(
      'nombre descripcion precios destacado'
    );
    const catalogoTexto = productos
      .map((p) => {
        const pr = p.precios || {};
        return `- ${p.nombre}${p.destacado ? ' (destacado)' : ''}: 1lb $${pr.lb1 ?? '-'}, 1qq $${pr.qq1 ?? '-'}${pr.g100 != null ? `, 100g $${pr.g100}` : ''}`;
      })
      .join('\n');

    // Claude no acepta "system" dentro de messages
    const claudeMessages = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: SYSTEM_PROMPT + (catalogoTexto || 'Catálogo vacío por ahora.'),
        messages: claudeMessages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: data.error?.message || 'Error en la API de Claude',
      });
    }

    const reply =
      data.content?.find((b) => b.type === 'text')?.text ||
      'No pude generar respuesta.';

    res.json({ reply });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;