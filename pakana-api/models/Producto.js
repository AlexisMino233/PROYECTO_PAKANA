import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String, default: '' },
    precio: { type: Number, required: true },
    imagen: { type: String, default: '' },
    categoria: { type: String, default: 'condimento' },
  },
  { timestamps: true }
);

export default mongoose.model('Producto', productoSchema);