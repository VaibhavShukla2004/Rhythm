import api from './index';

export const createRoom = (maxPlayers) => api.post('/room/create', { maxPlayers });
export const joinRoom = (roomCode) => api.post('/room/join', { roomCode });
export const leaveRoom = (roomCode) => api.post('/room/leave', { roomCode });
export const getRoomDetails = (roomCode) => api.get(`/room/${roomCode}`);
export const startGame = (roomCode) => api.post('/room/start-game', { roomCode });
export const finishGame = (roomCode) => api.post(`/room/finish-game/${roomCode}`);
export const transferHost = (roomCode, newHostId) =>
  api.post('/room/transfer-host', { roomCode, newHostId });
