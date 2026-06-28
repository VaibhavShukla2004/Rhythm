const express = require("express");
const router = express.Router();

const aiController = require("../controllers/ai.controller");

router.post("/generate-hint", aiController.generateHint);
router.post("/modify-lyrics", aiController.modifyLyrics);

module.exports = router;
