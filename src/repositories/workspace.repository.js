import mongoose from "mongoose"
import Workspace from "../models/workspaces.model.js"
import { ServerError } from "../utils/errors.utils.js"

class WorkspaceRepository {
  // ========== MÉTODOS PÚBLICOS ========== //

  // Busca un workspace por su ID, validando primero que el ID sea válido
  async findWorkspaceById(workspace_id) {
    this._validateObjectId(workspace_id, "Workspace ID")
    return this._getWorkspaceById(workspace_id)
  }

  // Crea un nuevo workspace, validando nombre, dueño y evitando duplicados
  async createWorkspace({ name, owner_id }) {
    this._validateName(name)
    this._validateObjectId(owner_id, "Owner ID")
    await this._checkDuplicateWorkspace(name, owner_id)

    const workspace = await Workspace.create({
      name,
      owner: owner_id,
      members: [owner_id], // El creador se agrega como miembro automáticamente
    })

    return this._getFormattedWorkspace(workspace._id)
  }

  // Verifica si un usuario es miembro de un workspace
  async isUserMemberOfWorkspace({ workspace_id, user_id }) {
    this._validateObjectId(workspace_id, "Workspace ID")
    this._validateObjectId(user_id, "User ID")
    return this._checkUserMembership(workspace_id, user_id)
  }

  // Agrega un nuevo miembro a un workspace si el usuario es el dueño
  async addNewMember({ workspace_id, owner_id, invited_id }) {
    this._validateIds(workspace_id, owner_id, invited_id)
    return this._addMember(workspace_id, owner_id, invited_id)
  }

  // Obtiene todos los workspaces de un dueño específico
  async findWorkspacesByOwner(owner_id) {
    this._validateObjectId(owner_id, "Owner ID")
    return this._getWorkspacesByOwner(owner_id)
  }

  // Elimina a un miembro de un workspace si el usuario es el dueño
  async removeMember({ workspace_id, owner_id, member_id }) {
    this._validateIds(workspace_id, owner_id, member_id)
    return this._removeMember(workspace_id, owner_id, member_id)
  }

  // Obtiene todos los workspaces en los que un usuario es miembro o dueño
  async getWorkspacesByUser(user_id) {
    this._validateObjectId(user_id, "User ID")
    return this._getUserWorkspaces(user_id)
  }

  // Obtiene todos los workspaces sin filtrar (usado solo en casos especiales)
  async getAllWorkspaces() {
    return Workspace.find().lean()
  }

  // ========== MÉTODOS PRIVADOS ========== //

  // Obtiene un workspace por ID y lanza un error si no existe
  async _getWorkspaceById(workspace_id) {
    const workspace = await Workspace.findById(workspace_id)
    if (!workspace) throw new ServerError("Workspace no encontrado", 404)
    return workspace
  }

  // Obtiene un workspace con detalles expandidos de owner y miembros
  async _getFormattedWorkspace(workspace_id) {
    return Workspace.findById(workspace_id)
      .populate("owner", "username email")
      .populate("members", "username email")
      .lean()
  }

  // Verifica si ya existe un workspace con el mismo nombre y dueño
  async _checkDuplicateWorkspace(name, owner_id) {
    const existing = await Workspace.findOne({ name, owner: owner_id })
    if (existing) throw new ServerError("El workspace ya existe", 409)
  }

  // Verifica si un usuario es dueño o miembro de un workspace
  async _checkUserMembership(workspace_id, user_id) {
    const workspace = await Workspace.findOne({
      _id: workspace_id,
      $or: [{ owner: user_id }, { members: user_id }],
    }).lean()
    return !!workspace // Retorna `true` si el usuario pertenece al workspace
  }

  // Agrega un nuevo miembro validando que el usuario sea el dueño
  async _addMember(workspace_id, owner_id, invited_id) {
    const workspace = await this._getWorkspaceById(workspace_id)

    if (!workspace.owner.equals(owner_id)) {
      throw new ServerError("No tienes permisos para invitar miembros", 403)
    }

    if (workspace.members.some((member) => member.equals(invited_id))) {
      throw new ServerError("El usuario ya es miembro", 400)
    }

    workspace.members.push(invited_id)
    await workspace.save()
    return workspace
  }

  // Obtiene todos los workspaces de un dueño específico
  async _getWorkspacesByOwner(owner_id) {
    return Workspace.find({ owner: owner_id }).lean()
  }

  // Remueve a un miembro si el usuario es dueño del workspace
  async _removeMember(workspace_id, owner_id, member_id) {
    const workspace = await this._getWorkspaceById(workspace_id)

    if (!workspace.owner.equals(owner_id)) {
      throw new ServerError("No tienes permisos para eliminar miembros", 403)
    }

    workspace.members = workspace.members.filter((id) => !id.equals(member_id))
    await workspace.save()
    return workspace
  }

  // Obtiene los workspaces donde el usuario es dueño o miembro
  async _getUserWorkspaces(user_id) {
    return Workspace.find({
      $or: [{ owner: user_id }, { members: user_id }],
    }).lean()
  }

  // Valida que un ObjectId sea correcto
  _validateObjectId(id, fieldName) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ServerError(`${fieldName} es inválido`, 400)
    }
  }

  // Valida que el nombre del workspace no esté vacío
  _validateName(name) {
    if (!name?.trim()) {
      throw new ServerError("El nombre del workspace es obligatorio", 400)
    }
  }

  // Valida múltiples ObjectId al mismo tiempo
  _validateIds(...ids) {
    ids.forEach((id) => this._validateObjectId(id, "ID"))
  }
}

const workspaceRepository = new WorkspaceRepository()
export default workspaceRepository
