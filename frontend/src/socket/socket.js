import { io } from 'socket.io-client';

// Single socket instance — does NOT auto-connect on import
const socket = io(import.meta.env.VITE_SOCKET_URL, {
  autoConnect: false,
});

export default socket;
