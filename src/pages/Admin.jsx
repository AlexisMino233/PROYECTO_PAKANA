import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductos } from '../hooks/useProductos';
import ProductoCard from '../components/catalogo/ProductoCard';

import { API } from '../config';
const TAMANO_MAXIMO = 2 * 1024 * 1024; // 2 MB (igual que en el backend)
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];

function Admin() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [tab, setTab] = useState('productos');
  const { productos, cargando, error: errorProductos, recargar: cargar } = useProductos();
  const [mensajes, setMensajes] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    imagen: '',
    imagenRuta: '',
    categoria: 'condimento',
    destacado: false,
    g100: '',
    lb1: '',
    kg1: '',
    lb25: '',
    qq1: '',
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [archivo, setArchivo] = useState(null); // imagen elegida, aún sin subir
  const [preview, setPreview] = useState(''); // vista previa local de esa imagen
  const [guardando, setGuardando] = useState('');
  const inputArchivoRef = useRef(null);

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const formVacio = {
    nombre: '',
    descripcion: '',
    imagen: '',
    imagenRuta: '',
    categoria: 'condimento',
    destacado: false,
    g100: '',
    lb1: '',
    kg1: '',
    lb25: '',
    qq1: '',
  };

  const cargarMensajes = async () => {
    const res = await fetch(`${API}/api/mensajes`, { headers });
    if (!res.ok) return;
    const data = await res.json();
    setMensajes(data);
  };

  // Los productos los carga useProductos; aquí solo los mensajes
  useEffect(() => {
    cargarMensajes();
  }, []);

  // Libera la vista previa anterior para no acumular memoria
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const limpiarArchivo = () => {
    setArchivo(null);
    setPreview('');
    if (inputArchivoRef.current) inputArchivoRef.current.value = '';
  };

  const limpiarFormulario = () => {
    setForm(formVacio);
    setEditId(null);
    limpiarArchivo();
  };

  // El admin eligió una imagen desde su computadora
  const handleArchivo = (e) => {
    setError('');
    const elegido = e.target.files?.[0];
    if (!elegido) return limpiarArchivo();

    if (!TIPOS_PERMITIDOS.includes(elegido.type)) {
      setError('Solo se permiten imágenes JPG, PNG o WEBP');
      return limpiarArchivo();
    }
    if (elegido.size > TAMANO_MAXIMO) {
      setError('La imagen supera el máximo de 2 MB');
      return limpiarArchivo();
    }

    setArchivo(elegido);
    setPreview(URL.createObjectURL(elegido));
  };

  // El admin pegó una URL a mano: ya no es una imagen subida por el sistema
  const handleUrlImagen = (e) => {
    limpiarArchivo();
    setForm({ ...form, imagen: e.target.value, imagenRuta: '' });
  };

  // Sube la imagen a GitHub (a través de la API) y devuelve { url, ruta }
  const subirImagen = async () => {
    const datos = new FormData();
    datos.append('nombre', form.nombre); // primero el texto, luego el archivo
    datos.append('imagen', archivo);

    const res = await fetch(`${API}/api/imagenes`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }, // sin Content-Type: el navegador lo pone
      body: datos,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al subir la imagen');
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let imagen = form.imagen;
    let imagenRuta = form.imagenRuta;
    let subida = null;

    try {
      if (archivo) {
        setGuardando('Subiendo imagen...');
        subida = await subirImagen();
        imagen = subida.url;
        imagenRuta = subida.ruta;
      }
    } catch (err) {
      setGuardando('');
      setError(err.message);
      return;
    }

    setGuardando('Guardando producto...');

    const body = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      imagen,
      imagenRuta,
      categoria: form.categoria,
      destacado: form.destacado,
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

      limpiarFormulario();
      cargar();
    } catch (err) {
      // La imagen se subió pero el producto no se guardó: se borra para no dejarla huérfana
      if (subida) {
        fetch(`${API}/api/imagenes`, {
          method: 'DELETE',
          headers,
          body: JSON.stringify({ ruta: subida.ruta }),
        }).catch(() => {});
      }
      setError(err.message);
    } finally {
      setGuardando('');
    }
  };

  const editar = (p) => {
    limpiarArchivo();
    setEditId(p._id);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      imagen: p.imagen || '',
      imagenRuta: p.imagenRuta || '',
      categoria: p.categoria || 'condimento',
      destacado: p.destacado || false,
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
    <main className="admin">
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
            <label>
              Imagen (JPG, PNG o WEBP, máx. 2 MB)
              <input
                ref={inputArchivoRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleArchivo}
              />
            </label>
            {(preview || form.imagen) && (
              <div>
                <img src={preview || form.imagen} alt="Vista previa" width="120" />
                {archivo && (
                  <button type="button" onClick={limpiarArchivo}>
                    Quitar imagen elegida
                  </button>
                )}
              </div>
            )}
            <input
              name="imagen"
              placeholder="...o pega una URL de imagen (opcional)"
              value={archivo ? '' : form.imagen}
              onChange={handleUrlImagen}
              disabled={!!archivo}
            />
            <input
              name="categoria"
              placeholder="Categoría"
              value={form.categoria}
              onChange={handleChange}
            />
            <label>
              <input
                type="checkbox"
                name="destacado"
                checked={form.destacado}
                onChange={(e) => setForm({ ...form, destacado: e.target.checked })}
              />
              Producto destacado
            </label>

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
            {guardando && <p>{guardando}</p>}
            <button type="submit" disabled={!!guardando}>
              {editId ? 'Actualizar' : 'Crear'}
            </button>
            {editId && (
              <button type="button" onClick={limpiarFormulario}>
                Cancelar
              </button>
            )}
          </form>

          <h2>Productos</h2>
          {cargando && <p>Cargando productos...</p>}
          {errorProductos && <p>Error: {errorProductos}</p>}
          {!cargando && !errorProductos && productos.length === 0 && (
            <p>No hay productos todavía.</p>
          )}
          {/* Mismas tarjetas que el catálogo: el admin ve el producto como lo verá el cliente */}
          <div className="catalogo-lista">
            {productos.map((p) => (
              <ProductoCard key={p._id} producto={p}>
                {p.destacado && <p>★ Destacado</p>}
                <button type="button" onClick={() => editar(p)}>
                  Editar
                </button>
                <button type="button" onClick={() => eliminar(p._id)}>
                  Eliminar
                </button>
              </ProductoCard>
            ))}
          </div>
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