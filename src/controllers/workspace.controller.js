import workspaceRepository from "../repositories/workspace.repository.js"
import mongoose from "mongoose"
import Workspace from "../models/Workspaces.model.js";

export const createWorkspaceController = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        status: 401,
        message: "Usuario no autenticado",
      })
    }

    const { name } = req.body
    const owner_id = req.user._id

    if (!name) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: "Workspace name is required",
      })
    }

    const new_workspace = await workspaceRepository.createWorkspace({ name, owner_id })

    return res.status(201).json({
      ok: true,
      status: 201,
      message: "Workspace created!",
      data: { new_workspace },
    })
  } catch (error) {
    return res.status(error.status || 500).json({
      ok: false,
      status: error.status || 500,
      message: error.message || "Internal server error",
    })
  }
}

export const inviteUserToWorkspaceController = async (req, res) => {
  try {
    const user_id = req.user._id
    const { invited_id, workspace_id } = req.params

    if (!invited_id || !workspace_id) {
      return res.status(400).send({
        ok: false,
        status: 400,
        message: "Invited user ID and workspace ID are required",
      })
    }

    const workspace_found = await workspaceRepository.addNewMember({
      workspace_id,
      invited_id,
      owner_id: user_id,
    })

    res.json({
      ok: true,
      status: 201,
      message: "New member added",
      data: { workspace: workspace_found },
    })
  } catch (error) {
    return res.status(error.status || 500).send({
      ok: false,
      status: error.status || 500,
      message: error.message || "Internal server error",
    })
  }
}

export const getAllWorkspacesController = async (req, res) => {
  try {
    const workspaces = await workspaceRepository.getAllWorkspaces()

    res.json({
      ok: true,
      status: 200,
      message: "Workspaces retrieved successfully",
      data: { workspaces },
    })
  } catch (error) {
    return res.status(error.status || 500).send({
      ok: false,
      status: error.status || 500,
      message: error.message || "Internal server error",
    })
  }
}

export const getWorkspaceByIdController = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.workspace_id)) {
      return res.status(400).json({
        ok: false,
        message: "ID de workspace inválido",
      })
    }

    const workspace = await Workspace.findById(req.params.workspace_id)
      .populate("owner", "name email")
      .populate("members", "name email")
      .populate("channels", "name description")

    if (!workspace) {
      return res.status(404).json({
        ok: false,
        message: "Workspace no encontrado",
      })
    }

    res.json({
      ok: true,
      data: workspace,
    })
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: "Error interno del servidor",
    })
  }
}

