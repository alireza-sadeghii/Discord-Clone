const emojiButton = document.querySelector('#emoji-btn');
const emojiPicker = document.getElementById('emoji-picker');
const textarea = document.getElementById('chat-input');
const channelMessages = {};

emojiButton.addEventListener('click', () => {
    emojiPicker.style.display = emojiPicker.style.display === 'flex' ? 'none' : 'flex';
});

document.addEventListener('click', (e) => {
    if (!emojiButton.contains(e.target) && !emojiPicker.contains(e.target)) {
        emojiPicker.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const emojis = ["😊", "😂", "😍", "😎", "😭", "😜", "🤔", "😅", "😇", "😢", "😌", "😜", "😉", "😃", "😱", "🥰", "😚", "🤗", "😏", "🤩"];

    const emojiPicker = document.getElementById('emoji-picker');

    emojis.forEach(emoji => {
        const span = document.createElement('span');
        span.classList.add('emoji');
        span.setAttribute('data-emoji', emoji);
        span.textContent = emoji;
        span.addEventListener('click', (e) => {
            const emojiText = e.target.getAttribute('data-emoji');
            const cursorPosition = textarea.selectionStart;
            const textBefore = textarea.value.substring(0, cursorPosition);
            const textAfter = textarea.value.substring(cursorPosition, textarea.value.length);

            textarea.value = textBefore + emojiText + textAfter;

            textarea.selectionStart = textarea.selectionEnd = cursorPosition + emojiText.length;

            emojiPicker.style.display = 'none';
        });
        emojiPicker.appendChild(span);
    });
});


const socket = io();
document.getElementById('send-btn').addEventListener('click', () => {
    const message = document.getElementById('chat-input').value;

    if (!message.trim()) {
        return;
    }

    const selectedChannel = document.getElementById('selected-channel-name').innerText;
    socket.emit('send-message', { message, selectedChannel });

    document.getElementById('chat-input').value = '';
});

function createMessageElement({ content, sender, createdAt }) {
    const newMessageElement = document.createElement('div');
    const newMessageContent = document.createElement('div');
    const newMessageDetail = document.createElement('div');
    const newMessageData = document.createElement('div');
    const profileImage = document.createElement('img');

    newMessageElement.classList.add('message-element');
    newMessageContent.classList.add('message-content');
    newMessageDetail.classList.add('message-detail');
    newMessageData.classList.add('message-data');
    profileImage.classList.add('profile-image');

    profileImage.src = '/images/profile.png';
    newMessageData.textContent = content;
    const formattedTime = createdAt ? new Date(createdAt).toLocaleString() : 'Time not available';
    newMessageDetail.textContent = `${sender} | ${formattedTime}`;

    newMessageElement.appendChild(profileImage);
    newMessageContent.appendChild(newMessageDetail);
    newMessageContent.appendChild(newMessageData);
    newMessageElement.appendChild(newMessageContent);

    return newMessageElement;
}

function renderMessages(messages) {
    const messageContainer = document.getElementById('message-section');
    messageContainer.innerHTML = '';

    messages.forEach(message => {
        const messageElement = createMessageElement(message);
        messageContainer.appendChild(messageElement);
    });

    messageContainer.scrollTop = messageContainer.scrollHeight;
}

socket.on('new-message', (newMessage) => {
    console.log('Received new message:', newMessage);

    if (newMessage.channel === document.getElementById('selected-channel-name').innerText) {
        const messageContainer = document.getElementById('message-section');
        const messageElement = createMessageElement({
            content: newMessage.content,
            sender: newMessage.username,
            createdAt: new Date()
        });
        messageContainer.appendChild(messageElement);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }
});

