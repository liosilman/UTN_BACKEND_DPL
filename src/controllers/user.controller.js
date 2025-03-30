
import User from "../models/User.model.js"
import { ServerError } from "../utils/errors.utils.js"

export const getCurrentUserController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -refreshToken -__v").lean()

    if (!user) {
      throw new ServerError("User not found", 404)
    }

    res.status(200).json({
      ok: true,
      message: "User information retrieved",
      data: user,
    })
  } catch (error) {
    res.status(error.status || 500).json({
      ok: false,
      message: error.message || "Error retrieving user information",
    })
  }
}

export const searchUserByEmail = async (req, res) => {
  try {
    const { email } = req.query
    if (!email) {
      return res.status(400).json({ ok: false, message: "Email is required", status: "error", payload: {} })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found", status: "error", payload: {} })
    }

    res.json({ ok: true, payload: user })
  } catch (error) {
    res.status(500).json({ ok: false, message: "Internal server error", status: "error", payload: {} })
  }
}

