const { getIo } = require("../config/socket");
const Room = require("../models/room.model");
async function emitGameUpdated(roomId, game) {
  const room = await Room.findById(roomId);
  if (!room) return;
  const io = getIo();

  io.to(room.roomCode).emit("game-updated", game);
}

module.exports = {
  emitGameUpdated,
};
