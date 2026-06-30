const roomService = require('../services/room.service');
const gameOrchestrator = require('../services/game.orchestrator'); 
exports.createRoom = async (req, res, next) => {
    try {
        const { maxPlayers } = req.body;

        const room = await roomService.createRoom(req.user.userId,maxPlayers);
        res.status(201).json(room);//sets status to 201(created),and then sends a json of the room back to whoever made the request. Eg-frontend,postman,wtv
    } catch (err) {
        next(err);
    }
};

exports.getRoomDetails = async (req, res, next) => {
    try {
        const room = await roomService.getRoomDetails(req.params.roomCode);
        res.json(room);
    } catch (err) {
        next(err);
    }
};

exports.joinRoom = async (req, res, next) => {
    try {
        const { roomCode } = req.body;

        const room = await roomService.joinRoom(roomCode,req.user.userId);
        res.json(room);
    } catch (err) {
        next(err);
    }
};

exports.leaveRoom = async (req, res, next) => {
    try {
        const { roomCode } = req.body;

        const room = await roomService.leaveRoom(roomCode,req.user.userId);
        res.json(room);
    } catch (err) {
        next(err);
    }
};

exports.transferHost = async (req, res, next) => {
    try {
        const { roomCode, newHostId } = req.body;

        const room = await roomService.transferHost(roomCode,newHostId,req.user.userId);
        res.json(room);
    } catch (err) {
        next(err);
    }
};

exports.startGame=async (req, res, next)=> {

    try {

        //was req.params.roomCode but changed to req.body.roomCode because the roomCode is now being sent in the body of the request instead of as a URL parameter. 
        //This change was made to accommodate the new frontend design where the roomCode is part of the request body when starting a game.
        const { roomCode } = req.body;

        const userId = req.user.userId;

        const game = await gameOrchestrator.handleGameStart(roomCode,userId);

        res.status(201).json({
            success: true,
            message: 'Game started successfully',
            game,
        });

    } catch (error) {
        next(error);
    }
}

exports.finishGame = async (req, res, next) => {

    try {

        const { roomCode } = req.params;

        const userId = req.user.userId;

        await gameOrchestrator.handleFinishGame(roomCode,userId);

        res.status(200).json({
            success: true,
            message: "Game finished successfully."
        });

    } catch (error) {
        next(error);
    }
};

// module.exports = {
//startGame,createRoom,transferHost,leaveRoom,joinRoom,getRoomDetails
// };