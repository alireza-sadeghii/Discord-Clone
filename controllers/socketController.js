const Message = require("../model/message");
const connectedUsers = new Set();
const voiceChannels = {};
const usernameToSocketIdMap = new Map();

const handleSocketConnection = (socket, io) => {
    console.log('a user connected');

    const randomUsername = `user#${Math.floor(Math.random() * 10000)}`;
    socket.username = randomUsername;
    connectedUsers.add(socket.username);

    usernameToSocketIdMap.set(randomUsername, socket.id);

    socket.emit('username-assigned', randomUsername);
    socket.emit('initial-voice-channels', voiceChannels);
    io.emit('update-member-list', Array.from(connectedUsers));

    socket.on('send-message', async (messageData) => {
        try {
            const newMessage = new Message({
                content: messageData.message,
                createdAt: new Date(),
                sender: randomUsername,
                channel: messageData.selectedChannel,
            });

            await newMessage.save();

            io.emit('new-message', {
                content: newMessage.content,
                username: newMessage.sender,
                time: newMessage.createdAt,
                channel: newMessage.channel,
            });
        } catch (error) {
            console.error('Error saving message:', error);
            socket.emit('error', {message: 'Failed to save message.'});
        }
    });

    socket.on('create-new-voice-channel', ({ channelName }) => {
        if (voiceChannels[channelName]) {
            return;
        }
        voiceChannels[channelName] = [];
        io.emit('add-new-voice-channel', { channelName });
        socket.emit('initial-voice-channels', voiceChannels);
    });

    socket.on('join-voice-channel', (data) => {
        const {channel} = data;
        socket.voice_channel = channel;

        removeFromChannels(randomUsername, io);

        if (!voiceChannels[channel]) {
            voiceChannels[channel] = [];
        }

        if (!voiceChannels[channel].includes(randomUsername)) {
            voiceChannels[channel].push(randomUsername);
        }

        io.emit('voice-channel-users', {channel, users: voiceChannels[channel]});
        socket.emit('voice-channel-users', {channel, users: voiceChannels[channel]});
        socket.emit('made-voice-connection', {channel, users: Array.from(getUsersID(channel))});
    });

    socket.on('offer', (data) => {
        const { targetUserId, offer } = data;
        if (targetUserId) {
            io.to(targetUserId).emit('offer', {
                targetUserId: socket.id,
                offer: offer
            });
        }
    });

    socket.on('answer', (data) => {
        const { targetUserId, answer } = data;
        if (targetUserId) {
            io.to(targetUserId).emit('answer', {
                targetUserId: socket.id,
                answer: answer
            });
        }
    });

    socket.on('ice-candidate', (data) => {
        const { targetUserId, candidate } = data;
        if (targetUserId) {
            io.to(targetUserId).emit('ice-candidate', {
                targetUserId: socket.id,
                candidate: candidate
            });
        }
    });

    socket.on('user-talking', ({ username, isTalking }) => {
        const channel = socket.voice_channel;
        if (channel) {
            voiceChannels[channel].forEach(user => {
                io.to(getSocketIdByUsername(user)).emit('update-talking-status', { username, isTalking });
            });
        }
    });

    socket.on('silent-user', ({ username }) => {
        socket.emit('make-user-silent', { userId: getSocketIdByUsername(username) });
    });

    socket.on('disconnect-from-voice-channel', () => {
        io.emit('user-left', socket.id);
        removeFromChannels(randomUsername, io);
    });

    socket.on('connect_error', () => {
        console.error('Socket connection failed.');
        alert('Unable to connect to the server.');
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        connectedUsers.delete(socket.username);
        removeFromChannels(randomUsername, io);
        io.emit('update-member-list', Array.from(connectedUsers));

        usernameToSocketIdMap.delete(socket.username);
    });
};

const getSocketIdByUsername = (username) => {
    return usernameToSocketIdMap.get(username);
};

const getUsersID = (channel) => {
    const IDs = new Set();
    voiceChannels[channel].forEach(user => {
        IDs.add(getSocketIdByUsername(user));
    });
    return IDs;
};

const removeFromChannels = (username, io) => {
    Object.keys(voiceChannels).forEach(channel => {
        voiceChannels[channel] = voiceChannels[channel].filter(user => user !== username);
        io.emit('voice-channel-users', {channel, users: voiceChannels[channel]});
    });
};


module.exports = {handleSocketConnection};
