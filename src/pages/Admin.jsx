import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000';

function Admin() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    imagen: '',
    categoria: 'condimento',
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const cargar = async () => {
    const res = await fetch(`${API}/api/productos`);
    const data = await res.json();
    setProductos(data);
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const body = {
      ...form,
      precio: Number(form.precio),
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

      setForm({
        nombre: '',
        descripcion: '',
        precio: '',
        imagen: '',
        categoria: 'condimento',
      });
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
      precio: p.precio,
      imagen: p.imagen || '',
      categoria: p.categoria || 'condimento',
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

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <main style={{ maxWidth: 800, margin: '2rem auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Panel Admin</h1>
        <button type="button" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>

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
          name="precio"
          type="number"
          step="0.01"
          placeholder="Precio"
          value={form.precio}
          onChange={handleChange}
          required
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
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">{editId ? 'Actualizar' : 'Crear'}</button>
        {editId && (
          <button type="button" onClick={() => setEditId(null)}>
            Cancelar
          </button>
        )}
      </form>

      <h2>Productos</h2>
      <ul>
        {productos.map((p) => (
          <li key={p._id} style={{ marginBottom: '1rem' }}>
            {p.imagen && (
              <img src={p.imagen} alt={p.nombre} width="80" />
            )}
            <strong>{p.nombre}</strong> — ${p.precio}
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
    </main>
  );
}

export default Admin;