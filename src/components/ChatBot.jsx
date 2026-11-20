import { useEffect, useRef, useState } from 'react';
import logo from '../assets/logo_pakana.jpg'; 

const API = 'http://localhost:5000';

function ChatBot() {
  const [abierto, setAbierto] = useState(false);
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        '¡Hola! Soy el asistente de PAKÁNA. Puedo ayudarte con recetas con especias y recomendarte productos de nuestro catálogo.',
    },
  ]);
  const listaRef = useRef(null);

  // Aviso a los 5 segundos
  useEffect(() => {
    const t = setTimeout(() => setMostrarAviso(true), 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (listaRef.current) {
      listaRef.current.scrollTop = listaRef.current.scrollHeight;
    }
  }, [messages, abierto]);

  const enviar = async (e) => {
    e.preventDefault();
    const texto = input.trim();
    if (!texto || cargando) return;

    const nuevos = [...messages, { role: 'user', content: texto }];
    setMessages(nuevos);
    setInput('');
    setCargando(true);

    try {
      // Solo enviamos user/assistant (sin metadatos)
      const payload = nuevos.map(({ role, content }) => ({ role, content }));

      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al chatear');

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Hubo un problema al conectar. Intenta de nuevo.',
        },
      ]);
    } finally {
      setCargando(false);
    }
  };

  const abrirChat = () => {
    setAbierto(true);
    setMostrarAviso(false);
  };

  return (
    <div className="chatbot">
      {mostrarAviso && !abierto && (
        <div className="chatbot-aviso" onClick={abrirChat}>
          ¿Buscas una receta con especias? ¡Pregúntame!
        </div>
      )}

      {abierto && (
        <div className="chatbot-ventana">
          <div className="chatbot-header">
            <span>Asistente PAKÁNA</span>
            <button type="button" onClick={() => setAbierto(false)}>
              ×
            </button>
          </div>

          <div className="chatbot-mensajes" ref={listaRef}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === 'user' ? 'chatbot-msg user' : 'chatbot-msg bot'
                }
              >
                {m.content}
              </div>
            ))}
            {cargando && <div className="chatbot-msg bot">Escribiendo...</div>}
          </div>

          <form className="chatbot-form" onSubmit={enviar}>
            <input
              type="text"
              placeholder="Ej: receta con cúrcuma..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={cargando}>
              Enviar
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="chatbot-boton"
        onClick={() => {
          if (abierto) setAbierto(false);
          else abrirChat();
        }}
        aria-label="Abrir chat"
      >
        <img src={logo} alt="Chat PAKÁNA" />
      </button>
    </div>
  );
}

export default ChatBot;