import React, { useState } from 'react';
import Room from './Room';

const App = () => {
  const [roomNumber, setRoomNumber] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [inRoom, setInRoom] = useState(false);

  const joinRoom = () => {
    if (roomNumber && playerName) {
      setInRoom(true);
    } else {
      alert('Please enter both a room number and a name!');
    }
  };

  if (inRoom) {
    return <Room roomNumber={roomNumber} playerName={playerName} />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Join a Room</h1>
      <input
        type="text"
        placeholder="Enter Room Number"
        value={roomNumber}
        onChange={(e) => setRoomNumber(e.target.value)}
        className="mb-2 p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Enter Your Name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className="mb-4 p-2 border rounded"
      />
      <button
        onClick={joinRoom}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Join Room
      </button>
    </div>
  );
};

export default App;
