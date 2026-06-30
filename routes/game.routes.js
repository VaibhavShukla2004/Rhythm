const express = require("express");
const router = express.Router();
const { aiLimiter } = require("../middlewares/rateLimiter.middleware");
const gameController=require("../controllers/game.controller");
const authMiddleware = require("../middlewares/auth.middleware"); 

router.post("/submit-Song/:gameId", authMiddleware, gameController.submitSong);

router.post("/submit-Hint/:gameId", authMiddleware, aiLimiter, gameController.submitHint);

router.post("/submit-Guess/:gameId", authMiddleware, gameController.submitGuess);

router.post("/retry-Turn/:gameId", authMiddleware, gameController.retryTurn);

router.post("/skip-Turn/:gameId", authMiddleware, gameController.skipTurn);
router.post("/test-ai",gameController.callAi);
module.exports = router;