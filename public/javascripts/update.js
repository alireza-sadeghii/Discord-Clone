let name = null;

socket.on('update-member-list', (usernames) => {
    const memberList = document.getElementById('members-list');
    memberList.innerHTML = '';

    usernames.forEach((username) => {
        const listItem = document.createElement('span');
        listItem.classList.add('member-name');
        listItem.textContent = username;
        memberList.appendChild(listItem);
    });
});

socket.on('username-assigned', (username) => {
    name = username;
    document.getElementById("user-info").innerText = name;
});

const all = document.querySelectorAll('.channel-name');
const channels = document.querySelectorAll('.channel-name:not(.voice-channel)');
channels.forEach(channel => {
    channel.addEventListener('click', async () => {
        all.forEach(ch => ch.classList.remove('selected'));
        channel.classList.add('selected');
        document.getElementById('selected-channel-name').innerText = channel.innerHTML;
        await updateChatChannels();
    });
});

async function updateChatChannels() {
    const channelName = document.getElementById('selected-channel-name').innerText;
    try {
        const response = await fetch(`/api/messages/${channelName}`);
        const messages = await response.json();

        renderMessages(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await updateChatChannels();
});

function voiceChannelListener() {
    const voices = document.querySelectorAll('.channel-name.voice-channel');
    voices.forEach(voice => {
        voice.addEventListener('click', () => {
            all.forEach(ch => ch.classList.remove('selected'));
            voice.classList.add('selected');
            document.getElementById('selected-channel-name').innerText = voice.id;

            const channelName = voice.id;
            socket.emit("disconnect-from-voice-channel");
            leaveVoiceChannel();
            socket.emit('join-voice-channel', {channel: channelName});
        });
    });
}
voiceChannelListener();

document.addEventListener('DOMContentLoaded', () => {

    socket.on('voice-channel-users', (data) => {
        const {channel, users} = data;
        updateVoice(channel, users);
    });

    socket.on('initial-voice-channels', (channels) => {
        Object.entries(channels).forEach(([channel, users]) => {
            updateVoice(channel, users);
        });
    });

});

function updateVoice(channel, users) {
    let voiceChannelElement = document.getElementById(channel);
    if (!voiceChannelElement) {
        madeNewChannel(channel);
        voiceChannelElement = document.getElementById(channel);
    }
    if (voiceChannelElement) {
        let userList = voiceChannelElement.querySelector('.voice-members-list');
        if (!userList) {
            userList = document.createElement('div');
            userList.classList.add('voice-members-list');
            voiceChannelElement.appendChild(userList);
        }

        userList.innerHTML = '';

        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.classList.add('voice-members');

            const memberName = document.createElement('span');
            memberName.textContent = user;

            const userProfile = document.createElement('img');
            userProfile.setAttribute('src', '../images/profile.png');
            userProfile.id = user;

            userElement.appendChild(userProfile);
            userElement.appendChild(memberName);

            userList.appendChild(userElement);
        });
    }
}


const muteButton = document.getElementById('mute');
muteButton.addEventListener('click', () => {
    muteCheck();
});

function muteCheck() {
    if (muteButton.style.color === 'greenyellow') {
        muteButton.style.color = 'red';
        muteUser();
    }
    else {
        muteButton.style.color = 'greenyellow';
        unmuteUser();
    }
}

const deafButton = document.getElementById('deaf');
deafButton.addEventListener('click', () => {
    deafCheck();
});

function deafCheck() {
    if (deafButton.style.color === 'greenyellow') {
        deafButton.style.color = 'red';
        deafUser();
    }
    else {
        deafButton.style.color = 'greenyellow';
        undeafUser();
    }
}

function detectTalking(stream) {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);

    analyser.fftSize = 512;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    function updateTalkingIndicator() {
        analyser.getByteFrequencyData(dataArray);
        const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;

        const isTalking = volume > 25;

        socket.emit('user-talking', {username : name, isTalking: isTalking });

        requestAnimationFrame(updateTalkingIndicator);
    }

    updateTalkingIndicator();
}

const disconnectButton = document.getElementById('disconnect');
disconnectButton.addEventListener('click', () => {
    socket.emit("disconnect-from-voice-channel");
    leaveVoiceChannel();
});


const plusButton = document.querySelectorAll(".plus-sign")[0];
plusButton.addEventListener('click', () => {
    const newVoiceChannel = prompt('Enter Voice Channel Name: ');
    socket.emit('create-new-voice-channel', { channelName : newVoiceChannel } );
});


socket.on('add-new-voice-channel', ({ channelName }) => {
    madeNewChannel(channelName);
});

function madeNewChannel(channelName) {
    const newChannelElement = document.createElement('span');
    newChannelElement.classList.add('channel-name');
    newChannelElement.classList.add('voice-channel');
    newChannelElement.id = channelName;
    newChannelElement.innerText = channelName;
    const channelList = document.getElementById("channels-list");
    channelList.appendChild(newChannelElement);
    voiceChannelListener();
}