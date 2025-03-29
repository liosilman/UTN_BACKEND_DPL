import { Router } from "express";
import { 
  createChannelController,
  sendMessageToChannelController,
  getMessagesListFromChannelController,
  getChannelByIdController,
  getWorkspaceChannelsController
} from "../controllers/channel.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import mongoose from "mongoose";

const channelRouter = Router();

// 1. Middlewares Básicos
channelRouter.use(authMiddleware); // Autenticación obligatoria

// 2. Middleware para extraer workspace_id
const extractIds = (req, res, next) => {
  // Extraer workspace_id de la URL
  req.params.workspace_id = req.baseUrl.match(/\/workspaces\/([^\/]+)/)?.[1] || req.params.workspace_id;
  
  if (!req.params.workspace_id) {
    return res.status(400).json({ error: "Workspace ID requerido" });
  }
  
  // Asignar user_id desde el token
  req.params.user_id = req.user._id || req.user.userId;
  next();
};

// 3. Middleware para validar channel_id
const validateChannel = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.channel_id)) {
    return res.status(400).json({ error: "ID de canal inválido" });
  }
  next();
};

// 4. Configuración de Rutas

// Rutas básicas de canales
channelRouter.route('/')
  .get(extractIds, getWorkspaceChannelsController)
  .post(extractIds, createChannelController);

// Ruta para un canal específico
channelRouter.get('/:channel_id', extractIds, validateChannel, getChannelByIdController);

// Rutas de mensajes (simplificadas)
channelRouter.route('/:channel_id/messages')
  .get(extractIds, validateChannel, getMessagesListFromChannelController)
  .post(extractIds, validateChannel, (req, res, next) => {
    console.log('Creando mensaje en:', {
      channel: req.params.channel_id,
      user: req.params.user_id
    });
    next();
  }, sendMessageToChannelController);

export default channelRouter;