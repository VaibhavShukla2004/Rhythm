const express = require('express');
const router = express.Router();
const songController = require('../controllers/song.controller');
const authMiddleware  = require('../middlewares/auth.middleware');

// Protected route
router.get('/lyrics', authMiddleware ,songController.getUnsyncedLyrics);

module.exports = router;