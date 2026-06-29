const express = require("express");
const router = express.Router();

const roomController = require("../controllers/room.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/create", authMiddleware, roomController.createRoom);

router.get("/:roomCode", authMiddleware, roomController.getRoomDetails);

router.post("/join", authMiddleware, roomController.joinRoom);

router.post("/leave", authMiddleware, roomController.leaveRoom);

router.post("/transfer-host",authMiddleware,roomController.transferHost);

router.post("/start-game",authMiddleware,roomController.startGame);
router.post("/finish-game/:roomCode",authMiddleware,roomController.finishGame);
module.exports = router;