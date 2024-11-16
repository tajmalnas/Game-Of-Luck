const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Store rooms and their players
const rooms = {};

const deck = [
  '2♠', '3♠', '4♠', '5♠', '6♠', '7♠', '8♠', '9♠', '10♠', 'J♠', 'Q♠', 'K♠', 'A♠',
  '2♥', '3♥', '4♥', '5♥', '6♥', '7♥', '8♥', '9♥', '10♥', 'J♥', 'Q♥', 'K♥', 'A♥',
  '2♦', '3♦', '4♦', '5♦', '6♦', '7♦', '8♦', '9♦', '10♦', 'J♦', 'Q♦', 'K♦', 'A♦',
  '2♣', '3♣', '4♣', '5♣', '6♣', '7♣', '8♣', '9♣', '10♣', 'J♣', 'Q♣', 'K♣', 'A♣',
];

io.on('connection', (socket) => {
  console.log(`A player connected with ID: ${socket.id}`);

  // Handle player joining room
  socket.on('joinRoom', ({ roomNumber, playerName }) => {
    console.log(`Player ${playerName} is joining room ${roomNumber}`);
    
    if (!rooms[roomNumber]) {
      rooms[roomNumber] = [];
      console.log(`Room ${roomNumber} created.`);
    }

    // Check if player is already in the room
    const playerExists = rooms[roomNumber].some(
      (player) => player.id === socket.id
    );

    if (!playerExists) {
      rooms[roomNumber].push({ id: socket.id, name: playerName, card: null });
      console.log(`Player ${playerName} added to room ${roomNumber}.`);
    }

    io.to(roomNumber).emit('updatePlayers', rooms[roomNumber]);
    console.log('Updated players in room:', rooms[roomNumber]);

    socket.join(roomNumber);

    socket.on('disconnect', () => {
      rooms[roomNumber] = rooms[roomNumber].filter(
        (player) => player.id !== socket.id
      );
      io.to(roomNumber).emit('updatePlayers', rooms[roomNumber]);
      console.log('Updated players in room after disconnect:', rooms[roomNumber]);
    });
  });

  // Handle card distribution
  socket.on('distributeCards', ({ roomNumber }) => {
    console.log(`Distribute cards requested in room ${roomNumber}`);

    if (rooms[roomNumber]) {
      const shuffledDeck = [...deck].sort(() => 0.5 - Math.random());
      console.log('Shuffled deck:', shuffledDeck);

      const distributedCards = rooms[roomNumber].reduce((acc, player, index) => {
        acc[player.id] = shuffledDeck[index % shuffledDeck.length];
        player.card = acc[player.id]; // Update player's card
        console.log(`Player ${player.name} received card: ${player.card}`);
        return acc;
      }, {});

      io.to(roomNumber).emit('updateCards', distributedCards);
      io.to(roomNumber).emit('updatePlayers', rooms[roomNumber]);
      console.log('Distributed cards:', distributedCards);
      console.log('Updated players in room after disconnect:', rooms[roomNumber]);
    }
  });
});

server.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});
