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
    document.getElementById("user-info").innerText = username;
});

const muteButton = document.getElementById('mute');
muteButton.addEventListener('click', () => {
    muteButton.style.color = muteButton.style.color === 'red' ? 'greenyellow' : 'red';
});

const deafButton = document.getElementById('deaf');
deafButton.addEventListener('click', () => {
    deafButton.style.color = deafButton.style.color === 'red' ? 'greenyellow' : 'red';
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


const voices = document.querySelectorAll('.channel-name.voice-channel');
voices.forEach(voice => {
    voice.addEventListener('click', () => {
        all.forEach(ch => ch.classList.remove('selected'));
        voice.classList.add('selected');
        document.getElementById('selected-channel-name').innerText = voice.id;

        const channelName = voice.id;
        socket.emit('join-voice-channel', { channel: channelName });
    });
});

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
    const voiceChannelElement = document.getElementById(channel);
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
            userElement.appendChild(userProfile);
            userElement.appendChild(memberName);

            userList.appendChild(userElement);
        });
    }
}


const disconnectButton = document.getElementById('disconnect');
disconnectButton.addEventListener('click', () => {
    socket.emit("disconnect-from-voice-channel");
    leaveVoiceChannel();
});


//TODO: add btns action deaf amd mute and user connect to voice channel
