import User from "../models/user.model.js";
import { ServerError } from "../utils/errors.utils.js";

/**
 * Obtiene la información del usuario autenticado.
 */
export const getCurrentUserController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -refreshToken -__v").lean();

    if (!user) {
      throw new ServerError("Usuario no encontrado", 404);
    }

    res.status(200).json({
      ok: true,
      message: "Información de usuario obtenida",
      data: user,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      ok: false,
      message: error.message || "Error al obtener información de usuario",
      status: error.status || 500,
      payload: {},
    });
  }
};

/**
 * Busca un usuario por su correo electrónico.
 */
export const searchUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({
        ok: false,
        message: "Email es requerido",
        status: 400,
        payload: {},
      });
    }

    const user = await User.findOne({ email }).select("-password -refreshToken -__v").lean();
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
        status: 404,
        payload: {},
      });
    }

    res.status(200).json({
      ok: true,
      status: 200,
      message: "Usuario encontrado",
      payload: user,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      ok: false,
      message: error.message || "Error interno del servidor",
      status: error.status || 500,
      payload: {},
    });
  }
};
