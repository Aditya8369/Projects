const socket = io();

const loginDiv = document.getElementById('login');
const roomSelectionDiv = document.getElementById('room-selection');
const chatDiv = document.getElementById('chat');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const loginMessageDiv = document.getElementById('login-message');
const roomSelect = document.getElementById('room-select');
const joinRoomBtn = document.getElementById('join-room-btn');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('send-btn');
const messagesDiv = document.getElementById('messages');

let currentUsername = '';
let currentRoom = '';

loginBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  if (username && password) {
    socket.emit('authenticate', { username, password });
  }
});

registerBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  if (username && password) {
    socket.emit('register', { username, password });
  }
});

socket.on('authenticated', (data) => {
  if (data.success) {
    currentUsername = usernameInput.value.trim();
    loginDiv.style.display = 'none';
    roomSelectionDiv.style.display = 'block';
  } else {
    loginMessageDiv.textContent = data.message;
  }
});

socket.on('registered', (data) => {
  if (data.success) {
    loginMessageDiv.textContent = 'Registration successful. Please login.';
  } else {
    loginMessageDiv.textContent = data.message;
  }
});

joinRoomBtn.addEventListener('click', () => {
  const room = roomSelect.value;
  if (room) {
    socket.emit('join room', room);
  }
});

socket.on('joined room', (room) => {
  currentRoom = room;
  roomSelectionDiv.style.display = 'none';
  chatDiv.style.display = 'flex';
});

sendBtn.addEventListener('click', () => {
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('chat message', { message });
    messageInput.value = '';
  }
});

messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendBtn.click();
  }
});

socket.on('chat message', (data) => {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', data.username === currentUsername ? 'user' : 'other');
  messageElement.setAttribute('data-message-id', data.id);
  messageElement.innerHTML = `
    <div>${data.username}: ${data.message}</div>
    <div class="reactions">
      <button class="react-btn" data-emoji="👍">👍</button>
      <button class="react-btn" data-emoji="❤️">❤️</button>
      <button class="react-btn" data-emoji="😂">😂</button>
      <button class="react-btn" data-emoji="😮">😮</button>
    </div>
    <div class="reaction-display"></div>
  `;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  // Request notification permission
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }

  // Show notification if tab is not active
  if (document.hidden && data.username !== currentUsername) {
    new Notification('New Message', {
      body: `${data.username}: ${data.message}`,
      icon: '/favicon.ico'
    });
  }
});

socket.on('user joined', (data) => {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', 'system');
  messageElement.textContent = `${data.username} joined ${data.room}`;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

socket.on('user left', (data) => {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', 'system');
  messageElement.textContent = `${data.username} left ${data.room}`;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

socket.on('bot message', (data) => {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', 'bot');
  messageElement.textContent = `${data.username}: ${data.message}`;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

socket.on('reaction update', (data) => {
  const { messageId, reactions } = data;
  const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
  if (messageElement) {
    const reactionDisplay = messageElement.querySelector('.reaction-display');
    reactionDisplay.innerHTML = Object.entries(reactions).map(([emoji, users]) => `${emoji} ${users.length}`).join(' ');
  }
});

messagesDiv.addEventListener('click', (e) => {
  if (e.target.classList.contains('react-btn')) {
    const messageId = e.target.closest('.message').getAttribute('data-message-id');
    const emoji = e.target.getAttribute('data-emoji');
    socket.emit('react', { messageId, emoji });
  }
});
