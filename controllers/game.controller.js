const gameOrchestrator = require("../services/game.orchestrator.js");
const gameService = require("../services/game.service.js");
exports.submitSong = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    console.log(gameId);
    const { songTitle, artistName } = req.body;

    const playerId = req.user.userId;

    const game = await gameOrchestrator.handleSongSubmission(
      gameId,
      playerId,
      songTitle,
      artistName,
    );

    res.status(200).json({
      success: true,
      message: "Song submitted successfully",
      game,
    });
  } catch (error) {
    next(error);
  }
};

exports.submitHint = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { playerHint } = req.body;

    const playerId = req.user.userId;

    const game = await gameOrchestrator.handleHintSubmission(
      gameId,
      playerId,
      playerHint,
    );

    res.status(200).json({
      success: true,
      message: "Hint submitted successfully",
      game,
    });
  } catch (error) {
    next(error);
  }
};

exports.submitGuess = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { guessedSong, guessedArtist } = req.body;

    const playerId = req.user.userId;
    //console.log(playerId);
    const game = await gameOrchestrator.handleGuessSubmission(
      gameId,
      playerId,
      guessedSong,
      guessedArtist,
    );

    res.status(200).json({
      success: true,
      game,
    });
  } catch (error) {
    next(error);
  }
};

exports.retryChoice=async(req,res,next)=> {

    res.status(200).json(game);
  } catch (error) {
    next(error);
  }
};

        const game =await gameOrchestrator.retryChoice(req.params.gameId,req.user.userId);

        res.status(200).json(game);

    } catch (error) {
        next(error);
    }
}

exports.skipTurn=async (req,res,next)=> {

    try {
        const game =await gameOrchestrator.skipTurn(req.params.gameId,req.user.userId);

        res.status(200).json(game);

    } catch (error) {
        next(error);
    }
}

exports.callAi = async (req, res, next) => {
  try {
    const response = await gameService.generateAiResponse(
      "Never gonna give you up,never gonna let you down",
      "Exchange the places of up and down in this",
    );

    return res.status(200).json({ aiHint: response });
  } catch (error) {
    next(error);
  }
};
