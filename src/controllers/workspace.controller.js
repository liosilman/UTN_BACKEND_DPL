import workspaceRepository from "../repositories/workspace.repository.js";
import mongoose from "mongoose";
import { ServerError } from "../utils/errors.utils.js";
import Workspace from "../models/Workspaces.model.js";

export const createWorkspaceController = async (req, res) => {
    try {
        console.log('Request User:', req.user);

        if (!req.user) {
            throw new ServerError(401, "Usuario no autenticado");
        }

        const { name } = req.body;
        const owner_id = req.user._id;

        console.log('Owner ID:', owner_id);

        if (!name) {
            throw new ServerError(400, "Workspace name is required");
        }

        const new_workspace = await workspaceRepository.createWorkspace({ name, owner_id });

        return res.status(201).json({
            ok: true,
            status: 201,
            message: "Workspace created!",
            data: { new_workspace }
        });

    } catch (error) {
        console.log("Error al crear workspace", error);
        
        if (error instanceof ServerError) {
            return res.status(error.status).json({
                ok: false,
                status: error.status,
                message: error.message
            });
        }
        
        return res.status(500).json({
            ok: false,
            status: 500,
            message: "Internal server error"
        });
    }
};

export const inviteUserToWorkspaceController = async (req, res) => {
    try {
        const user_id = req.user._id;
        const { invited_id, workspace_id } = req.params;

        if (!invited_id || !workspace_id) {
            throw new ServerError(400, "Invited user ID and workspace ID are required");
        }

        const workspace_found = await workspaceRepository.addNewMember({
            workspace_id, 
            invited_id, 
            owner_id: user_id
        });
        
        return res.json({
            ok: true,
            status: 201,
            message: "New member added",
            data: { workspace: workspace_found }
        });
    } catch (error) {
        console.log("Error al invitar usuario al workspace", error);
        
        if (error instanceof ServerError) {
            return res.status(error.status).send({
                ok: false,
                status: error.status,
                message: error.message
            });
        }
        
        return res.status(500).send({
            ok: false,
            status: 500,
            message: "Internal server error"
        });
    }
};

export const getAllWorkspacesController = async (req, res) => {
    try {
        const workspaces = await workspaceRepository.getAllWorkspaces();
        
        return res.json({
            ok: true,
            status: 200,
            message: "Workspaces retrieved successfully",
            data: { workspaces }
        });
    } catch (error) {
        console.log("Error al obtener los workspaces", error);
        
        if (error instanceof ServerError) {
            return res.status(error.status).send({
                ok: false,
                status: error.status,
                message: error.message
            });
        }
        
        return res.status(500).send({
            ok: false,
            status: 500,
            message: "Internal server error"
        });
    }
};

export const getWorkspaceByIdController = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.workspace_id)) {
            throw new ServerError(400, 'ID de workspace inválido');
        }

        const workspace = await Workspace.findById(req.params.workspace_id)
            .populate('owner', 'name email')
            .populate('members', 'name email')
            .populate('channels', 'name description');

        if (!workspace) {
            throw new ServerError(404, 'Workspace no encontrado');
        }

        return res.json({
            ok: true,
            data: workspace
        });

    } catch (error) {
        console.error('Error en getWorkspaceById:', error);
        
        if (error instanceof ServerError) {
            return res.status(error.status).json({
                ok: false,
                message: error.message
            });
        }
        
        return res.status(500).json({
            ok: false,
            error: 'Error interno del servidor'
        });
    }
};