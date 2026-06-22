//create io, store io and export io
const { Server } = require('socket.io');

let io;

function initializeSocket(server) {

    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    return io;
}

function getIo() {

    if (!io) {
        throw new Error(
            'Socket.IO not initialized'
        );
    }

    return io;
}

module.exports = {
    initializeSocket,
    getIo
};