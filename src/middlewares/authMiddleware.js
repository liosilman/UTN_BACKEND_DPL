import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import { ServerError } from "../utils/errors.utils.js"
import { ENVIROMENT } from "../config/enviroment.config.js"

export const authMiddleware = (request, response, next) => {
  try {
    const authorization_header = request.headers["authorization"]

    if (!authorization_header || !authorization_header.startsWith("Bearer ")) {
      throw new ServerError("Authorization header must include Bearer prefix", 401)
    }

    const authorization_token = authorization_header.split(" ")[1]

    if (!authorization_token) {
      throw new ServerError("No authorization token provided", 401)
    }

    if (!ENVIROMENT.SECRET_KEY_JWT) {
      throw new ServerError("Missing secret key for token verification", 500)
    }

    const user_info = jwt.verify(authorization_token, ENVIROMENT.SECRET_KEY_JWT)

    if (!user_info?.userId || !mongoose.Types.ObjectId.isValid(user_info.userId)) {
      throw new ServerError("Token does not contain a valid user ID", 401)
    }

    request.user = { _id: user_info.userId, ...user_info }
    next()
  } catch (error) {
    return response.status(error.status || 500).json({
      ok: false,
      status: error.status || 500,
      message: error.message || "Internal server error",
    })
  }
}

