const Game = require("../models/game.model");
const {getUnsyncedLyrics} = require("../services/song.service");

async function initiateGame(room) {

    const players = room.players.map(player => ({
        playerId: player.userId//basically we are transforming the array of objects(hashmap) and transforming into an array which consists of multiple hashmaps of 1 indice-each of these indices map playerId to userid(do playerId=userId). .map() initially transforms the og array usinga  copy and returns it,og array not affected.
    }));

    const stats = room.players.map(player => ({//When this copy is inserted into game,the playerId part is validated against schema,for each id(object in the transformed array stats) eg [{ playerId: ObjectId("507f1f77bcf86cd799439011"), state: "stand-by", guessStartedAt: null, guessedAt: null }, { playerId: ObjectId("507f1f77bcf86cd799439012")...  
        playerId: player.userId
    }));

    const game = await Game.create({//saves it to db
        roomId: room._id,

        gameState: "in-progress",

        roundNumber: 0,
        currentTurnIndex: 0,

        players,
        stats
    });

    return game;//the game document goes to room.service.startGame.
}

async function startGame(gameId) {

    const game = await Game.findById(gameId);

    if (!game) {
        throw new Error("Game not found");
    }

    if (game.gameState !== "in-progress") {
        throw new Error("Game not in progress");
    }

    const chooser =
        game.players[game.currentTurnIndex];//refernce to db

    chooser.state = "choosing-song";

    await game.save();

    return game;
}

async function submitSong(gameId,playerId,songTitle,artistName) {

    const game = await Game.findById(gameId);

    if (!game) {
        throw new Error("Game not found");
    }

    const chooser =
        game.players[game.currentTurnIndex];

    if (
        chooser.playerId.toString() !==
        playerId.toString()
    ) {
        throw new Error(
            "Only current chooser can submit song"
        );
    }

    if (
        chooser.state !== "choosing-song"
    ) {
        throw new Error(
            "Player not in choosing-song state"
        );
    }

    game.pendingTurn.songTitle =songTitle;
    game.pendingTurn.artistName =artistName;
    chooser.state ="choosing-hint";

    await game.save();

    return game;
}

async function submitHint(gameId,playerId,playerHint) {

    const game = await Game.findById(gameId);

    if (!game) {
        throw new Error("Game not found");
    }

    const chooser =
        game.players[game.currentTurnIndex];

    if (
        chooser.playerId.toString() !==
        playerId.toString()
    ) {
        throw new Error(
            "Only current chooser can submit hint"
        );
    }

    if (
        chooser.state !== "choosing-hint"
    ) {
        throw new Error(
            "Player not in choosing-hint state"
        );
    }

    if (!playerHint) {
        throw new Error(
            "Hint is required"
        );
    }
    game.pendingTurn.playerHint = playerHint;
    game.pendingTurn.status ="pending";

    await game.save();

    return game;
}

async function fetchLyrics(songTitle,artistName) {
    const lyrics =await getUnsyncedLyrics(songTitle,artistName);

    if (!lyrics) {
        throw new Error(
            "Lyrics not found"
        );
    }

    return lyrics;
}

async function generateAiHint(lyrics,playerHint) {

    // TODO:
    // Call AI API

    return "Dummy AI Hint";
}

async function createTurn(gameId) {

    const game = await Game.findById(gameId);

    if (!game) {
        throw new Error("Game not found");
    }

    const {songTitle,artistName,playerHint} = game.pendingTurn;

    try {

        game.pendingTurn.status ="generating";

        const lyrics =
            await fetchLyrics(
                songTitle,
                artistName
            );

        const aiHint =
            await generateAiHint(
                lyrics,
                playerHint
            );

        game.turns.push({
            chooserPlayerId:game.players[game.currentTurnIndex].playerId,
            songTitle,
            artistName,
            lyrics,
            playerHint,
            aiHint,
            status: "ready"
        });

        game.pendingTurn = {};

        await game.save();

        return game;

    } catch (error) {

        game.pendingTurn.retryCount += 1;

        if (
            game.pendingTurn.retryCount >= 3
        ) {
            await nextTurn(game._id);
        }

        await game.save();

        throw error;
    }
}
module.exports = {
    startGame
};