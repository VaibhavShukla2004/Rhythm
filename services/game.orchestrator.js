const roomService = require("../services/room.service");
const gameService = require("../services/game.service");
const profileService = require("../services/profile.service");
const Game = require("../models/game.model");
const { emitGameUpdated } = require("../utils/socket.emitter");
//const timerManager =require('../utils/timerManager');

exports.handleGameStart = async (roomCode, userId) => {
  //validates everything,creates game doc,emits event so that for everybody,the stand-by page is displayed
  const { room, game } = await roomService.preGameValidation(roomCode, userId); //calling roomService.startGame() which calls gameService.startGame() which returns back doc. After this players are all "stand-by",so states emitted.
  emitGameUpdated(game.roomId, game); //this is so that frontend gets reflected for everyone,when only host clicks startGame
  await handleTurnStart(game._id);
};

const handleTurnStart = async (gameId) => {
  const game = await gameService.startTurn(gameId); //finds chooser and sets his state
  emitGameUpdated(game.roomId, game);
  // everybody after here is either "choosing-song" or standby. Orchestrator's handleGameStart stops here.

  //timerManager.startChooserTimer(gameId);

  return game;
};

exports.handleTurnStart = handleTurnStart;

exports.handleSongSubmission = async (
  gameId,
  playerId,
  songTitle,
  artistName,
) => {
  //only handles in-time and correct submissions.Frontend wont allow incorrect format,and out of time submissions handle by expiry logic and our submit guess already wont allow anybdy else to submit once index shifts(handles lag edge case)
  console.log("[game.orchestrator] handleSongSubmission called with", {
    gameId,
    playerId,
    songTitle,
    artistName,
  });
  const game = await gameService.submitSong(
    gameId,
    playerId,
    songTitle,
    artistName,
  );

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
  //timerManager.cancelTimer(gameId);
  const game = await gameService.submitHint(gameId, playerId, playerHint);

  // SOCKET.IO
  emitGameUpdated(game.roomId, game); //standy-by for all,but "generating" state will render the generating page

  try {
    await gameService.createTurn(gameId);

    const guessingGame = await gameService.startGuessingPhase(gameId);

    emitGameUpdated(guessingGame.roomId, guessingGame);
    // people shown the page of song-guessing state accordingly

    // TIMER
    //timerManager.startGuessTimer(gameId);

    return guessingGame;
  } catch (error) {
    console.log(error);
    const failedGame = await Game.findById(gameId);

    failedGame.pendingTurn.status = "failing";

    await failedGame.save();

    // SOCKET.IO
    emitGameUpdated(failedGame.roomId, failedGame); //a page displayed where retry and skip turn buttons can be displayed.

    return failedGame;
  }
};

exports.retryTurn = async (gameId, playerId) => {
  const chooserId = game.players[game.currentTurnIndex].playerId;

  if (chooserId.toString() !== playerId.toString()) {
    throw new Error("Only chooser can retry");
  }

  if (game.pendingTurn.status !== "failing") {
    throw new Error("Turn is not failing");
  }

  //game.pendingTurn.status ="pending";
  game.pendingTurn = {};
  await game.save();

  return handleTurnStart(gameId);
};

exports.skipTurn = async (gameId, playerId) => {
  const game = await Game.findById(gameId);

  const chooserId = game.players[game.currentTurnIndex].playerId;

  if (chooserId.toString() !== playerId.toString()) {
    throw new Error("Only chooser can skip");
  }

  game.currentTurnIndex++;

  if (game.currentTurnIndex >= game.players.length) {
    // timerManager.cancelTimer(gameId);
    const finishedGame = await gameService.endGame(gameId);
    console.log(finishedGame.finalResults);
    emitGameUpdated(finishedGame.roomId, finishedGame);
    return finishedGame;
  }

  game.pendingTurn = {};

  await game.save();

  return handleTurnStart(gameId);
};

exports.handleGuessSubmission = async (
  gameId,
  playerId,
  guessedSong,
  guessedArtist,
) => {
  const result = await gameService.submitGuess(
    gameId,
    playerId,
    guessedSong,
    guessedArtist,
  );

  if (!result.correct) {
    return result.game;
  }

  // SOCKET.IO
  emitGameUpdated(result.game.roomId, result.game);
  const turnResult = await gameService.completeTurn(gameId);

  if (!turnResult.allDone) return turnResult.game;
  //timerManager.cancelTimer(gameId);
  const game = turnResult.game;

  game.currentTurnIndex++;

  if (game.currentTurnIndex >= game.players.length) {
    //timerManager.cancelTimer(gameId);
    const finishedGame = await gameService.endGame(gameId);
    console.log(finishedGame.finalResults);
    emitGameUpdated(finishedGame.roomId, finishedGame);
    return finishedGame;
  }

  game.players.forEach((player) => {
    player.state = "stand-by";
  });

  await game.save();
  return await handleTurnStart(gameId);
};

exports.completeGuessTimeoutTurn = async (gameId) => {
  const turnResult = await gameService.completeTurn(gameId);

  if (!turnResult.allDone) return turnResult.game;

  const game = turnResult.game;

  game.currentTurnIndex++;

  if (game.currentTurnIndex >= game.players.length) {
    //timerManager.cancelTimer(gameId);
    const finishedGame = await gameService.endGame(gameId);
    console.log(finishedGame.finalResults);
    emitGameUpdated(finishedGame.roomId, finishedGame);
    return finishedGame;
  }

  game.players.forEach((player) => {
    player.state = "stand-by";
  });

  await game.save();

  return handleTurnStart(gameId);
};

async function handleFinishGame(roomCode, userId) {
  // Validate everything first
  const { room, game } = await roomService.validateFinishGame(roomCode, userId);

  // Persist player stats
  await profileService.updateProfiles(game);

  // Notify everyone
  await emitGameUpdated(game.roomId, null); ////when frontend sees null,it navigates users to homepage,cuz only the host clicks this button but other players need to be navigated to the homepage automatically too
  // Delete runtime game state
  await gameService.deleteGame(game._id);

  // Delete room
  await roomService.deleteRoom(roomCode);

  return;
}

module.exports = {
  handleGameStart: exports.handleGameStart,
  handleTurnStart,
  handleSongSubmission: exports.handleSongSubmission,
  handleHintSubmission: exports.handleHintSubmission,
  retryTurn: exports.retryTurn,
  skipTurn: exports.skipTurn,
  handleGuessSubmission: exports.handleGuessSubmission,
  completeGuessTimeoutTurn: exports.completeGuessTimeoutTurn,
  handleFinishGame,
};
