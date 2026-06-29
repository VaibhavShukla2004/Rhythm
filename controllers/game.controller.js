const gameOrchestrator = require('../services/game.orchestrator.js');

exports.submitSong = async (req,res,next) => {

    try {
        const { gameId } =req.params;
        console.log(gameId);
        const {songTitle,artistName} = req.body;

        const playerId =req.user.userId;

        const game =await gameOrchestrator.handleSongSubmission(gameId,playerId,songTitle,artistName);

        res.status(200).json({
            success: true,
            message:
            "Song submitted successfully",
            game
        });

    } catch (error) {
        next(error);
    }
};

exports.submitHint = async (req,res,next) => {

    try {

        const { gameId,playerHint } =req.body;

        const playerId =req.user.userId;

        const game = await gameOrchestrator.handleHintSubmission(gameId,playerId,playerHint);

        res.status(200).json({
            success: true,
            message:
                "Hint submitted successfully",
            game
        });

    } catch (error) {
        next(error);
    }
};

exports.submitGuess = async (req,res,next) => {

    try {


        const {gameId,guessedSong,guessedArtist} = req.body;

        const playerId =req.user.userId;
        //console.log(playerId);
        const game =await gameOrchestrator.handleGuessSubmission(gameId,playerId,guessedSong,guessedArtist);

        res.status(200).json({
            success: true,
            game
        });

    } catch (error) {

        next(error);

    }
};

exports.retryTurn=async(req,res,next)=> {

    try {

        const game =await gameOrchestrator.retryTurn(req.params.gameId,req.user.userId);

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

