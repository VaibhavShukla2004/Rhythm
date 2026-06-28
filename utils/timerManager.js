const Game = require('../models/game.model');
const timers = new Map();

function cancelTimer(gameId) {

    const timer =timers.get(gameId.toString());

    if (timer) {
        clearTimeout(timer);
        timers.delete(gameId.toString());
    }
}

function startChooserTimer(gameId) {

    cancelTimer(gameId);
    const timer = setTimeout(async () => {
            await handleChooserTimeout(gameId);
        },
        120000
    );

    timers.set(gameId.toString(),timer);
}

function startGuessTimer(gameId) {

    cancelTimer(gameId);

    const timer = setTimeout(
        async () => {
            await handleGuessTimeout(gameId);
        },
        120000
    );

    timers.set(gameId.toString(),timer);
}

async function handleChooserTimeout(gameId) {

    const game =await Game.findById(gameId);

    if (!game)return;

    const chooser =game.players[game.currentTurnIndex];

    if (chooser.state !=='choosing-song' && chooser.state !=='choosing-hint')return;

    const {skipTurn} = require('../orchestrators/game.orchestrator');

    await skipTurn(gameId,chooser.playerId);
}

async function handleGuessTimeout(gameId) {

    const game =await Game.findById(gameId);

    if (!game) return;

    game.players.forEach(
        player => {

            if (player.state ==='guessing') {
                player.state ='timed-out';

                const stat =game.stats.find(stat =>stat.playerId.toString() ===player.playerId.toString());

                if (stat) {
                    stat.totalGuessTimeMs +=120000;
                }
            }
        }
    );

    await game.save();

    const {emitGameUpdated} = require('./socketEmitter');

    emitGameUpdated(game.roomCode,game);

    const {completeGuessTimeoutTurn} = require('../orchestrators/game.orchestrator');

    await completeGuessTimeoutTurn(gameId);
}

module.exports = {startChooserTimer,startGuessTimer,cancelTimer};