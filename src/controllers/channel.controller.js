import mongoose from "mongoose"
import { ServerError } from "../utils/errors.utils.js"
import channelRepository from "../repositories/channel.repository.js"
import { AUTHORIZATION_TOKEN_PROPS } from "../utils/constants/token.constants.js"
import Message from "../models/Message.model.js"


// Create channel
export const createChannelController = async (req, res) => {
  try {
    const { name } = req.body
    const { workspace_id } = req.params
    const user_id = req.user[AUTHORIZATION_TOKEN_PROPS.ID]

    if (!workspace_id) throw new ServerError("Workspace ID is required", 400)
    if (!mongoose.Types.ObjectId.isValid(workspace_id)) throw new ServerError("Invalid workspace ID", 400)
    if (!name?.trim()) throw new ServerError("Channel name is required", 400)

    const channel = await channelRepository.createChannel({
      name: name.trim(),
      workspace_id,
      user_id,
    })

    res.status(201).json({
      ok: true,
      message: "Channel created successfully",
      data: channel,
    })
  } catch (error) {
    const status = error.status || 500
    res.status(status).json({
      ok: false,
      status,
      message: error.message,
    })
  }
}

// Get workspace channels
export const getWorkspaceChannelsController = async (req, res) => {
  try {
    const { workspace_id } = req.params
    const user_id = req.user[AUTHORIZATION_TOKEN_PROPS.ID]

    if (!workspace_id) throw new ServerError("Workspace ID is required", 400)

    const channels = await channelRepository.findChannelsByWorkspace({
      workspace_id,
      user_id,
    })

    res.status(200).json({
      ok: true,
      data: channels,
    })
  } catch (error) {
    const status = error.status || 500
    res.status(status).json({
      ok: false,
      status,
      message: error.message,
    })
  }
}

// Get channel by ID
export const getChannelByIdController = async (req, res) => {
  try {
    const { workspace_id, channel_id } = req.params

    if (!mongoose.Types.ObjectId.isValid(workspace_id)) {
      throw new ServerError("Invalid workspace ID", 400)
    }

    if (!mongoose.Types.ObjectId.isValid(channel_id)) {
      throw new ServerError("Invalid channel ID", 400)
    }

    const user_id = req.user[AUTHORIZATION_TOKEN_PROPS.ID]

    const channel = await channelRepository.findChannelById({
      workspace_id,
      channel_id,
      user_id,
    })

    if (!channel) throw new ServerError("Channel not found", 404)

    res.status(200).json({
      ok: true,
      data: channel,
    })
  } catch (error) {
    const status = error.status || 500
    res.status(status).json({
      ok: false,
      status,
      message: error.message,
    })
  }
}

// Send message to channel
export const sendMessageToChannelController = async (req, res) => {
  try {
    const { workspace_id, channel_id, user_id } = req.params
    const { content } = req.body

    if (!content?.trim()) {
      throw new ServerError("Message content is required", 400)
    }

    const newMessage = await Message.create({
      channel_ref: channel_id,
      sender: user_id,
      workspace_ref: workspace_id,
      content: content.trim(),
      created_at: new Date(),
    })

    res.status(201).json({
      success: true,
      data: newMessage,
    })
  } catch (error) {
    const status = error.status || 500
    res.status(status).json({
      success: false,
      error: error.message,
    })
  }
}

// Get messages from channel
export const getMessagesListFromChannelController = async (req, res) => {
  try {
    const { channel_id, workspace_id } = req.params
    const user_id = req.user[AUTHORIZATION_TOKEN_PROPS.ID]

    const messages = await Message.find({
      channel_ref: channel_id,
      workspace_ref: workspace_id,
    })
      .populate("sender", "username avatar")
      .sort({ created_at: -1 })
      .lean()

    res.status(200).json({
      ok: true,
      data: {
        messages,
        count: messages.length,
      },
    })
  } catch (error) {
    res.status(error.status || 500).json({
      ok: false,
      message: error.message,
    })
  }
}

