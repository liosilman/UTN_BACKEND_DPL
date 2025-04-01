import { ServerError } from "../utils/errors.utils.js"
import UserRepository from "../repositories/user.repository.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { ENVIROMENT } from "../config/enviroment.config.js"
import { sendMail } from "../utils/mailer.utils.js"
import { AUTHORIZATION_TOKEN_PROPS } from "../utils/constants/token.constants.js"

/**
 * Registro de un nuevo usuario.
 */
export const registerController = async (req, res) => {
  try {
    const { username, email, password, profile_image_base64 } = req.body

    if (!username || !email || !password) {
      throw new ServerError("All fields are required", 400)
    }

    const existingUser = await UserRepository.findUserByEmail(email)
    if (existingUser) {
      throw new ServerError("Email already in use", 400)
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const verification_token = jwt.sign({ email }, ENVIROMENT.SECRET_KEY_JWT, { expiresIn: "24h" })

    await UserRepository.create({
      username,
      email,
      password: passwordHash,
      verification_token,
      profile_image_base64,
    })

    await sendMail({
      to: email,
      subject: "Valida tu mail!",
      html: `
            <h1>Valida tu mail para entrar en nuestra pagina</h1>
            <p>Esta validación es para asegurarnos que tu mail es realmente tuyo.</p>
            <a href='${ENVIROMENT.URL_BACKEND}/api/auth/verify-email?verification_token=${verification_token}'>
                Verificar cuenta
            </a>`,
    })

    return res.status(201).json({
      message: "User created",
      status: 201,
      ok: true,
    })
  } catch (error) {
    return res.status(error.status || 500).json({
      ok: false,
      status: error.status || 500,
      message: error.message || "Internal server error",
    })
  }
}

/**
 * Verificación de email del usuario.
 */
export const verifyEmailController = async (req, res) => {
  try {
    const { verification_token } = req.query
    const { email } = jwt.verify(verification_token, ENVIROMENT.SECRET_KEY_JWT)

    const user = await UserRepository.findUserByEmail(email)
    if (!user || user.verification_token !== verification_token) {
      throw new ServerError("Invalid token or user not found", 400)
    }

    await UserRepository.verifyUser(email)
    res.redirect( ENVIROMENT.URL_FRONTEND + "/login")
  } catch (error) {
    return res.status(error.status || 500).json({
      ok: false,
      status: error.status || 500,
      message: error.message || "Internal server error",
    })
  }
}

/**
 * Login de usuario.
 */
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      throw new ServerError("Email and password are required", 400)
    }

    const user = await UserRepository.findUserByEmail(email)

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new ServerError("Invalid credentials", 401)
    }

    const authorization_token = jwt.sign({ userId: user._id }, ENVIROMENT.SECRET_KEY_JWT, {
      expiresIn: AUTHORIZATION_TOKEN_PROPS.EXPIRATION,
    })

    return res.json({
      ok: true,
      status: 200,
      message: "Logged in",
      data: { authorization_token },
    })
  } catch (error) {
    return res.status(error.status || 500).json({
      ok: false,
      status: error.status || 500,
      message: error.message || "Internal server error",
    })
  }
}

/**
 * Restablecimiento de contraseña.
 */
export const resetPasswordController = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        ok: false,
        message: "Email es requerido",
      })
    }

    const user = await UserRepository.findUserByEmail(email)

    if (!user) {
      // Seguridad: No revelamos si el email existe
      return res.json({
        ok: true,
        message: "Si el email existe, recibirás un enlace",
      })
    }

    const reset_token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        action: "password_reset",
      },
      ENVIROMENT.SECRET_KEY_JWT,
      { expiresIn: "2h" },
    )

    
    
    await sendMail({
      to: email,
      subject: "Restablece tu contraseña",
      html: `
                <h1>Restablecimiento de contraseña</h1>
                <p>Haz clic en el enlace para crear una nueva contraseña:</p>
                <a href="https://utn-2025-fe-dpl.vercel.app/reset-password?token=${reset_token}">
                    Restablecer contraseña
                </a>
                <p><small>Este enlace expirará en 2 horas. Si no solicitaste esto, ignora este email.</small></p>
            `,
    })

    res.json({ ok: true, message: "Email de recuperación enviado" })
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al procesar la solicitud",
    })
  }
}

/**
 * Reescritura de contraseña.
 */
export const rewritePasswordController = async (req, res) => {
  try {
    // Log para depuración
    console.log("Datos recibidos en rewritePasswordController:", {
      body: req.body,
      query: req.query,
    })

    // Intentar obtener el token y la contraseña de diferentes fuentes
    const token = req.body.token || req.body.reset_token
    const { password } = req.body

    if (!token || !password) {
      return res.status(400).json({
        ok: false,
        message: "Token y contraseña son requeridos",
        received: {
          hasToken: !!token,
          hasPassword: !!password,
          bodyKeys: Object.keys(req.body),
        },
      })
    }

    try {
      const decoded = jwt.verify(token, ENVIROMENT.SECRET_KEY_JWT)

      if (decoded.action !== "password_reset") {
        return res.status(400).json({
          ok: false,
          message: "Token inválido: propósito incorrecto",
        })
      }

      const user = await UserRepository.findUserById(decoded._id)

      if (!user || user.email !== decoded.email) {
        return res.status(400).json({
          ok: false,
          message: "Usuario no encontrado o email no coincide",
        })
      }

      const newHashedPassword = await bcrypt.hash(password, 10)
      await UserRepository.changeUserPassword(decoded._id, newHashedPassword)

      res.json({ ok: true, message: "Contraseña actualizada correctamente" })
    } catch (jwtError) {
      console.error("Error al verificar JWT:", jwtError)
      res.status(400).json({
        ok: false,
        message: "Token inválido o expirado",
        error: jwtError.message,
      })
    }
  } catch (error) {
    console.error("Error general en rewritePasswordController:", error)
    res.status(500).json({
      ok: false,
      message: "Error al procesar la solicitud",
      error: error.message,
    })
  }
}

/**
 * Verificación de token de restablecimiento de contraseña.
 */
export const verifyTokenController = async (req, res) => {
  try {
    const { token } = req.query

    const decoded = jwt.verify(token, ENVIROMENT.SECRET_KEY_JWT)

    if (decoded.action !== "password_reset") {
      throw new Error("Invalid token type")
    }

    const user = await UserRepository.findUserById(decoded._id)
    if (!user || user.email !== decoded.email) {
      throw new Error("User not found")
    }

    res.json({ ok: true, email: decoded.email })
  } catch (error) {
    res.status(400).json({
      ok: false,
      message: "Enlace inválido o expirado",
    })
  }
}

