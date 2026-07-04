const Game = require("../models/game.model");
const { emitGameUpdated } = require("./socket.emitter");
// 1. START TIMERS: Just set the deadline in the database
async function startChooserTimer(gameId) { // default to 3 minutes if not provided
  console.log("Starting chooser timer for game:", gameId);
  let num=0;
   setInterval(async () => {
      num=num+1;
      console.log(num+" seconds passed");
  }, 1000);

  const expiresAt = new Date(Date.now() + 180000); // 3 minutes from now
  await Game.findByIdAndUpdate(gameId, { 
    turnExpiresAt: expiresAt,
    timerType: 'choosing'
  });
}

async function startGuessTimer(gameId, maximumGuessingTime = 180000) { // default to 3 minutes if not provided
  console.log("Starting guess timer for game:", gameId);
    let num=0;
   setInterval(async () => {
      num=num+1;
      console.log(num+" seconds passed");
  }, 1000);

  const expiresAt = new Date(Date.now() + maximumGuessingTime); // 3 minutes from now
  await Game.findByIdAndUpdate(gameId, { 
    turnExpiresAt: expiresAt,
    timerType: 'guessing'
  });
}

// 2. CANCEL TIMER: Just clear the deadline
async function cancelTimer(gameId) {
  console.log("Canceling timer for game:", gameId);
  await Game.findByIdAndUpdate(gameId, { 
    turnExpiresAt: null,
    timerType: null
  });
}

// 3. THE BACKGROUND SWEEPER: Runs continuously in the background
function startTimerSweeper() {
  console.log("[Timer Sweeper] Started");
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
          
          // Defer requiring orchestrator to runtime to avoid circular require
          const { chooserTimeoutCleanup } = require("../services/game.orchestrator");
          // You need the chooser's ID for your skipTurn function
          const chooser = game.players[game.currentTurnIndex];
          await chooserTimeoutCleanup(game._id);

        } else if (type === 'guessing') {
          console.log(`[Timer] Guessing time up for game ${game._id}`);
          
          // Force everyone who is still "guessing" into "timed-out"
          game.players.forEach(player => {
             if (player.state === "guessing") {
                 player.state = "timed-out";
                 const stat = game.stats.find(s => s.playerId.toString() === player.playerId.toString());
                 if (stat) stat.totalGuessTimeMs += 180000;
             }
          });
          await game.save();
          emitGameUpdated(game.roomId, game);
          
          // Defer requiring orchestrator to runtime to avoid circular require
          const { guesserTimeoutCleanup } = require("../services/game.orchestrator");
          await guesserTimeoutCleanup(game._id);
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