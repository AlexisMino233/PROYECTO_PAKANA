import { useState } from 'react';

const API = 'http://localhost:5000';

function Contacto() {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setOk('');
    setError('');

    try {
      const res = await fetch(`${API}/api/mensajes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al enviar');

      setOk('Mensaje enviado correctamente. Te contactaremos pronto.');
      setForm({ nombre: '', email: '', telefono: '', mensaje: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="contacto">
      <h1>Contáctanos</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="telefono">Número de contacto</label>
          <input
            id="telefono"
            type="tel"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="mensaje">Mensaje</label>
          <textarea
            id="mensaje"
            name="mensaje"
            rows="5"
            value={form.mensaje}
            onChange={handleChange}
            required
          />
        </div>
        {ok && <p style={{ color: 'green' }}>{ok}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Enviar mensaje'}
        </button>
      </form>
    </main>
  );
}

export default Contacto;