const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const players = {};

io.on('connection', (socket) => {
  const color = "hsl(" + Math.random() * 360 + ", 100%, 50%)";

  const player = {
    id: socket.id,
    x: Math.floor(Math.random() * 10) * 50,
    y: Math.floor(Math.random() * 10) * 50,
    color,
    name: ''
  };

  players[socket.id] = player;

  socket.emit('init', { players });
  socket.broadcast.emit('newPlayer', player);

  socket.on('move', (direction) => {
    handlePlayerMovement(socket.id, direction);
  });

  socket.on('nameGiven', (name) => {
    const playerId = socket.id;
    players[playerId].name = name;
    io.emit('nameSent', { playerId, name });
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

function handlePlayerMovement(playerId, direction) {
  const player = players[playerId];

  if (direction === 'up') {
    player.y -= 50;
  } 
  else if (direction === 'down') {
    player.y += 50;
  } 
  else if (direction === 'left') {
    player.x -= 50;
  } 
  else if (direction === 'right') {
    player.x += 50;
  }

  io.emit('playerMoved', { playerId, x: player.x, y: player.y });
}
