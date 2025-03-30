import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, "..")

/**
 * Resuelve la ruta correcta para un modelo, comprobando si existe con 'Models' o 'models'
 * @param {string} modelName - Nombre del archivo del modelo (ej: 'User.model.js')
 * @returns {string} - Ruta completa al archivo del modelo
 */
export function resolveModelPath(modelName) {
  // Primero intentamos con 'Models' (mayúscula)
  const upperCasePath = path.join(rootDir, "Models", modelName)

  // Luego intentamos con 'models' (minúscula)
  const lowerCasePath = path.join(rootDir, "models", modelName)

  // Verificamos cuál existe y devolvemos la ruta correcta
  if (fs.existsSync(upperCasePath)) {
    return upperCasePath
  } else if (fs.existsSync(lowerCasePath)) {
    return lowerCasePath
  } else {
    // Si ninguno existe, devolvemos la ruta con 'models' (minúscula)
    // para mantener consistencia con Vercel
    return lowerCasePath
  }
}

/**
 * Importa dinámicamente un modelo basado en su nombre
 * @param {string} modelName - Nombre del archivo del modelo (ej: 'User.model.js')
 * @returns {Promise<object>} - El modelo importado
 */
export async function importModel(modelName) {
  try {
    // Intentar importar desde Models (mayúscula)
    try {
      return (await import(`../Models/${modelName}`)).default
    } catch (upperCaseError) {
      // Si falla, intentar desde models (minúscula)
      return (await import(`../models/${modelName}`)).default
    }
  } catch (error) {
    console.error(`Error al importar el modelo ${modelName}:`, error)
    throw error
  }
}

