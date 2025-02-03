var express = require('express');
var router = express.Router();
var Message = require('../model/message')

router.get('/api/messages/:channel', async function (req, res) {
    try {
        const channel = req.params.channel;
        const messages = await Message.find({channel});
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({error: 'Failed to fetch messages.'});
    }
});

module.exports = router;
