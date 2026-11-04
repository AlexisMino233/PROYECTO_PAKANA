import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Usuario from '../models/Usuario.js';

dotenv.config();

async function crearAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const existe = await Usuario.findOne({ email: 'admin@pakana.com' });
    if (existe) {
      console.log('El admin ya existe');
      process.exit(0);
    }

    await Usuario.create({
      email: 'admin@pakana.com',
      password: 'admin123', // cámbiala después
    });

    console.log('Admin creado: admin@pakana.com / admin123');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

crearAdmin();