import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
    {
        text: {type: String, required: true},
        sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        channel_ref: {type: mongoose.Schema.Types.ObjectId, ref: 'Channel'},
        created_at: {type: Date, default: Date.now}
    }
)
const Message = mongoose.model('Message', messageSchema)
export default Message