import Message from "../models/Message.js";

// Enviar un mensaje a un canal
export const sendMessageToChannelController = async (req, res) => {
    try {
        const { text } = req.body;
        const { channel_id } = req.params;
        const user_id = req.user._id;

        const newMessage = new Message({ text, sender: user_id, channel_ref: channel_id });
        await newMessage.save();

        res.status(201).json({ ok: true, message: "Mensaje enviado", data: newMessage });
    } catch (error) {
        res.status(500).json({ ok: false, message: "Error al enviar el mensaje", error });
    }
};

// Obtener la lista de mensajes de un canal
export const getMessagesListFromChannelController = async (req, res) => {
    try {
        const { channel_id } = req.params;

        const messages = await Message.find({ channel_ref: channel_id })
            .populate("sender", "username")
            .sort({ created_at: 1 });

        res.status(200).json({ ok: true, messages });
    } catch (error) {
        res.status(500).json({ ok: false, message: "Error al obtener los mensajes", error });
    }
};