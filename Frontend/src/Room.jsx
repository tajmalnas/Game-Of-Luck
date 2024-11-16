import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

const Room = ({ roomNumber, playerName }) => {
  const [players, setPlayers] = useState([]);
  const [cards, setCards] = useState({});
  const [showBacks, setShowBacks] = useState(true); // New state to control card back visibility

  const deck = [
    '2♠', '3♠', '4♠', '5♠', '6♠', '7♠', '8♠', '9♠', '10♠', 'J♠', 'Q♠', 'K♠', 'A♠',
    '2♥', '3♥', '4♥', '5♥', '6♥', '7♥', '8♥', '9♥', '10♥', 'J♥', 'Q♥', 'K♥', 'A♥',
    '2♦', '3♦', '4♦', '5♦', '6♦', '7♦', '8♦', '9♦', '10♦', 'J♦', 'Q♦', 'K♦', 'A♦',
    '2♣', '3♣', '4♣', '5♣', '6♣', '7♣', '8♣', '9♣', '10♣', 'J♣', 'Q♣', 'K♣', 'A♣',
  ];

  // Create a mapping of card values to image URLs (Ace, 2, 3, etc.)
  const cardImageMap = (card) => {
    let rank = card.slice(0, -1); // Get rank (e.g., "A", "2", "K")
    const suit = card.slice(-1); // Get suit (e.g., "♠", "♥")
    if (rank === '10') rank = '0';

    const suitCode = suit === '♠' ? 'S' : suit === '♥' ? 'H' : suit === '♦' ? 'D' : 'C';
    const cardCode = `${rank}${suitCode}`;

    return `https://deckofcardsapi.com/static/img/${cardCode}.png`;
  };

  useEffect(() => {
    console.log(`Joining room ${roomNumber} as player ${playerName}`);
    socket.emit('joinRoom', { roomNumber, playerName });

    const handleUpdatePlayers = (updatedPlayers) => {
      const uniquePlayers = Array.from(
        new Map(updatedPlayers.map((p) => [p.id, p])).values()
      );
      setPlayers(uniquePlayers);
    };

    const handleCardsUpdate = (distributedCards) => {
      setCards(distributedCards);
      // Start flipping the cards after a 2-second delay
      setTimeout(() => {
        setShowBacks(false); // Show the actual cards after 2 seconds
      }, 2000);
    };

    socket.on('updatePlayers', handleUpdatePlayers);
    socket.on('updateCards', handleCardsUpdate);

    return () => {
      socket.off('updatePlayers', handleUpdatePlayers);
      socket.off('updateCards', handleCardsUpdate);
    };
  }, [roomNumber, playerName]);

  const distributeCards = () => {
    console.log("Distribute Cards button clicked");

    const shuffledDeck = [...deck].sort(() => 0.5 - Math.random());
    const distributedCards = players.reduce((acc, player, index) => {
      acc[player.id] = shuffledDeck[index % shuffledDeck.length];
      return acc;
    }, {});

    // Emit the distributeCards event to the backend to handle card distribution
    socket.emit('distributeCards', { roomNumber });

    // Reset card backs visibility and delay showing actual cards
    setShowBacks(true);
    setCards({}); // Clear previously displayed cards before the next distribution
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-r from-gray-800 to-gray-900 text-gray-200">
      {/* Room Header */}
      <div className="flex flex-col items-center py-6">
        <h1 className="text-4xl font-semibold text-white mb-2">Room {roomNumber}</h1>
        <h2 className="text-xl text-gray-400">Players in the Room</h2>
      </div>

      {/* Distribute Cards Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={distributeCards}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white text-xl font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
        >
          Distribute Cards
        </button>
      </div>

      {/* Players and Cards Section */}
      <div className="flex-grow flex justify-center items-center overflow-y-auto p-6">
        <div className="flex flex-wrap justify-center gap-10">
          {players.map((player, index) => (
            <div
              key={player.id}
              className="flex flex-col items-center bg-gray-700 rounded-lg p-6 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <img
                src={`https://ui-avatars.com/api/?name=${player.name}&background=random`}
                alt={`${player.name}'s avatar`}
                className="w-20 h-20 rounded-full mb-4 border-4 border-gray-500"
              />
              <span className="text-lg font-medium text-white">{player.name}</span>

              {/* Initially showing card back, then flipping after 2 seconds */}
              <img
                src={showBacks ? 'https://deckofcardsapi.com/static/img/back.png' : cardImageMap(cards[player.id])}
                alt={showBacks ? 'Card Back' : 'Card'}
                className={`w-20 h-28 mt-4 rounded-lg shadow-md transition-all duration-1000 ease-in-out transform ${showBacks ? 'opacity-100' : 'opacity-100'}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Room;
