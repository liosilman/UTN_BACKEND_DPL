import mongoose from "mongoose"
import { ENVIROMENT } from "./enviroment.config.js"

const connectToMongoDB = async () => {
  try {
    const response = await mongoose.connect(ENVIROMENT.MONGODB_URL, {

    })
    
    console.log("✅ Conectado a MongoDB // Base de datos:", response.connection.name)
    return response
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error.message)

  }
}

// Conectar inmediatamente
connectToMongoDB()

export default mongoose
