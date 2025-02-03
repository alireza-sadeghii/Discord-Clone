const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    sender: {
        type: String,
        default: 'bot',
    },
    channel: {
        type: String,
        default: 'general',
    }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
