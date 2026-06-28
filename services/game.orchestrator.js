const roomService = require('../services/room.service');
const gameService = require('../services/game.service');
const Game = require('../models/game.model');
const {emitGameUpdated} = require('../utils/socketEmitter');
// const timerManager = require('../utils/timerManager');

exports.handleGameStart = async (roomCode, userId) => {
    console.log('[game.orchestrator] handleGameStart called with', { roomCode, userId });
    const { room, game } = await roomService.startGame(roomCode, userId);//calling roomService.startGame() which calls gameService.startGame() which returns back doc. After this players are all "stand-by",so states emitted.
    emitGameUpdated(game.roomId, game);
    await startNextTurn(game._id);
};

async function startNextTurn(gameId) {
    console.log('[game.orchestrator] startNextTurn called with', { gameId });
    const game = await gameService.startTurn(gameId);

    emitGameUpdated(game.roomId, game);
    // everybody after here is either "choosing-song" or standby. Orchestrator's handleGameStart stops here.

    // timerManager.startChooserTimer(gameId);

    return game;
}

exports.startNextTurn = startNextTurn;

exports.handleSongSubmission = async (gameId, playerId, songTitle, artistName) => {//only handles in-time and correct submissions.Frontend wont allow incorrect format,and out of time submissions handle by expiry logic and our submit guess already wont allow anybdy else to submit once index shifts(handles lag edge case)
    console.log('[game.orchestrator] handleSongSubmission called with', { gameId, playerId, songTitle, artistName });
    const game = await gameService.submitSong(gameId, playerId, songTitle, artistName);

    // SOCKET.IO
    emitGameUpdated(game.roomId, game);
    // emit game-state-updated
    // chooser now sees hint page others remain standby

    // TIMER LOGIC(we are not planning on implementing it here)
    // cancel chooser-song timer
    // start chooser-hint timer

    return game;
};

exports.handleHintSubmission = async (gameId, playerId, playerHint) => {
    console.log('[game.orchestrator] handleHintSubmission called with', { gameId, playerId, playerHint });
    // timerManager.cancelTimer(gameId);
    const game = await gameService.submitHint(gameId, playerId, playerHint);

    // SOCKET.IO
    emitGameUpdated(game.roomId, game);//standy-by for all

    try {
        await gameService.createTurn(gameId);

        const guessingGame = await gameService.startGuessingPhase(gameId);

        // SOCKET.IO
        emitGameUpdated(guessingGame.roomId, guessingGame);
        // people shown their song-guessing states accordingly

        // TIMER
        // timerManager.startGuessTimer(gameId);

        return guessingGame;
    } catch (error) {
        console.log('[game.orchestrator] handleHintSubmission error', error);
        const failedGame = await Game.findById(gameId);

        failedGame.pendingTurn.status = 'failing';

        await failedGame.save();

        // SOCKET.IO
        emitGameUpdated(failedGame.roomId, failedGame);//a page displayed where retry and skip turn buttons can be displayed.

        return failedGame;
    }
};

exports.retryTurn = async (gameId, playerId) => {
    console.log('[game.orchestrator] retryTurn called with', { gameId, playerId });
    const game = await Game.findById(gameId);

    const chooserId = game.players[game.currentTurnIndex].playerId;

    if (chooserId.toString() !== playerId.toString()) {
        throw new Error('Only chooser can retry');
    }

    if (game.pendingTurn.status !== 'failing') {
        throw new Error('Turn is not failing');
    }

    //game.pendingTurn.status = 'pending';

    await game.save();

    return startNextTurn(gameId);
};

exports.skipTurn = async (gameId, playerId) => {
    console.log('[game.orchestrator] skipTurn called with', { gameId, playerId });
    const game = await Game.findById(gameId);

    const chooserId = game.players[game.currentTurnIndex].playerId;

    if (chooserId.toString() !== playerId.toString()) {
        throw new Error('Only chooser can skip');
    }

    game.currentTurnIndex++;

    if (game.currentTurnIndex >= game.players.length) {
        // timerManager.cancelTimer(gameId);
        const finishedGame = await gameService.endGame(gameId);
        console.log("finished game", finishedGame.finalResults);
        emitGameUpdated(finishedGame.roomId, finishedGame);
        return finishedGame;
    }

    game.pendingTurn = {};

    await game.save();

    return startNextTurn(gameId);
};

exports.handleGuessSubmission = async (gameId, playerId, guessedSong, guessedArtist) => {
    console.log('[game.orchestrator] handleGuessSubmission called with', { gameId, playerId, guessedSong, guessedArtist });
    const result = await gameService.submitGuess(gameId, playerId, guessedSong, guessedArtist);

    if (!result.correct) {
        return result.game;
    }

    // SOCKET.IO
    emitGameUpdated(result.game.roomId, result.game);
    const turnResult = await gameService.completeTurn(gameId);

    if (!turnResult.allDone) return turnResult.game;
    // timerManager.cancelTimer(gameId);
    const game = turnResult.game;

    game.currentTurnIndex++;

    if (game.currentTurnIndex >= game.players.length) {
        // timerManager.cancelTimer(gameId);
        const finishedGame = await gameService.endGame(gameId);
        console.log("finished game", finishedGame.finalResults);
        emitGameUpdated(finishedGame.roomId, finishedGame);
        return finishedGame;
    }

    game.players.forEach(player => {
        player.state = 'stand-by';
    });

    await game.save();
    return await startNextTurn(gameId);
};

exports.completeGuessTimeoutTurn = async (gameId) => {
    console.log('[game.orchestrator] completeGuessTimeoutTurn called with', { gameId });
    const turnResult = await gameService.completeTurn(gameId);

    if (!turnResult.allDone) return turnResult.game;

    const game = turnResult.game;

    game.currentTurnIndex++;

    if (game.currentTurnIndex >= game.players.length) {
        // // timerManager.cancelTimer(gameId);
        const finishedGame = await gameService.endGame(gameId);
        console.log("finished game", finishedGame.finalResults);
        emitGameUpdated(finishedGame.roomId, finishedGame);
        return finishedGame;
    }

    game.players.forEach(
        player => {
            player.state = 'stand-by';
        }
    );

    await game.save();

    return startNextTurn(gameId);
};
