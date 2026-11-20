import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String, default: '' },
    imagen: { type: String, default: '' },
    // Ruta del archivo dentro del repo de imágenes en GitHub (solo si se subió desde el Admin).
    // Se usa para borrar la imagen al eliminar el producto o cambiar su imagen.
    imagenRuta: { type: String, default: '' },
    categoria: { type: String, default: 'condimento' },
    destacado: { type: Boolean, default: false },
    precios: {
      g100: { type: Number, default: null },
      lb1: { type: Number, required: true },
      kg1: { type: Number, default: null },
      lb25: { type: Number, default: null },
      qq1: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Producto', productoSchema);