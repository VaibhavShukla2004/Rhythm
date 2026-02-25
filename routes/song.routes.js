const express = require('express');
const router = express.Router();
const songController = require('../controllers/song.controller');
const authenticate = require('../middlewares/auth.middleware');

router.get('/', authenticate, songController.getAllSongs);
router.get('/search', authenticate, songController.getSongByName);
router.get('/:id', authenticate, songController.getSongById);

module.exports = router;