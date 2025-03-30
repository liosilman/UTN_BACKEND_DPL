import { ServerError } from "../utils/errors.utils.js"
import UserRepository from "../repositories/user.repository.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { ENVIROMENT } from "../config/enviroment.config.js"
import { sendMail } from "../utils/mailer.utils.js"
import { AUTHORIZATION_TOKEN_PROPS } from "../utils/constants/token.constants.js"

// Register new user
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

// Verify email with token
export const verifyEmailController = async (req, res) => {
  try {
    const { verification_token } = req.query
    const { email } = jwt.verify(verification_token, ENVIROMENT.SECRET_KEY_JWT)

    const user = await UserRepository.findUserByEmail(email)
    if (!user || user.verification_token !== verification_token) {
      throw new ServerError("Invalid token or user not found", 400)
    }

    await UserRepository.verifyUser(email)
    res.redirect(ENVIROMENT.URL_FRONTEND + "/login")
  } catch (error) {
    return res.status(error.status || 500).json({
      ok: false,
      status: error.status || 500,
      message: error.message || "Internal server error",
    })
  }
}

// User login
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

// Request password reset
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
      // Security: Don't reveal if email exists
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
                <a href="${ENVIROMENT.URL_FRONTEND}/reset-password?token=${reset_token}">
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

// Set new password with reset token
export const rewritePasswordController = async (req, res) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({
        ok: false,
        message: "Token y contraseña son requeridos",
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
      res.status(400).json({
        ok: false,
        message: "Token inválido o expirado",
      })
    }
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error al procesar la solicitud",
    })
  }
}

// Verify reset token validity
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

