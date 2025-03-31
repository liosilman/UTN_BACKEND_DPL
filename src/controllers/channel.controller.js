import mongoose from "mongoose";
import { ServerError } from "../utils/errors.utils.js";
import channelRepository from "../repositories/channel.repository.js";
import { AUTHORIZATION_TOKEN_PROPS } from "../utils/constants/token.constants.js";
import Message from "../models/message.model.js";

// Create channel
export const createChannelController = async (req, res) => {
  try {
    if (!req.user) throw new ServerError("Usuario no autenticado", 401);
    
    const { name } = req.body;
    const { workspace_id } = req.params;
    const user_id = req.user[AUTHORIZATION_TOKEN_PROPS.ID];

    if (!workspace_id) throw new ServerError("Workspace ID es requerido", 400);
    if (!mongoose.Types.ObjectId.isValid(workspace_id)) throw new ServerError("Workspace ID inválido", 400);
    if (!name?.trim()) throw new ServerError("Nombre de canal requerido", 400);

    const channel = await channelRepository.createChannel({
      name: name.trim(),
      workspace_id,
      user_id,
    });

    res.status(201).json({
      ok: true,
      message: "Canal creado exitosamente",
      data: channel,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      ok: false,
      status: error.status || 500,
      message: error.message,
    });
  }
};

// Get workspace channels
export const getWorkspaceChannelsController = async (req, res) => {
  try {
    if (!req.user) throw new ServerError("Usuario no autenticado", 401);
    
    const { workspace_id } = req.params;
    const user_id = req.user[AUTHORIZATION_TOKEN_PROPS.ID];

    if (!workspace_id) throw new ServerError("Workspace ID es requerido", 400);

    const channels = await channelRepository.findChannelsByWorkspace({
      workspace_id,
      user_id,
    });

    res.status(200).json({
      ok: true,
      data: channels,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      ok: false,
      status: error.status || 500,
      message: error.message,
    });
  }
};

// Get channel by ID
export const getChannelByIdController = async (req, res) => {
  try {
    if (!req.user) throw new ServerError("Usuario no autenticado", 401);
    
    const { workspace_id, channel_id } = req.params;
    const user_id = req.user[AUTHORIZATION_TOKEN_PROPS.ID];

    if (!mongoose.Types.ObjectId.isValid(workspace_id)) {
      throw new ServerError("Workspace ID inválido", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(channel_id)) {
      throw new ServerError("Channel ID inválido", 400);
    }

    const channel = await channelRepository.findChannelById({
      workspace_id,
      channel_id,
      user_id,
    });

    if (!channel) throw new ServerError("Canal no encontrado", 404);

    res.status(200).json({
      ok: true,
      data: channel,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      ok: false,
      status: error.status || 500,
      message: error.message,
    });
  }
};

// Send message to channel
export const sendMessageToChannelController = async (req, res) => {
  try {
    if (!req.user) throw new ServerError("Usuario no autenticado", 401);
    
    const { workspace_id, channel_id } = req.params;
    const user_id = req.user[AUTHORIZATION_TOKEN_PROPS.ID];
    const { content } = req.body;

    if (!content?.trim()) {
      throw new ServerError("El contenido del mensaje es requerido", 400);
    }

    const newMessage = await Message.create({
      channel_ref: channel_id,
      sender: user_id,
      workspace_ref: workspace_id,
      content: content.trim(),
      created_at: new Date(),
    });

    res.status(201).json({
      ok: true,
      data: newMessage,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      ok: false,
      status: error.status || 500,
      message: error.message,
    });
  }
};

// Get messages from channel
export const getMessagesListFromChannelController = async (req, res) => {
  try {
    if (!req.user) throw new ServerError("Usuario no autenticado", 401);
    
    const { channel_id, workspace_id } = req.params;
    const user_id = req.user[AUTHORIZATION_TOKEN_PROPS.ID];

    const messages = await Message.find({
      channel_ref: channel_id,
      workspace_ref: workspace_id,
    })
      .populate("sender", "username avatar")
      .sort({ created_at: -1 })
      .lean();

    res.status(200).json({
      ok: true,
      data: {
        messages,
        count: messages.length,
      },
    });
  } catch (error) {
    res.status(error.status || 500).json({
      ok: false,
      status: error.status || 500,
      message: error.message,
    });
  }
};
