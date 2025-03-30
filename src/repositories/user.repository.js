import User, { USER_PROPS } from "../Models/User.model.js"
import { ServerError } from "../utils/errors.utils.js"
import mongoose from "mongoose"

class UserRepository {
  async create({ username, email, password, verification_token }) {
    try {
      await User.create({
        [USER_PROPS.USERNAME]: username,
        [USER_PROPS.EMAIL]: email,
        [USER_PROPS.PASSWORD]: password,
        [USER_PROPS.VERIFICATION_TOKEN]: verification_token,
      })
    } catch (error) {
      if (error.code === 11000) {
        if (error.keyPattern.username) {
          throw new ServerError("Username already registered", 400)
        }
        if (error.keyPattern.email) {
          throw new ServerError("Email already registered", 400)
        }
      }
      throw error
    }
  }

  async verifyUser(email) {
    const user = await User.findOne({ [USER_PROPS.EMAIL]: email })
    if (!user) {
      throw new ServerError("User not found", 404)
    }
    if (user.verified) {
      throw new ServerError("User has already been verified", 400)
    }
    user.verified = true
    await user.save()
    return user
  }

  async findUserByEmail(email) {
    return await User.findOne({ [USER_PROPS.EMAIL]: email })
  }

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

