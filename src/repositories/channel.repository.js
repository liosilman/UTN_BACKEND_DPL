import mongoose from "mongoose"
import Channel from "../models/channel.model.js"
import Workspace from "../models/workspaces.model.js"
import { ServerError } from "../utils/errors.utils.js"
import workspaceRepository from "./workspace.repository.js"



class ChannelRepository {
  // Busca un canal dentro de un workspace
  async findChannelById({ workspace_id, channel_id, user_id }) {
    console.log("Buscando canal con estos parámetros:", { workspace_id, channel_id, user_id })
    this._validateIds(workspace_id, channel_id) // Validación de IDs

    const channel = await Channel.findOne({
      _id: channel_id,
      workspace_ref: workspace_id,
    })
      .populate("created_by", "username avatar")
      .populate("workspace_ref", "name")
      .lean()

    if (!channel) throw new ServerError("Canal no encontrado", 404)
    return channel
  }

  // Crea un nuevo canal dentro de un workspace
  async createChannel({ name, workspace_id, user_id }) {
    this._validateChannelData(name, workspace_id)
    await this._verifyWorkspaceAccess(workspace_id, user_id)
    await this._checkDuplicateChannel(name, workspace_id)

    // Crear el canal
    const newChannel = await Channel.create({
      name: name.trim(),
      workspace_ref: workspace_id,
      created_by: user_id,
    })

    // Agregar el canal al workspace
    try {
      await Workspace.findByIdAndUpdate(workspace_id, { $push: { channels: newChannel._id } })
    } catch (error) {
      console.log("Error al actualizar el workspace con el nuevo canal:", error.message)
    }

    return this._getFormattedChannel(newChannel._id)
  }

  // Obtiene todos los canales de un workspace
  async findChannelsByWorkspace({ workspace_id, user_id }) {
    this._validateWorkspaceId(workspace_id)
    await this._verifyWorkspaceAccess(workspace_id, user_id)
    return this._getWorkspaceChannels(workspace_id)
  }

  // Obtiene un canal específico dentro de un workspace
  async findChannelInWorkspace({ workspace_id, channel_id, user_id }) {
    this._validateIds(workspace_id, channel_id)
    await this._verifyWorkspaceAccess(workspace_id, user_id)
    return this._getWorkspaceChannel(workspace_id, channel_id)
  }

  // ===== Métodos privados =====

  async _getFormattedChannel(channel_id) {
    return Channel.findById(channel_id)
      .populate("created_by", "username avatar")
      .populate("workspace_ref", "name")
      .lean()
  }

  async _getWorkspaceChannels(workspace_id) {
    return Channel.find({ workspace_ref: workspace_id })
      .populate("created_by", "username avatar")
      .populate("workspace_ref", "name")
      .sort({ created_at: -1 })
      .lean()
  }

  async _getWorkspaceChannel(workspace_id, channel_id) {
    const channel = await Channel.findOne({
      _id: channel_id,
      workspace_ref: workspace_id,
    })
      .populate("created_by", "username avatar")
      .populate("workspace_ref", "name")
      .lean()

    if (!channel) throw new ServerError("Canal no encontrado", 404)
    return channel
  }

  _validateChannelData(name, workspace_id) {
    if (!name?.trim()) throw new ServerError("Nombre de canal requerido", 400)
    if (name.trim().length > 50) throw new ServerError("Nombre demasiado largo", 400)
    this._validateWorkspaceId(workspace_id)
  }

  _validateIds(workspace_id, channel_id) {
    this._validateWorkspaceId(workspace_id)
    this._validateChannelId(channel_id)
  }

  _validateWorkspaceId(workspace_id) {
    if (!mongoose.Types.ObjectId.isValid(workspace_id)) {
      throw new ServerError("ID de workspace inválido", 400)
    }
  }

  _validateChannelId(channel_id) {
    if (!mongoose.Types.ObjectId.isValid(channel_id)) {
      throw new ServerError("ID de canal inválido", 400)
    }
  }

  async _verifyWorkspaceAccess(workspace_id, user_id) {
    const hasAccess = await workspaceRepository.isUserMemberOfWorkspace({
      workspace_id,
      user_id,
    })
    if (!hasAccess) throw new ServerError("Acceso denegado al workspace", 403)
  }

  async _checkDuplicateChannel(name, workspace_id) {
    const existing = await Channel.findOne({
      name: name.trim(),
      workspace_ref: workspace_id,
    })
    if (existing) throw new ServerError("Canal ya existe", 409)
  }
}

const channelRepository = new ChannelRepository()
export default channelRepository
