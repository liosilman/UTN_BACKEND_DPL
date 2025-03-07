import { Router } from "express"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import { createWorkspaceController, invteUserToWorkspaceController } from "../controllers/workspace.controller.js"

const workspaceRouter = Router()

workspaceRouter.post('/', authMiddleware, createWorkspaceController)

// api/workspaces/invite/3123112dase3211
workspaceRouter.post('/:workspace_id/invite/:invited_id', authMiddleware, invteUserToWorkspaceController)

export default workspaceRouter