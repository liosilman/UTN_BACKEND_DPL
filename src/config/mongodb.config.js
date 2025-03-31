import mongoose from "mongoose"
import { ENVIROMENT } from "./enviroment.config.js"

const connectToMongoDB = async () => {
  try {
    const response = await mongoose.connect(ENVIROMENT.MONGODB_URL, {
      connectTimeoutMS: 60000,  // Aumenta el tiempo de conexión a 60 segundos
      socketTimeoutMS: 60000,   // Aumenta el tiempo de espera en los sockets
      serverSelectionTimeoutMS: 60000, // Aumenta el tiempo para la selección del servidor
    })
    
    console.log("✅ Conectado a MongoDB // Base de datos:", response.connection.name)
    return response
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error.message)
    // No lanzamos el error para permitir que el servidor inicie aunque falle la conexión
  }
}

// Conectar inmediatamente
connectToMongoDB()

export default mongoose
