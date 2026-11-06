import mongoose from 'mongoose';

const mensajeSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    telefono: { type: String, required: true },
    mensaje: { type: String, required: true },
    leido: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Mensaje', mensajeSchema);