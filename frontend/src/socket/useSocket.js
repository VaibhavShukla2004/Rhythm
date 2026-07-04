import { useEffect } from 'react';
import socket from './socket';
import { useGameStore } from '../store/useGameStore';

/**
 * useSocket — connects to the socket, joins the given room,
 * and listens for 'game-updated' events to keep the game store in sync.
 *
 * @param {string} roomCode - The room code to join on the socket
 */
export function useSocket(roomCode) {
  const setGame = useGameStore((state) => state.setGame);

  useEffect(() => {
    if (!roomCode) return;

    // Connect if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    // Join the Socket.IO room so we receive broadcasts for this room
    socket.emit('join-room', roomCode);

    // The ONLY server event — full game doc on every state change
    const handleGameUpdated = (game) => {
      setGame(game);
    };

    socket.on('game-updated', handleGameUpdated);

    return () => {
      socket.emit('leave-room', roomCode);
      socket.off('game-updated', handleGameUpdated);
    };
  }, [roomCode, setGame]);
}
