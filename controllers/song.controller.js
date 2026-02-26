const songService = require('../services/song.service');

exports.getUnsyncedLyrics = async (req, res) => {
  try {
    const lyrics = await songService.getUnsyncedLyrics();
    res.json(lyrics);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch lyrics' });
  }
};