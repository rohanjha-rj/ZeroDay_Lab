const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

const rooms = {};

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('create-room', ({ roomName, type }) => {
    const roomId = `room-${Math.random().toString(36).substr(2, 6)}`;
    rooms[roomId] = {
      id: roomId,
      name: roomName,
      type,
      attacker: null,
      defender: null,
      status: 'waiting',
      viewers: 0,
      logs: []
    };
    socket.join(roomId);
    socket.emit('room-created', rooms[roomId]);
    io.emit('rooms-list', Object.values(rooms));
  });

  socket.on('join-room', ({ roomId, role, username }) => {
    const room = rooms[roomId];
    if (!room) return socket.emit('error', 'Room not found');

    if (role === 'attacker' && !room.attacker) {
      room.attacker = username;
    } else if (role === 'defender' && !room.defender) {
      room.defender = username;
    } else if (role === 'viewer') {
      room.viewers++;
    } else {
      return socket.emit('error', 'Role already taken');
    }

    if (room.attacker && room.defender) {
      room.status = 'live';
    }

    socket.join(roomId);
    io.to(roomId).emit('room-updated', room);
    io.emit('rooms-list', Object.values(rooms));
  });

  socket.on('attack-payload', ({ roomId, payload }) => {
    const room = rooms[roomId];
    if (!room) return;
    const log = { time: Date.now(), type: 'attack', data: payload };
    room.logs.push(log);
    io.to(roomId).emit('action-log', log);
  });

  socket.on('defend-patch', ({ roomId, patchId }) => {
    const room = rooms[roomId];
    if (!room) return;
    const log = { time: Date.now(), type: 'defend', data: patchId };
    room.logs.push(log);
    io.to(roomId).emit('action-log', log);
  });

  socket.on('get-rooms', () => {
    socket.emit('rooms-list', Object.values(rooms));
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO Multiplayer Server running on port ${PORT}`);
});
