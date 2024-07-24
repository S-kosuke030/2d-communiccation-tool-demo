const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const players = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // 新しいプレイヤーが接続したときの処理
  socket.on('new player', (data) => {
    players[socket.id] = {
      x: data.x,
      y: data.y,
      playerId: socket.id,
    };
    // 新しいプレイヤーに現在のプレイヤー情報を送信
    socket.emit('current players', players);
    // 他のプレイヤーに新しいプレイヤーの情報を送信
    socket.broadcast.emit('new player', players[socket.id]);
  });

  // プレイヤーの移動を処理
  socket.on('player movement', (movementData) => {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    socket.broadcast.emit('player moved', players[socket.id]);
  });

  // プレイヤーが切断したときの処理
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete players[socket.id];
    io.emit('player disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
