import User, { USER_PROPS } from "../models/user.model.js"
import { ServerError } from "../utils/errors.utils.js"
import mongoose from "mongoose"

class UserRepository {
  // Crea un nuevo usuario en la base de datos
  async create({ username, email, password, verification_token }) {
    try {
      await User.create({
        [USER_PROPS.USERNAME]: username,
        [USER_PROPS.EMAIL]: email,
        [USER_PROPS.PASSWORD]: password,
        [USER_PROPS.VERIFICATION_TOKEN]: verification_token,
      })
    } catch (error) {
      // Manejo de errores por duplicados (email o username ya registrados)
      if (error.code === 11000) {
        if (error.keyPattern.username) {
          throw new ServerError("Username already registered", 400)
        }
        if (error.keyPattern.email) {
          throw new ServerError("Email already registered", 400)
        }
      }
      throw error // Lanza otros errores no controlados
    }
  }

  // Verifica a un usuario por email
  async verifyUser(email) {
    const user = await User.findOne({ [USER_PROPS.EMAIL]: email })
    if (!user) {
      throw new ServerError("User not found", 404)
    }
    if (user.verified) {
      throw new ServerError("User has already been verified", 400)
    }
    user.verified = true // Marca al usuario como verificado
    await user.save()
    return user
  }

  // Busca un usuario por email
  async findUserByEmail(email) {
    return await User.findOne({ [USER_PROPS.EMAIL]: email })
  }

  // Busca un usuario por ID, validando que sea un ObjectId válido
  async findUserById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ServerError("Invalid user ID", 400)
    }
    const user = await User.findById(id)
    if (!user) {
      throw new ServerError("User not found", 404)
    }
    return user
  }

  // Cambia la contraseña de un usuario, verificando primero que exista
  async changeUserPassword(id, newPassword) {
    const user = await User.findById(id)
    if (!user) {
      throw new ServerError("User not found", 404)
    }
    user.password = newPassword
    await user.save()
  }
}

export default new UserRepository()
