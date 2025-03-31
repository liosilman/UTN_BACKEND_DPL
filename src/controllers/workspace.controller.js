import workspaceRepository from "../repositories/workspace.repository.js";
import mongoose from "mongoose";
import Workspace from "../models/workspaces.model.js";

/**
 * Crea un nuevo workspace.
 */
export const createWorkspaceController = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, status: 401, message: "Usuario no autenticado" });
    }

    const { name } = req.body;
    const owner_id = req.user._id;

    if (!name?.trim()) {
      return res.status(400).json({ ok: false, status: 400, message: "Workspace name is required" });
    }

    const new_workspace = await workspaceRepository.createWorkspace({ name: name.trim(), owner_id });

    return res.status(201).json({
      ok: true,
      status: 201,
      message: "Workspace created!",
      data: { new_workspace },
    });
  } catch (error) {
    return res.status(error.status || 500).json({ ok: false, status: error.status || 500, message: error.message || "Internal server error" });
  }
};

/**
 * Invita a un usuario a un workspace.
 */
export const inviteUserToWorkspaceController = async (req, res) => {
  try {
    const user_id = req.user._id;
    const { invited_id, workspace_id } = req.params;

    if (!invited_id || !workspace_id) {
      return res.status(400).json({ ok: false, status: 400, message: "Invited user ID and workspace ID are required" });
    }

    const workspace_found = await workspaceRepository.addNewMember({ workspace_id, invited_id, owner_id: user_id });

    res.status(201).json({ ok: true, status: 201, message: "New member added", data: { workspace: workspace_found } });
  } catch (error) {
    return res.status(error.status || 500).json({ ok: false, status: error.status || 500, message: error.message || "Internal server error" });
  }
};

/**
 * Obtiene todos los workspaces.
 */
export const getAllWorkspacesController = async (req, res) => {
  try {
    const workspaces = await workspaceRepository.getAllWorkspaces();

    res.status(200).json({ ok: true, status: 200, message: "Workspaces retrieved successfully", data: { workspaces } });
  } catch (error) {
    return res.status(error.status || 500).json({ ok: false, status: error.status || 500, message: error.message || "Internal server error" });
  }
};

/**
 * Obtiene un workspace por ID.
 */
export const getWorkspaceByIdController = async (req, res) => {
  try {
    const { workspace_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(workspace_id)) {
      return res.status(400).json({ ok: false, message: "ID de workspace inválido" });
    }

    const workspace = await Workspace.findById(workspace_id)
      .populate("owner", "name email")
      .populate("members", "name email")
      .populate("channels", "name description");

    if (!workspace) {
      return res.status(404).json({ ok: false, message: "Workspace no encontrado" });
    }

    res.status(200).json({ ok: true, data: workspace });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};
