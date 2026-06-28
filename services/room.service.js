const Room = require("../models/room.model");
const gameService = require("./game.service");

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
const alreadyHostInAnotherRoom = await Room.findOne({
    hostId
});

if (alreadyHostInAnotherRoom) throw new Error("You are already hosting a room");

    const roomCode = await generateRoomCode();
    if (maxPlayers < 2 || maxPlayers > 10) {
    throw new Error("Invalid room size");
}
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const room = await Room.create({
        roomCode,
        hostId,
        players: [
            {
                userId: hostId//host automatically added to players after creating room
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
        throw new Error("Room details not found");
    }

    return room;
}
//1. Room exists? 2.Game already started? 3.Room full? 4.Room expired? 5.Already joined?
async function joinRoom(roomCode, userId) {//room expiry logic is left

    const room = await Room.findOne({
        roomCode
    });

    if (!room) {
        throw new Error("Room not found");
    }

    if (room.gameStatus === "in-progress") {
        throw new Error("Game already started");
    }
    const alreadyJoined = room.players.some(
        player =>
            player.userId.toString() === userId.toString()//.some() loops through it and returns true if any item matches the condition.room.players is the array,for players as room.players it checks. Analogous to java stream
    );//loops through all players in room to check if user is already in room. toString() is used to compare ObjectIds as strings

    if (alreadyJoined) {
        throw new Error("Already in room");
    }
    if (room.players.length >= room.maxPlayers) {
        throw new Error("Room is full");
    }


    room.players.push({
        userId
    });

    await room.save();

    return room;
}
//yet to understand stuff from here. Its pretty interesting so far,the room feature shld be done in another day
async function transferHost(roomCode, newHostId = null,currentUserId = null) {//the params are thought for a manual transfer

    const room = await Room.findOne({
        roomCode
    });

    if (!room) {
        throw new Error("Room not found");
    }

    if (room.gameStatus === "in-progress") {
        throw new Error("Cannot transfer host during game");
    }

    // Automatic transfer(called during leaveRoom())
    if (!newHostId) {
     console.log("What about here?");
     if (room.players.length === 0) {

    ///room.roomStatus = "ended";//means we are deleting room right away after last player leaves,for now

    await room.save();

    // Later:
    // transfer stats
    // delete room

    return null;
}

        const oldestPlayer = room.players.reduce(//basically checking if(player[i].joinedAt < oldest.joinedAt) then oldest = player[i] 
            (oldest, current) =>
                current.joinedAt < oldest.joinedAt
                    ? current
                    : oldest
        );

        room.hostId = oldestPlayer.userId;
        console.log(room.hostId);
        await room.save();

        return room;
    }

    // Manual transfer
if (room.hostId.toString() !==currentUserId.toString()) {
    throw new Error("Only host can transfer host");
}

const newHostExists = room.players.some(
    player =>player.userId.toString() ===newHostId.toString());

    if (!newHostExists) {
        throw new Error("New host must be in room");
    }

    room.hostId = newHostId;

    await room.save();

    return room;
}

async function leaveRoom(roomCode, userId) {

    const room = await Room.findOne({
        roomCode
    });

    if (!room) {
        throw new Error("Room not found");
    }

    const playerExists = room.players.some(
        player =>player.userId.toString() ===userId.toString()
    );

    if (!playerExists) {
        throw new Error("Player not in room");
    }

    if (room.gameStatus === "in-progress") {
        throw new Error("Cannot leave room during game");
    }

    room.players = room.players.filter(//removes player where player.userId matches userId of leaver
        player =>player.userId.toString() !==userId.toString()
    );
    await room.save();   
    if (room.hostId.toString() ===userId.toString()) {
        await transferHost(roomCode);
        const updatedRoom = await Room.findOne({
        roomCode
    });//so as to not get stale data back

    return updatedRoom;
    }
    return room;
}
async function startGame(roomCode, userId) {
    const room = await Room.findOne({ roomCode });

    if (!room) throw new Error("Room not found");

    if (room.hostId.toString() !== userId.toString()) throw new Error("Only host can start game");

    if (room.gameStatus === "in-progress") throw new Error("Game already in progress");

    if (room.players.length < 2) {
        throw new Error("At least 2 players required");
    }

    const game = await gameService.startGame(room);

    room.gameStatus = "in-progress";
    await room.save();

    return {room,game};
}

module.exports={createRoom,getRoomDetails,joinRoom,transferHost,leaveRoom,startGame};