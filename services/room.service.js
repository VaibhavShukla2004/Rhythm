const Room = require("../models/room.model");

async function generateRoomCode() {

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    while (true) {//keeps on trying until unique code

        let code = "";

        for (let i = 0; i < 6; i++) {
            code += chars.charAt(
                Math.floor(Math.random() * chars.length) 
            );//math.floor() rounds DOWN a number
        }

        const existingRoom = await Room.findOne({
            roomCode: code
        });

        if (!existingRoom) {
            return code;
        }
    }
}
//1.Generate room code 2.Create room-Add host to players[],Set expiry 3.Return room
async function createRoom(hostId, maxPlayers) {

    const roomCode = await generateRoomCode();
    if (maxPlayers < 2 || maxPlayers > 10) {
    throw new Error("Invalid room size");
}
    const expiresAt = new Date(
        Date.now() + 10 * 60 * 1000
    );

    const room = await Room.create({
        roomCode,
        hostId,
        players: [
            {
                userId: hostId
            }
        ],
        maxPlayers,
        expiresAt
    });//no need to manually pass stuff that model already sets for us

    return room;
}

async function getRoomDetails(roomCode) {//shld be available to players during active state of room

    const room = await Room.findOne({
        roomCode
    }).populate("players.userId", "name");//populate fetches details from ref table if fields are not specified. Sicne name is specified here,it fetches only name

    if (!room) {
        throw new Error("Room not found");
    }

    return room;
}
//1. Room exists? 2.Game already started? 3.Room full? 4.Room expired? 5.Already joined?
async function joinRoom(roomCode, userId) {

    const room = await Room.findOne({
        roomCode
    });

    if (!room) {
        throw new Error("Room not found");
    }

    if (room.gameStatus !== "in-progress") {
        throw new Error("Game already started");
    }

    if (room.players.length >= room.maxPlayers) {
        throw new Error("Room is full");
    }
    const alreadyJoined = room.players.some(
        player =>
            player.userId.toString() === userId.toString()//.some() loops through it and returns true if any item matches the condition.room.players is the array,for players as room.players it checks. Analogous to java stream
    );//loops through all players in room to check if user is already in room. toString() is used to compare ObjectIds as strings

    if (alreadyJoined) {
        throw new Error("Already in room");
    }

    room.players.push({
        userId
    });

    await room.save();

    return room;
}

async function transferHost(roomCode, newHostId = null) {

    const room = await Room.findOne({
        roomCode
    });

    if (!room) {
        throw new Error("Room not found");
    }

    if (room.gameStatus === "in-progress") {
        throw new Error("Cannot transfer host during game");
    }

    // Automatic transfer
    if (!newHostId) {

        if (room.players.length === 0) {
            throw new Error("No players left");
        }

        const oldestPlayer = room.players.reduce(
            (oldest, current) =>
                current.joinedAt < oldest.joinedAt
                    ? current
                    : oldest
        );

        room.hostId = oldestPlayer.userId;

        await room.save();

        return room;
    }

    // Manual transfer
    const playerExists = room.players.some(
        player =>
            player.userId.toString() ===
            newHostId.toString()
    );

    if (!playerExists) {
        throw new Error(
            "New host must be in room"
        );
    }

    room.hostId = newHostId;

    await room.save();

    return room;
}