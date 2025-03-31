import mongoose from "mongoose"

const messageSchema = new mongoose.Schema(
  {
    channel_ref: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
      index: true, 
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    created_at: {
      type: Date,
      default: Date.now,
      index: true, 
    },
    workspace_ref: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Índice compuesto para búsquedas frecuentes de mensajes
messageSchema.index({ channel_ref: 1, created_at: -1 })

const Message = mongoose.model("Message", messageSchema)
export default Message

