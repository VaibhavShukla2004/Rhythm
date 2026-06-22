const { getIo } = require('../config/socket');

function emitGameUpdated(roomId,game) {
    const room = await Room.findById(roomId);
    if (!room) return;
    const io = getIo();

    io.to(room.roomCode).emit(
        'game-updated',
        game
    );
}

module.exports = {
    emitGameUpdated
};