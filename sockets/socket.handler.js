function registerSocketHandlers(io) {

    io.on('connection', socket => {

        console.log(`Socket connected: ${socket.id}`);

        socket.on(
            'join-room',
            roomCode => {

                socket.join(roomCode);

                console.log(`${socket.id} joined room ${roomCode}`);
            }
        );

        socket.on(
            'leave-room',
            roomCode => {

                socket.leave(roomCode);

                console.log(`${socket.id} left room ${roomCode}`);
            }
        );

        socket.on(
            'disconnect',
            () => {

                console.log(`Socket disconnected: ${socket.id}`);
            }
        );
    });
}

module.exports = {
    registerSocketHandlers
};

//They're only there because Socket.IO rooms exist.Think of it this way:Room document=MongoDB thingSocket.IO room=Broadcast group When you do:socket.join(roomCode);you're telling Socket.IO: Whenever someone emits to ROOM123,send it only to people in ROOM123.Without that:io.emit(...)would send updates to every connected user on your entire server.