import mongoose from 'mongoose';
import { ServerError } from "../utils/errors.utils.js";
import channelRepository from "../repositories/channel.repository.js";
import messageRepository from "../repositories/message.repository.js";
import { AUTHORIZATION_TOKEN_PROPS } from "../utils/constants/token.constants.js";
import Message  from "../models/Message.model.js";

// Controlador para crear canal
export const createChannelController = async (req, res) => {
    try {
        const { name } = req.body;
        const { workspace_id } = req.params;
        const user_id = req.user[AUTHORIZATION_TOKEN_PROPS.ID];

        if (!workspace_id) throw new ServerError('Workspace ID es requerido', 400);
        if (!mongoose.Types.ObjectId.isValid(workspace_id)) throw new ServerError('Workspace ID inválido', 400);
        if (!name?.trim()) throw new ServerError('Nombre de canal requerido', 400);

        const channel = await channelRepository.createChannel({ 
            name: name.trim(), 
            workspace_id, 
            user_id 
        });

        res.status(201).json({ 
            ok: true, 
            message: 'Canal creado exitosamente', 
            data: channel 
        });

    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ 
            ok: false, 
            status, 
            message: error.message 
        });
    }
};

// Controlador para obtener canales de un workspace
export const getWorkspaceChannelsController = async (req, res) => {
    try {
        const { workspace_id } = req.params;
        const user_id = req.user[AUTHORIZATION_TOKEN_PROPS.ID];

        if (!workspace_id) throw new ServerError('Workspace ID es requerido', 400);

        const channels = await channelRepository.findChannelsByWorkspace({ 
            workspace_id, 
            user_id 
        });

        res.status(200).json({ 
            ok: true, 
            data: channels 
        });

    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ 
            ok: false, 
            status, 
            message: error.message 
        });
    }
};

// Controlador para obtener un canal específico
export const getChannelByIdController = async (req, res) => {
    try {
        const { workspace_id, channel_id } = req.params;
        console.log('workspace_id:', workspace_id);  // Verificar que el workspace_id es correcto
        console.log('channel_id:', channel_id);      // Verificar que el channel_id es correcto

        if (!mongoose.Types.ObjectId.isValid(workspace_id)) {
            throw new ServerError('Workspace ID inválido', 400);  // Validación de workspace_id
        }

        if (!mongoose.Types.ObjectId.isValid(channel_id)) {
            throw new ServerError('Channel ID inválido', 400);  // Validación de channel_id
        }

        const user_id = req.user[AUTHORIZATION_TOKEN_PROPS.ID];

        const channel = await channelRepository.findChannelById({ 
            workspace_id, 
            channel_id, 
            user_id 
        });

        if (!channel) throw new ServerError('Canal no encontrado', 404);

        res.status(200).json({ 
            ok: true, 
            data: channel 
        });

    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ 
            ok: false, 
            status, 
            message: error.message 
        });
    }
};



// Controlador para enviar mensaje a un canal
export const sendMessageToChannelController = async (req, res) => {
    try {
      const { workspace_id, channel_id, user_id } = req.params;
      const { content } = req.body;
  
      // Validación mínima del contenido
      if (!content?.trim()) {
        throw new ServerError("El contenido del mensaje es requerido", 400);
      }
  
      // Creación directa del mensaje (sin validaciones adicionales)
      const newMessage = await Message.create({
        channel_ref: channel_id,
        sender: user_id,
        workspace_ref: workspace_id,
        content: content.trim(),
        created_at: new Date()
      });
  
      res.status(201).json({
        success: true,
        data: newMessage
      });
  
    } catch (error) {
      console.error('Error en controlador:', {
        params: req.params,
        body: req.body,
        error: error.message
      });
      
      const status = error.status || 500;
      res.status(status).json({
        success: false,
        error: error.message
      });
    }
  };
  export const getMessagesListFromChannelController = async (req, res) => {
    try {
        const { channel_id, workspace_id } = req.params;
        const user_id = req.user[AUTHORIZATION_TOKEN_PROPS.ID];

        // Versión simple sin paginación
        const messages = await Message.find({ 
            channel_ref: channel_id,
            workspace_ref: workspace_id 
        })
        .populate('sender', 'username avatar')
        .sort({ created_at: -1 }) // Más recientes primero
        .lean();

        res.status(200).json({
            ok: true,
            data: {
                messages,
                count: messages.length
            }
        });

    } catch (error) {
        res.status(error.status || 500).json({ 
            ok: false, 
            message: error.message 
        });
    }
};