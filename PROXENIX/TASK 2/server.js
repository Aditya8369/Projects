const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const users = {};
const rooms = ['General', 'Tech', 'Random'];
const messageReactions = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('authenticate', (data) => {
    const { username, password } = data;
    if (users[username] && users[username] === password) {
      socket.username = username;
      socket.emit('authenticated', { success: true, rooms });
    } else {
      socket.emit('authenticated', { success: false, message: 'Invalid credentials' });
    }
  });

  socket.on('register', (data) => {
    const { username, password } = data;
    if (!users[username]) {
      users[username] = password;
      socket.emit('registered', { success: true });
    } else {
      socket.emit('registered', { success: false, message: 'Username already exists' });
    }
  });

  socket.on('join room', (room) => {
    if (socket.username) {
      socket.join(room);
      socket.currentRoom = room;
      socket.to(room).emit('user joined', { username: socket.username, room });
      socket.emit('joined room', room);
    }
  });

  socket.on('chat message', (data) => {
    const { message } = data;
    if (socket.username && socket.currentRoom) {
      const messageData = { id: Date.now(), username: socket.username, message, room: socket.currentRoom, reactions: {} };
      messageReactions[messageData.id] = {};
      io.to(socket.currentRoom).emit('chat message', messageData);
    }
  });

  socket.on('react', (data) => {
    const { messageId, emoji } = data;
    if (socket.username) {
      if (!messageReactions[messageId]) {
        messageReactions[messageId] = {};
      }
      if (!messageReactions[messageId][emoji]) {
        messageReactions[messageId][emoji] = [];
      }
      if (!messageReactions[messageId][emoji].includes(socket.username)) {
        messageReactions[messageId][emoji].push(socket.username);
      }
      io.to(socket.currentRoom).emit('reaction update', { messageId, reactions: messageReactions[messageId] });
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    if (socket.username && socket.currentRoom) {
      socket.to(socket.currentRoom).emit('user left', { username: socket.username, room: socket.currentRoom });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
