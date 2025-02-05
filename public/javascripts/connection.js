let isMuted = false;
let isDeaf = false;
let localStream = null;
let peerConnections = {};
let mediaConstraints = { audio: true, video: false };


socket.on('made-voice-connection', (data) => {
    getUserMedia().then(() => {
        const { channel, users } = data;
        users.forEach((userId) => {
            if (userId !== socket.id) {
                createPeerConnection(userId);
                startCall(userId);
                playJoinEffect();
            }
        });
    }).catch(error => {
        console.error('Error accessing media devices:', error);
        alert('Unable to access microphone.');
    });
});

async function getUserMedia() {
    try {
        if (!localStream) {
            localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
        }
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
        if (track.kind === 'audio') {
            track.enabled = !isMuted;
        }
        peerConnection.addTrack(track, localStream);
    });

    peerConnections[userId] = peerConnection;

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
        remoteAudio.muted = isDeaf;

        handleUserStream(event.streams[0]);
    };
}

async function startCall(userId) {
    const peerConnection = peerConnections[userId];
    console.log(peerConnection);

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
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).then(() => console.log(`Added ICE candidate for ${targetUserId}`))
            .catch(error => console.error(`Error adding ICE candidate for ${targetUserId}:`, error));
    }
});


function leaveVoiceChannel() {
    Object.keys(peerConnections).forEach(userId => {
        const peerConnection = peerConnections[userId];
        peerConnection.close();
        delete peerConnections[userId];
    });

    document.querySelectorAll('audio').forEach(audio => audio.remove());

    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    localStream = null;
}

function muteUser() {
    if (localStream) {
        localStream.getTracks().forEach(track => {
            if (track.kind === 'audio') {
                track.enabled = false; // Mute the audio track
            }
        });
        isMuted = true;
    }
}

function unmuteUser() {
    if (localStream) {
        localStream.getTracks().forEach(track => {
            if (track.kind === 'audio') {
                track.enabled = true;
            }
        });
        isMuted = false;
    }
}

function deafUser() {
    document.querySelectorAll('audio').forEach(audio => {
        audio.muted = true;
    });
    isDeaf = true;
}

function undeafUser() {
    document.querySelectorAll('audio').forEach(audio => {
        audio.muted = false;
    });
    isDeaf = false;
}


socket.on('update-talking-status', ({ username, isTalking }) => {
    const userProfile = document.getElementById(username);

    if (userProfile) {
        if (isTalking) {
            userProfile.classList.add('voice-coordinator');
        } else {
            userProfile.classList.remove('voice-coordinator');
        }
    }
});

socket.on('user-left', (userId) => {
    if (peerConnections[userId]) {
        peerConnections[userId].close();
        delete peerConnections[userId];
        const remoteAudio = document.getElementById(`audio-${userId}`);
        if (remoteAudio) {
            remoteAudio.remove();
        }
        console.log(`User ${userId} left, removed peer connection.`);
    }
});


function playJoinEffect() {
    const audio = new Audio('./resources/join.mp3');
    audio.play().catch(error => {
        console.error('Error playing MP3:', error);
    });
}
