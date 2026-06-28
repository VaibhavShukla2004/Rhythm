const express = require("express");
const router = express.Router();

const aiController = require("../controllers/ai.controller");
const { aiLimiter } = require("../middlewares/rateLimiter.middleware");

router.use(aiLimiter);

router.post("/modify-lyrics", aiController.modifyLyrics);

module.exports = router;
