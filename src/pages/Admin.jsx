import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000';

function Admin() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [tab, setTab] = useState('productos');
  const [productos, setProductos] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    imagen: '',
    categoria: 'condimento',
    g100: '',
    lb1: '',
    kg1: '',
    lb25: '',
    qq1: '',
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const formVacio = {
    nombre: '',
    descripcion: '',
    imagen: '',
    categoria: 'condimento',
    g100: '',
    lb1: '',
    kg1: '',
    lb25: '',
    qq1: '',
  };

  const cargar = async () => {
    const res = await fetch(`${API}/api/productos`);
    const data = await res.json();
    setProductos(data);
  };

  const cargarMensajes = async () => {
    const res = await fetch(`${API}/api/mensajes`, { headers });
    if (!res.ok) return;
    const data = await res.json();
    setMensajes(data);
  };

  useEffect(() => {
    cargar();
    cargarMensajes();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const body = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      imagen: form.imagen,
      categoria: form.categoria,
      precios: {
        g100: form.g100 === '' ? null : Number(form.g100),
        lb1: Number(form.lb1),
        kg1: form.kg1 === '' ? null : Number(form.kg1),
        lb25: form.lb25 === '' ? null : Number(form.lb25),
        qq1: Number(form.qq1),
      },
    };

    try {
      const url = editId
        ? `${API}/api/productos/${editId}`
        : `${API}/api/productos`;
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar');

      setForm(formVacio);
      setEditId(null);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const editar = (p) => {
    setEditId(p._id);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      imagen: p.imagen || '',
      categoria: p.categoria || 'condimento',
      g100: p.precios?.g100 ?? '',
      lb1: p.precios?.lb1 ?? '',
      kg1: p.precios?.kg1 ?? '',
      lb25: p.precios?.lb25 ?? '',
      qq1: p.precios?.qq1 ?? '',
    });
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    const res = await fetch(`${API}/api/productos/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (res.ok) cargar();
  };

  const marcarLeido = async (id) => {
    await fetch(`${API}/api/mensajes/${id}/leido`, {
      method: 'PATCH',
      headers,
    });
    cargarMensajes();
  };

  const eliminarMensaje = async (id) => {
    if (!confirm('¿Eliminar este mensaje?')) return;
    await fetch(`${API}/api/mensajes/${id}`, {
      method: 'DELETE',
      headers,
    });
    cargarMensajes();
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const mensajesNuevos = mensajes.filter((m) => !m.leido).length;

  return (
    <main>
      <div>
        <h1>Panel Admin</h1>
        <button type="button" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>

      <div>
        <button type="button" onClick={() => setTab('productos')}>
          Productos
        </button>
        <button type="button" onClick={() => setTab('mensajes')}>
          Mensajes ({mensajesNuevos})
        </button>
      </div>

      {tab === 'productos' && (
        <>
          <h2>{editId ? 'Editar producto' : 'Nuevo producto'}</h2>
          <form onSubmit={handleSubmit}>
            <input
              name="nombre"
              placeholder="Nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
            <textarea
              name="descripcion"
              placeholder="Descripción"
              value={form.descripcion}
              onChange={handleChange}
            />
            <input
              name="imagen"
              placeholder="URL imagen (GitHub raw)"
              value={form.imagen}
              onChange={handleChange}
            />
            <input
              name="categoria"
              placeholder="Categoría"
              value={form.categoria}
              onChange={handleChange}
            />

            <p>Precios</p>
            <input
              name="g100"
              type="number"
              step="0.01"
              placeholder="100 g (opcional)"
              value={form.g100}
              onChange={handleChange}
            />
            <input
              name="lb1"
              type="number"
              step="0.01"
              placeholder="1 lb *"
              value={form.lb1}
              onChange={handleChange}
              required
            />
            <input
              name="kg1"
              type="number"
              step="0.01"
              placeholder="1 kg (opcional)"
              value={form.kg1}
              onChange={handleChange}
            />
            <input
              name="lb25"
              type="number"
              step="0.01"
              placeholder="25 lb (opcional)"
              value={form.lb25}
              onChange={handleChange}
            />
            <input
              name="qq1"
              type="number"
              step="0.01"
              placeholder="1 qq / 100 lb *"
              value={form.qq1}
              onChange={handleChange}
              required
            />

            {error && <p>{error}</p>}
            <button type="submit">{editId ? 'Actualizar' : 'Crear'}</button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm(formVacio); }}>
                Cancelar
              </button>
            )}
          </form>

          <h2>Productos</h2>
          <ul>
            {productos.map((p) => (
              <li key={p._id}>
                {p.imagen && <img src={p.imagen} alt={p.nombre} width="80" />}
                <strong>{p.nombre}</strong>
                {' — '}
                1 lb: ${p.precios?.lb1 ?? '-'} | 1 qq: ${p.precios?.qq1 ?? '-'}
                <div>
                  <button type="button" onClick={() => editar(p)}>
                    Editar
                  </button>
                  <button type="button" onClick={() => eliminar(p._id)}>
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {tab === 'mensajes' && (
        <section>
          <h2>Mensajes de contacto</h2>
          {mensajes.length === 0 ? (
            <p>No hay mensajes.</p>
          ) : (
            <ul>
              {mensajes.map((m) => (
                <li key={m._id}>
                  <p>
                    <strong>{m.nombre}</strong>
                    {' — '}
                    {new Date(m.createdAt).toLocaleString('es')}
                    {!m.leido && ' (nuevo)'}
                  </p>
                  <p>
                    {m.email} · {m.telefono}
                  </p>
                  <p>{m.mensaje}</p>
                  {!m.leido && (
                    <button type="button" onClick={() => marcarLeido(m._id)}>
                      Marcar leído
                    </button>
                  )}
                  <button type="button" onClick={() => eliminarMensaje(m._id)}>
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}

export default Admin;