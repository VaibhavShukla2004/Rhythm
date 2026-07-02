const Game = require("../models/game.model");
const { skipTurn, completeGuessTimeoutTurn } = require("../services/game.orchestrator");
const { emitGameUpdated } = require("./socket.emitter");

// 1. START TIMERS: Just set the deadline in the database
async function startChooserTimer(gameId, maximumChoosingTime = 120000) { // default to 2 minutes if not provided
  const expiresAt = new Date(Date.now() + maximumChoosingTime); // 2 minutes from now
  await Game.findByIdAndUpdate(gameId, { 
    turnExpiresAt: expiresAt,
    timerType: 'choosing'
  });
}

async function startGuessTimer(gameId, maximumGuessingTime = 120000) { // default to 2 minutes if not provided
  const expiresAt = new Date(Date.now() + maximumGuessingTime); // 2 minutes from now
  await Game.findByIdAndUpdate(gameId, { 
    turnExpiresAt: expiresAt,
    timerType: 'guessing'
  });
}

// 2. CANCEL TIMER: Just clear the deadline
async function cancelTimer(gameId) {
  await Game.findByIdAndUpdate(gameId, { 
    turnExpiresAt: null,
    timerType: null
  });
}

// 3. THE BACKGROUND SWEEPER: Runs continuously in the background
function startTimerSweeper() {
  // Check every 2 seconds
  setInterval(async () => {
    try {
      const now = new Date();
      
      // Find all games where the timer has expired
      const expiredGames = await Game.find({
        gameState: "in-progress",
        turnExpiresAt: { $lte: now }, // $lte means "Less than or equal to" (Time is up!)
        timerType: { $ne: null }
      });

      for (const game of expiredGames) {
        // Immediately clear the timer so we don't process it twice
        const type = game.timerType;
        game.turnExpiresAt = null;
        game.timerType = null;
        await game.save();

        // Trigger the specific timeout logic
        if (type === 'choosing') {
          console.log(`[Timer] Chooser time up for game ${game._id}`);
          
          // Using orchestrator to handle the skip
          const { skipTurn } = require("../services/game.orchestrator");
          // You need the chooser's ID for your skipTurn function
          const chooser = game.players[game.currentTurnIndex];
          await skipTurn(game._id, chooser.playerId);

        } else if (type === 'guessing') {
          console.log(`[Timer] Guessing time up for game ${game._id}`);
          
          // Force everyone who is still "guessing" into "timed-out"
          game.players.forEach(player => {
             if (player.state === "guessing") {
                 player.state = "timed-out";
                 const stat = game.stats.find(s => s.playerId.toString() === player.playerId.toString());
                 if (stat) stat.totalGuessTimeMs += 120000;
             }
          });
          await game.save();
          emitGameUpdated(game.roomId, game);
          
          const { completeGuessTimeoutTurn } = require("../services/game.orchestrator");
          await completeGuessTimeoutTurn(game._id);
        }
      }
    } catch (error) {
      console.error("[Timer Sweeper Error]", error);
    }
  }, 2000); // 2000ms = 2 seconds
}

module.exports = { 
  startChooserTimer, 
  startGuessTimer, 
  cancelTimer,
  startTimerSweeper 
};