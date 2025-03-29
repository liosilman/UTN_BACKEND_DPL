import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { 
  createWorkspaceController,
  inviteUserToWorkspaceController,
  getAllWorkspacesController,
  getWorkspaceByIdController
} from "../controllers/workspace.controller.js";
import channelRouter from "./channel.router.js";

const workspaceRouter = Router();

// Middleware de autenticación
workspaceRouter.use(authMiddleware);

// Rutas existentes de workspaces
workspaceRouter.get('/', getAllWorkspacesController);
workspaceRouter.get('/:workspace_id', getWorkspaceByIdController);  // Nueva ruta
workspaceRouter.post('/create-workspace', createWorkspaceController);  // Actualizada a 'create' sin /workspace_id
workspaceRouter.post('/:workspace_id/invite/:invited_id', inviteUserToWorkspaceController);

// Rutas de canales (con middleware que inyecta workspace_id)
workspaceRouter.use('/:workspace_id/channels', (req, res, next) => {
    req.workspace_id = req.params.workspace_id;
    next();
}, channelRouter);

export default workspaceRouter;
