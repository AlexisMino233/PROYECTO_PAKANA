import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import Producto from '../models/Producto.js';

const router = express.Router();

// ─── Configuración del chatbot ────────────────────────────────────────────────
// Modelo FIJO: el chatbot siempre usa Claude Haiku 5.5. No hay respaldo a otro
// modelo: si Haiku falla o rechaza una pregunta, se responde con un mensaje amable.
const MODELO = 'claude-haiku-5-5';
const MAX_TOKENS = 1024; // límite de la respuesta (incluye lo que el modelo "piensa")
const ESFUERZO = 'low'; // piensa poco: respuestas más rápidas, cortas y baratas
const MAX_CARACTERES_PREGUNTA = 500;
const MAX_MENSAJES_HISTORIAL = 10; // solo se envían los últimos 10 mensajes

// El SDK lee ANTHROPIC_API_KEY del .env. Reintenta solo ante fallos temporales
// (red, 429, 5xx) y siempre con el mismo modelo.
let cliente;
const obtenerCliente = () => (cliente ??= new Anthropic());

const SYSTEM_PROMPT = `Eres el asistente de PAKÁNA, una marca de condimentos y especias (cúrcuma y más).

FORMATO OBLIGATORIO:
- Responde solo en texto plano. No uses Markdown: nada de asteriscos (**), almohadillas (#), guiones bajos, tablas ni bloques de código.
- Para listas usa números simples ("1. ") o guiones ("- ") al inicio de la línea.
- Para separar secciones usa saltos de línea, por ejemplo "Ingredientes:" en su propia línea.

REGLAS:
- Solo hablas de recetas que usen especias/condimentos y de productos del catálogo de PAKÁNA.
- Si preguntan algo fuera de eso, responde amable y breve que solo puedes ayudar con recetas y productos PAKÁNA.
- Cuando recomiendes, usa preferentemente productos del catálogo que te pasan abajo.
- Sé claro, cercano y en español.
- Respuestas breves: ve al punto. En recetas, solo ingredientes clave y pasos cortos.

CATÁLOGO ACTUAL (nombre y precios):
`;

const MENSAJE_RECHAZO =
  'Lo siento, no puedo ayudarte con eso. Pregúntame por recetas con especias o por nuestros productos PAKÁNA.';
const MENSAJE_ERROR = 'No pude generar respuesta. Intenta de nuevo.';

// Red de seguridad: si Claude se salta la regla de texto plano, quita los
// símbolos de Markdown. Conserva los saltos de línea y las listas con "- " o "1. ".
export function limpiarMarkdown(texto) {
  return texto
    .replace(/^```.*$/gm, '') // bloques de código
    // Nota: se usa [ \t] y no \s para no "comerse" los saltos de línea
    .replace(/^[ \t]*([-*_][ \t]*){3,}$/gm, '') // líneas separadoras (---, ***)
    .replace(/^[ \t]*\|?[ \t]*:?-{3,}:?[ \t]*(\|[ \t]*:?-{3,}:?[ \t]*)*\|?[ \t]*$/gm, '') // separador de tablas
    .replace(/^[ \t]*\|(.*)\|[ \t]*$/gm, (_, celdas) =>
      celdas.split('|').map((c) => c.trim()).filter(Boolean).join(' - ')
    ) // filas de tablas
    .replace(/^[ \t]{0,3}#{1,6}[ \t]+/gm, '') // títulos (# Título)
    .replace(/^[ \t]{0,3}>[ \t]?/gm, '') // citas (> texto)
    .replace(/^([ \t]*)[*+][ \t]+/gm, '$1- ') // viñetas "* " o "+ " -> "- "
    .replace(/\*\*(.+?)\*\*/g, '$1') // **negrita**
    .replace(/__(.+?)__/g, '$1') // __negrita__
    .replace(/(^|[^\w*])\*(?!\s)(.+?)(?<!\s)\*(?!\w)/g, '$1$2') // *cursiva*
    .replace(/`([^`]+)`/g, '$1') // `código`
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)') // [texto](enlace)
    .replace(/\n{3,}/g, '\n\n') // máximo una línea en blanco seguida
    .trim();
}

// Limpia y valida los mensajes que llegan del navegador.
// Devuelve { mensajes } o { error }.
function prepararMensajes(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { error: 'messages requerido' };
  }

  const validos = messages.filter(
    (m) =>
      (m?.role === 'user' || m?.role === 'assistant') &&
      typeof m.content === 'string' &&
      m.content.trim() !== ''
  );

  const largas = validos.some(
    (m) => m.role === 'user' && m.content.length > MAX_CARACTERES_PREGUNTA
  );
  if (largas) {
    return { error: `La pregunta no puede superar ${MAX_CARACTERES_PREGUNTA} caracteres` };
  }

  // Solo el historial reciente
  let recientes = validos.slice(-MAX_MENSAJES_HISTORIAL);

  // La conversación debe empezar con un mensaje del usuario: se quitan los
  // mensajes del asistente del inicio (por ejemplo, el saludo del chatbot).
  const primerUsuario = recientes.findIndex((m) => m.role === 'user');
  if (primerUsuario === -1) return { error: 'Falta la pregunta del usuario' };
  recientes = recientes.slice(primerUsuario);

  return {
    mensajes: recientes.map(({ role, content }) => ({ role, content })),
  };
}

async function textoCatalogo() {
  const productos = await Producto.find().select('nombre descripcion precios destacado');
  const texto = productos
    .map((p) => {
      const pr = p.precios || {};
      return `- ${p.nombre}${p.destacado ? ' (destacado)' : ''}: 1lb $${pr.lb1 ?? '-'}, 1qq $${pr.qq1 ?? '-'}${pr.g100 != null ? `, 100g $${pr.g100}` : ''}`;
    })
    .join('\n');
  return texto || 'Catálogo vacío por ahora.';
}

router.post('/', async (req, res) => {
  const { mensajes, error } = prepararMensajes(req.body?.messages);
  if (error) return res.status(400).json({ message: error });

  try {
    const respuesta = await obtenerCliente().messages.create({
      model: MODELO,
      max_tokens: MAX_TOKENS,
      output_config: { effort: ESFUERZO },
      system: SYSTEM_PROMPT + (await textoCatalogo()),
      messages: mensajes,
    });

    // Haiku rechazó la pregunta por seguridad: no se reintenta con otro modelo
    if (respuesta.stop_reason === 'refusal') {
      return res.json({ reply: MENSAJE_RECHAZO });
    }

    let reply = limpiarMarkdown(
      respuesta.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('')
    );

    // Se alcanzó el límite de tokens: se avisa en consola y se marca el corte
    if (respuesta.stop_reason === 'max_tokens') {
      console.warn(`Chat: respuesta cortada por max_tokens (${MAX_TOKENS})`);
      if (reply) reply += '…';
    }

    res.json({ reply: reply || MENSAJE_ERROR });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      console.error('Chat: ANTHROPIC_API_KEY inválida');
    } else if (err instanceof Anthropic.RateLimitError) {
      console.error('Chat: límite de uso de la API alcanzado');
    } else if (err instanceof Anthropic.APIError) {
      console.error(`Chat: error de la API (${err.status}):`, err.message);
    } else {
      console.error('Chat: error inesperado:', err.message);
    }
    res.status(502).json({ message: 'El asistente no está disponible en este momento' });
  }
});

export default router;
