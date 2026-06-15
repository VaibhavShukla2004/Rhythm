const Game = require("../models/game.model");
const {getUnsyncedLyrics} = require("../services/song.service");
const CHOOSER_TIME_LIMIT = 120000;
const gameTimers = {};

//the methods are in flow
async function startGame(room) {//to set up game document-setting game to in-progress,putting in roomId and other stuff

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

async function startTurn(gameId) {//to just set chooser and his state to 

    const game = await Game.findById(gameId);
    if (!game) {
        throw new Error("Game not found");
    }

    if (game.gameState !== "in-progress") {
        throw new Error("Game not in progress");
    }

    const chooser = game.players[game.currentTurnIndex];//refernce to db.Finds who current chooser is

    chooser.state = "choosing-song";//sets state
    game.pendingTurn.startedAt =new Date();//temporary; to check if two mins are up or nah
    await game.save();
    
    clearTimeout(gameTimers[gameId]);//idk what this is yet.Will find out
    gameTimers[gameId] = setTimeout(() => {
        chooserTimedOut(gameId);
    },
    CHOOSER_TIME_LIMIT
);
    return game;
}

async function chooserTimedOut(gameId) {//just read it,pretty explainatory
    const game = await Game.findById(gameId);
    if (!game) {
        return;
    }

    game.currentTurnIndex++;

    if (game.currentTurnIndex >=game.players.length) {
        return endGame(gameId);
    }

    game.pendingTurn = {};
    game.players.forEach(player => {
        player.state = "stand-by";
    });

    await game.save();
    return startTurn(gameId);
}

async function submitSong(gameId,playerId,songTitle,artistName) {//chooser submits song

    const game = await Game.findById(gameId);

    if (!game) {
        throw new Error("Game not found");
    }

    const chooser =game.players[game.currentTurnIndex];

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

async function submitHint(gameId,playerId,playerHint) {//chooser submits hint

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
        throw new Error("Lyrics not found");
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

    const {songTitle,artistName,playerHint} = game.pendingTurn;//get this information so you can send it to lyrics and ai API

    try {

        game.pendingTurn.status ="generating";

        const lyrics = await fetchLyrics(songTitle,artistName);//first fetch lyrics

        const aiResponse =await generateAiHint(lyrics,playerHint);//send to ai

        game.pendingTurn.aiResponse = aiResponse;//save the ai response to display to guessers

        game.turns.push({
            chooserPlayerId:game.players[game.currentTurnIndex].playerId,
            songTitle,
            artistName,
            lyrics,
            playerHint,
            aiHint: aiResponse,
            status: "ready"
        });

        await game.save();
        clearTimeout(gameTimers[gameId]);
        return await startGuessingPhase(gameId);//Now call the startGuessingPhase if no errors

    } catch (error) {//else if errors

        game.pendingTurn.retryCount++;

        if (game.pendingTurn.retryCount < 3) {
            game.pendingTurn.status = "pending";
            await game.save();
            return await startTurn(gameId);//retyr again if you are within your limits to retry
        }

         game.currentTurnIndex++;//else bro just skip their turn now. Set pendingTurn to empty,
        if (game.currentTurnIndex >=game.players.length) {
       return await endGame(gameId);
}
        game.pendingTurn = {};

        await game.save();

        return await startTurn(gameId);
    }
}

async function startGuessingPhase(gameId) {//initially all guessers in "stand-by" now they are in guessing

    const game = await Game.findById(gameId);
    const chooserId =game.players[game.currentTurnIndex].playerId.toString();
    game.players.forEach(player => {

        if (player.playerId.toString() ===chooserId) {
            player.state = "stand-by";
        } else {
            player.state = "guessing";
        }
    });
    await game.save();
    return game;
}

async function submitGuess(gameId,playerId,guessedSong,guessedArtist) {
    const game = await Game.findById(gameId);
    const player =game.players.find(
            player =>
                player.playerId.toString() === playerId.toString()
        );
    if (!player) {//these are just checks,the frontend would be made as such that these endpoints arent exposed
        throw new Error(
            "Player not found"
        );
    }
    if (player.state !== "guessing") {//same shit here.A guessed player wouldnt be able to submit shit
        throw new Error(
            "Player not guessing"
        );
    }
    const currentTurn = game.turns[game.turns.length - 1];
    const songMatches =guessedSong.trim().toLowerCase() ===currentTurn.songTitle.trim().toLowerCase();
    const artistMatches =guessedArtist.trim().toLowerCase() ===currentTurn.artistName.trim().toLowerCase();

    if (songMatches &&artistMatches) {//only if you guess correctly
        player.state = "guessed";
        const stat = game.stats.find(
                stat =>
                    stat.playerId.toString() === playerId.toString()
            );

        if (stat) {//your stats updated
            stat.guessesCorrect += 1;
        }

        await game.save();//saved
        return completeTurn(gameId);//then checked if everybody is done yet so we can start next turn
    }
    return {correct: false};
}

async function completeTurn(gameId) {//this satisfies the test case where people finish before time
    const game = await Game.findById(gameId);
    const allDone = game.players.every(player => {

            const isChooser = player.playerId.toString() === game.players[game.currentTurnIndex].playerId.toString();

            if (isChooser) {
                return true;
            }

            return (player.state ==="guessed");
        });

    if (!allDone) {
        return game;
    }

    game.currentTurnIndex++;//if everybody done,then start next turn

    if (game.currentTurnIndex >=game.players.length) {
        return endGame(gameId);
    }
    game.players.forEach(player => {
        player.state = "stand-by";
    });

    await game.save();
    return startTurn(gameId);
}
module.exports = {
    startGame
};