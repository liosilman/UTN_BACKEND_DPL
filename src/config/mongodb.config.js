import mongoose from "mongoose"
import { ENVIROMENT } from "./enviroment.config.js"

export const connectToMongoDB = async () => {
  try {
    const response = await mongoose.connect(ENVIROMENT.MONGODB_URL)

    // Añadimos información detallada sobre la conexión
    const dbName = response.connection.name
    const dbHost = response.connection.host
    const dbPort = response.connection.port

    console.log("\n===================================")
    console.log(`✅ CONECTADO A MONGODB: "${dbName}"`)
    console.log(`📍 Host: ${dbHost}:${dbPort}`)
    console.log("===================================\n")

    return response
  } catch (error) {
    console.error("\n❌ ERROR DE CONEXIÓN A MONGODB:", error.message)
    throw error
  }
}

// Ejecutamos la conexión inmediatamente
connectToMongoDB()

export default mongoose

