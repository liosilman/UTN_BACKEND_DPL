import User from "../Models/User.model.js";
import { ServerError } from "../utils/errors.utils.js";


export const getCurrentUserController = async (req, res) => {
    try {
        // El usuario autenticado está disponible en req.user gracias al authMiddleware
        const user = await User.findById(req.user._id)
            .select('-password -refreshToken -__v') // Excluimos datos sensibles
            .lean();

        if (!user) {
            throw new ServerError('Usuario no encontrado', 404);
        }

        res.status(200).json({
            ok: true,
            message: 'Información de usuario obtenida',
            data: user
        });
    } catch (error) {
        console.error("[User Controller] Error:", error);
        res.status(error.status || 500).json({
            ok: false,
            message: error.message || 'Error al obtener información de usuario'
        });
    }
};

export const searchUserByEmail = async (req, res) => {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ ok: false, message: "Email es requerido", status: "error", payload: {} });
      }
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ ok: false, message: "Usuario no encontrado", status: "error", payload: {} });
      }
  
      res.json({ ok: true, payload: user });
    } catch (error) {
      res.status(500).json({ ok: false, message: "Error interno del servidor", status: "error", payload: {} });
    }
  };
  