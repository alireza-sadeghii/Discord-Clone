
let localStream = null;
let peerConnections = {};
let mediaConstraints = { audio: true, video: false };


socket.on('made-voice-connection', (data) => {
    getUserMedia().then(() => {
        const { channel, users } = data;
        if (users.includes(socket.id)) {
            users.forEach((userId) => {
                if (userId !== socket.id && !peerConnections[userId]) {
                    createPeerConnection(userId);
                    startCall(userId);
                }
            });
        }
    }).catch(error => {
        console.error('Error accessing media devices:', error);
        alert('Unable to access microphone.');
    });
});

async function getUserMedia() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    } catch (error) {
        console.error('Error accessing media devices:', error);
        throw error;
    }
}

function createPeerConnection(userId) {
    const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnections[userId] = peerConnection;
    pcon = peerConnection;

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', {
                targetUserId: userId,
                candidate: event.candidate
            });
        }
    };

    peerConnection.ontrack = (event) => {
        let remoteAudio = document.getElementById(`audio-${userId}`);
        if (!remoteAudio) {
            remoteAudio = document.createElement('audio');
            remoteAudio.id = `audio-${userId}`;
            remoteAudio.autoplay = true;
            document.body.appendChild(remoteAudio);
        }
        remoteAudio.srcObject = event.streams[0];
    };
}

async function startCall(userId) {
    const peerConnection = peerConnections[userId];

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('offer', {
        targetUserId: userId,
        offer: offer
    });
}

socket.on('offer', async (data) => {
    const { targetUserId, offer } = data;
    if (!peerConnections[targetUserId]) {
        createPeerConnection(targetUserId);
    }
    const peerConnection = peerConnections[targetUserId];

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', {
        targetUserId: targetUserId,
        answer: answer
    });
});

socket.on('answer', async (data) => {
    const { targetUserId, answer } = data;
    const peerConnection = peerConnections[targetUserId];

    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('ice-candidate', (data) => {
    const { targetUserId, candidate } = data;
    const peerConnection = peerConnections[targetUserId];

    if (candidate) {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
});


function leaveVoiceChannel() {
    Object.keys(peerConnections).forEach(userId => {
        const peerConnection = peerConnections[userId];
        peerConnection.close();
    });
    peerConnections = {};
    document.querySelectorAll('audio').forEach(audio => audio.remove());
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    localStream = null;
}
