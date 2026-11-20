# Chatbot PAKÁNA (Claude Haiku 5.5)

> Parte del manual del proyecto PAKÁNA. Explica cómo funciona el asistente de recetas que aparece en todas las páginas.

## 1. Resumen

El chatbot es la burbuja con el logo en la esquina de la página. Responde preguntas sobre **recetas con especias** y **productos del catálogo PAKÁNA**, usando el modelo de inteligencia artificial **Claude Haiku 5.5** de Anthropic.

```
Navegador (ChatBot.jsx) ──► API /api/chat (pakana-api) ──► Anthropic (Claude Haiku 5.5)
                                   │
                                   └── lee el catálogo actual de MongoDB y se lo da al modelo
```

La clave de Anthropic (`ANTHROPIC_API_KEY`) vive **solo** en el `.env` del backend. El navegador nunca la ve.

## 2. Configuración (`pakana-api/routes/chat.js`)

| Constante | Valor | Para qué sirve |
|---|---|---|
| `MODELO` | `claude-haiku-5-5` | Modelo **fijo**. Nunca cambia a otro modelo, ni siquiera si falla. |
| `MAX_TOKENS` | `1024` | Tope de la respuesta. Incluye lo que el modelo "piensa" antes de responder. |
| `ESFUERZO` | `low` | El modelo piensa poco, así que responde más rápido, más corto y más barato. |
| `MAX_CARACTERES_PREGUNTA` | `500` | Largo máximo de cada pregunta. |
| `MAX_MENSAJES_HISTORIAL` | `10` | Solo se envían los últimos 10 mensajes de la conversación. |

Para cambiar algún valor, se edita la constante al inicio del archivo y se reinicia la API.

## 3. Cómo se procesa cada pregunta

1. **El navegador** no deja escribir más de 500 caracteres y muestra un contador (`123/500`).
2. **La API valida** de nuevo el límite. Si se supera, responde `400` **sin llamar a Claude**, así que no cuesta nada.
3. **Recorta el historial** a los últimos 10 mensajes, para que el costo no crezca con conversaciones largas.
4. **Quita los mensajes del asistente del inicio,** como el saludo "¡Hola! Soy el asistente…", porque la conversación enviada a Claude debe empezar con una pregunta del usuario. El saludo se sigue viendo en pantalla.
5. **Lee el catálogo** de MongoDB (nombre, precios, destacado) y lo agrega a las instrucciones del modelo.
6. **Llama a Claude Haiku 5.5** con el SDK oficial (`@anthropic-ai/sdk`).
7. **Limpia la respuesta** con `limpiarMarkdown()`, como red de seguridad: si Claude se saltara la regla de texto plano, quita los símbolos (`**negrita**` → `negrita`, `## Título` → `Título`, tablas → líneas con guiones). Conserva los saltos de línea y las listas.
8. **El navegador muestra los saltos de línea** (estilo `white-space: pre-line` en cada mensaje), para que ingredientes y pasos aparezcan en líneas separadas.
9. **Revisa cómo terminó la respuesta:**

| Resultado (`stop_reason`) | Qué hace la API |
|---|---|
| `end_turn` (normal) | Devuelve la respuesta. |
| `max_tokens` (llegó al límite) | Devuelve el texto con "…" al final y lo registra en la consola. |
| `refusal` (Claude rechazó la pregunta) | Devuelve un mensaje amable. **No** prueba con otro modelo. |
| Error de red o de la API | Devuelve el código `502` con "El asistente no está disponible en este momento". El SDK reintenta solo ante fallos temporales, siempre con el mismo modelo. |

## 4. Reglas del asistente (instrucciones del sistema)

- **Formato obligatorio: texto plano.** Sin Markdown (`**`, `#`, tablas, código). Las listas van con `- ` o `1. ` y las secciones se separan con saltos de línea.
- Solo habla de recetas con especias o condimentos y de productos PAKÁNA.
- Si le preguntan otra cosa, responde amablemente que solo ayuda con eso.
- Recomienda productos del catálogo actual.
- Responde en español, de forma breve: en recetas, solo ingredientes clave y pasos cortos.

## 5. Costos

Precios de Claude Haiku 5.5 (por cada millón de tokens; un token equivale aproximadamente a ¾ de palabra):

| Tipo | Precio |
|---|---|
| Entrada (pregunta + instrucciones + catálogo) | $0.10 |
| Salida (respuesta) | $0.50 |

Consumo medido en las pruebas: una receta completa usa unos 350 tokens de entrada y 650 de salida, es decir, unos **$0.0004** por pregunta. Con $1 alcanza para unas 2.500 recetas.

## 6. Pruebas realizadas (2026-11-19)

| Prueba | Resultado |
|---|---|
| "Dame una receta con cúrcuma" (con el saludo primero, como lo envía el chatbot) | ✔ `claude-haiku-5-5`, terminó normal (`end_turn`), 645 de 1024 tokens, 4.0 s, recomendó productos del catálogo |
| "¿Quién ganó el mundial de fútbol?" | ✔ Se negó amablemente y ofreció recetas, 1.0 s |
| Pregunta de 501 caracteres | ✔ Rechazada con 400, **sin llamar a Claude** |
| Historial de 16 mensajes | ✔ Envió 9 mensajes, empezando por el usuario, 1.0 s |

En todas, el modelo que respondió fue `claude-haiku-5-5`.

**Prueba de texto plano:**

| Prueba | Resultado |
|---|---|
| Función `limpiarMarkdown()` con un texto lleno de Markdown (títulos, negritas, viñetas `*`, tabla, código, enlace) | ✔ Todo convertido a texto plano. Respeta expresiones como "2 * 3" y no altera un texto que ya era plano. |
| "Dame una receta con cúrcuma" con la nueva regla | ✔ Claude respondió **sin Markdown desde el origen** (la limpieza no tuvo que actuar), en 20 líneas bien separadas, `end_turn`, 3.1 s. **Usó 345 tokens en vez de 645**: el texto plano también ahorra costo. |

## 7. Errores comunes

| Síntoma | Causa / solución |
|---|---|
| "Hubo un problema al conectar" | La API no está corriendo, o falta o es inválida `ANTHROPIC_API_KEY` en el `.env`. Revisar la consola de la API. |
| Respuesta termina en "…" | Se alcanzó el límite de 1024 tokens. Si pasa seguido, subir `MAX_TOKENS`. |
| "límite de uso de la API alcanzado" en consola | Demasiadas preguntas seguidas o falta de saldo en la cuenta de Anthropic. |

## 8. Historial de cambios

| Fecha | Cambio |
|---|---|
| 2026-11-19 | Cambio de `claude-sonnet-4-5` a **`claude-haiku-5-5`** (modelo fijo). Se usa el SDK oficial `@anthropic-ai/sdk`. Límites: 500 caracteres por pregunta, 1024 tokens por respuesta, esfuerzo `low`, historial de 10 mensajes. Se corrige el envío del saludo como primer mensaje. |
| 2026-11-19 | Respuestas en **texto plano**: regla en las instrucciones + limpieza automática (`limpiarMarkdown`) + saltos de línea visibles en el chatbot. |
