const songService = require('../services/song.service');

exports.getUnsyncedLyrics = async (req, res) => {
  try {
    const { track_name , artist_name} = req.query;

    if(!track_name || !artist_name){
      return res.status(400).json({
        message: 'track name and artist name required'
      });
    }

    const lyrics = await songService.getUnsyncedLyrics(track_name,artist_name);

    if (!lyrics) {
      return res.status(404).json({
        message: 'Lyrics not found'
      });
    }
    
    res.json(lyrics);
  }catch(err){
    res.status(500).json({message : 'Failed to fetch Lyrics' });
  }
};