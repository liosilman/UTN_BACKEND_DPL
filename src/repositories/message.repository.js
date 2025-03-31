import Message from "../models/message.model.js" // Changed from Message.model.js
import { ServerError } from "../utils/errors.utils.js"
import channelRepository from "./channel.repository.js"

class MessageRepository {
  /**
   * Crea un nuevo mensaje con validación completa
   */
  async create({ workspace_id, channel_id, sender_id, content }) {
    // Validación básica del contenido
    if (!content || typeof content !== "string" || !content.trim()) {
      throw new ServerError("El contenido del mensaje es requerido", 400)
    }

    // Verificar que el canal existe y el usuario tiene acceso
    await channelRepository.findChannelById({
      workspace_id,
      channel_id,
      user_id: sender_id,
    })

    // Crear el mensaje
    const newMessage = await Message.create({
      channel_ref: channel_id,
      sender: sender_id,
      workspace_ref: workspace_id,
      content: content.trim(),
    })

    return newMessage.populate("sender", "username avatar")
  }

  /**
   * Obtiene mensajes paginados de un canal
   */
  async findMessagesFromChannel({ workspace_id, channel_id, user_id, limit = 50, page = 1 }) {
    // Validar acceso al canal
    await channelRepository.findChannelById({
      workspace_id,
      channel_id,
      user_id,
    })

    const skip = (page - 1) * limit

    const [messages, total] = await Promise.all([
      Message.find({ channel_ref: channel_id })
        .populate("sender", "username avatar")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments({ channel_ref: channel_id }),
    ])

    return {
      messages,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    }
  }
}

const messageRepository = new MessageRepository()
export default messageRepository

