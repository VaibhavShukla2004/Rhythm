const express = require("express");
const router = express.Router();

const gameController=require("../controllers/game.controller");
const authMiddleware = require("../middlewares/auth.middleware"); 

router.post("/submit-Song", authMiddleware, gameController.submitSong);

router.post("/submit-Hint", authMiddleware, gameController.submitHint);

router.post("/submit-Guess", authMiddleware, gameController.submitGuess);

router.post("/retry-Turn", authMiddleware, gameController.retryTurn);

router.post("/skip-Turn", authMiddleware, gameController.skipTurn);

module.exports = router;