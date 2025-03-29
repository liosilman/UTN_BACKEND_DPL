import mongoose from "mongoose";
import Workspace from "../Models/Workspaces.model.js";
import { ServerError } from "../utils/errors.utils.js";

class WorkspaceRepository {
    // ========== MÉTODOS PÚBLICOS ========== //
    
    async findWorkspaceById(workspace_id) {
        this._validateObjectId(workspace_id, "Workspace ID");
        return this._getWorkspaceById(workspace_id);
    }

    async createWorkspace({ name, owner_id }) {
        this._validateName(name);
        this._validateObjectId(owner_id, "Owner ID");
        await this._checkDuplicateWorkspace(name, owner_id);

        const workspace = await Workspace.create({
            name,
            owner: owner_id,
            members: [owner_id]
        });
        
        return this._getFormattedWorkspace(workspace._id);
    }

    async isUserMemberOfWorkspace({ workspace_id, user_id }) {
        this._validateObjectId(workspace_id, "Workspace ID");
        this._validateObjectId(user_id, "User ID");
        return this._checkUserMembership(workspace_id, user_id);
    }

    async addNewMember({ workspace_id, owner_id, invited_id }) {
        this._validateIds(workspace_id, owner_id, invited_id);
        return this._addMember(workspace_id, owner_id, invited_id);
    }

    async findWorkspacesByOwner(owner_id) {
        this._validateObjectId(owner_id, "Owner ID");
        return this._getWorkspacesByOwner(owner_id);
    }

    async removeMember({ workspace_id, owner_id, member_id }) {
        this._validateIds(workspace_id, owner_id, member_id);
        return this._removeMember(workspace_id, owner_id, member_id);
    }

    async getWorkspacesByUser(user_id) {
        this._validateObjectId(user_id, "User ID");
        return this._getUserWorkspaces(user_id);
    }

    async getAllWorkspaces() {
        return Workspace.find().lean();
    }

    // ========== MÉTODOS PRIVADOS ========== //
    
    async _getWorkspaceById(workspace_id) {
        const workspace = await Workspace.findById(workspace_id).lean();
        if (!workspace) throw new ServerError("Workspace no encontrado", 404);
        return workspace;
    }

    async _getFormattedWorkspace(workspace_id) {
        return Workspace.findById(workspace_id)
            .populate("owner", "username email")
            .populate("members", "username email")
            .lean();
    }

    async _checkDuplicateWorkspace(name, owner_id) {
        const existing = await Workspace.findOne({ name, owner: owner_id });
        if (existing) throw new ServerError("El workspace ya existe", 409);
    }

    async _checkUserMembership(workspace_id, user_id) {
        const workspace = await Workspace.findOne({
            _id: workspace_id,
            $or: [{ owner: user_id }, { members: user_id }],
        }).lean();
        return !!workspace;
    }

    async _addMember(workspace_id, owner_id, invited_id) {
        const workspace = await this._getWorkspaceById(workspace_id);
        if (!workspace.owner.equals(owner_id)) {
            throw new ServerError("No tienes permisos para invitar miembros", 403);
        }
        if (workspace.members.includes(invited_id)) {
            throw new ServerError("El usuario ya es miembro", 400);
        }
        workspace.members.push(invited_id);
        await workspace.save();
        return workspace;
    }

    async _getWorkspacesByOwner(owner_id) {
        return Workspace.find({ owner: owner_id }).lean();
    }

    async _removeMember(workspace_id, owner_id, member_id) {
        const workspace = await this._getWorkspaceById(workspace_id);
        if (!workspace.owner.equals(owner_id)) {
            throw new ServerError("No tienes permisos para eliminar miembros", 403);
        }
        workspace.members = workspace.members.filter(id => !id.equals(member_id));
        await workspace.save();
        return workspace;
    }

    async _getUserWorkspaces(user_id) {
        return Workspace.find({
            $or: [{ owner: user_id }, { members: user_id }],
        }).lean();
    }

    _validateObjectId(id, fieldName) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ServerError(`${fieldName} es inválido`, 400);
        }
    }

    _validateName(name) {
        if (!name?.trim()) {
            throw new ServerError("El nombre del workspace es obligatorio", 400);
        }
    }

    _validateIds(...ids) {
        ids.forEach(id => this._validateObjectId(id, "ID"));
    }
}

const workspaceRepository = new WorkspaceRepository();
export default workspaceRepository;
