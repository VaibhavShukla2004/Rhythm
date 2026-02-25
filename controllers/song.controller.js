const songService = require('../services/song.service');

exports.getAllSongs = async (req, res) => {
  const songs = await songService.getAllSongs();
  res.json(songs);
};

exports.getSongById = async (req, res) => {
  const song = await songService.getSongById(req.params.id);
  res.json(song);
};

exports.getSongByName = async (req, res) => {
  const song = await songService.getSongByName(req.query.name);
  res.json(song);
};